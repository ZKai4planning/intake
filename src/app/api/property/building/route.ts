export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { allow } from '@/lib/server/property/rateLimit'

/**
 * GET /api/property/building?lat=&lng=
 * ─────────────────────────────────────
 * The real outline of the house at a point, plus nearby roads, from
 * OpenStreetMap (Overpass API) — the same data the map tiles are drawn from.
 * The intake's live preview uses it to put the red "existing house" box on the
 * actual building and to work out which side faces the road.
 *
 * Returns { outline, neighbours, roads, plot } — `neighbours` are the other buildings within ~45 m,
 * used to check whether a proposed extension would run into next door. `plot` is the HM Land
 * Registry title boundary (via planning.data.gov.uk) containing the point, or null — used to check
 * whether the proposal sticks out beyond the registered plot. Indicative only.
 * Never errors for the UI: on any failure it returns outline: null and the
 * preview falls back to an estimated outline.
 */

type LL = { lat: number; lng: number }
interface OverpassWay {
  type: 'way'
  tags?: Record<string, string>
  geometry?: { lat: number; lon: number }[]
}

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]
interface Plot { ring: LL[]; areaM2: number; reference: string | null; attribution: string }
type Body = { outline: LL[] | null; neighbours: LL[][]; roads: LL[][]; plot: Plot | null }
const cache = new Map<string, { at: number; body: Body }>()
const TTL = 6 * 60 * 60 * 1000

const ll = (g: { lat: number; lon: number }[]): LL[] => g.map(p => ({ lat: p.lat, lng: p.lon }))

function inside(pt: LL, poly: LL[]): boolean {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j]
    if (a.lat > pt.lat !== b.lat > pt.lat && pt.lng < ((b.lng - a.lng) * (pt.lat - a.lat)) / (b.lat - a.lat) + a.lng) c = !c
  }
  return c
}

function centroidDist(pt: LL, poly: LL[]): number {
  const c = poly.reduce((s, p) => ({ lat: s.lat + p.lat / poly.length, lng: s.lng + p.lng / poly.length }), { lat: 0, lng: 0 })
  const dy = (c.lat - pt.lat) * 111_000
  const dx = (c.lng - pt.lng) * 111_000 * Math.cos((pt.lat * Math.PI) / 180)
  return Math.hypot(dx, dy)
}


// ── HM Land Registry title boundary (planning.data.gov.uk) ─────────────────────────────

/** Outer rings of a WKT POLYGON / MULTIPOLYGON as [lng, lat] pairs (holes ignored). */
function parseWktPolygons(wkt: unknown): number[][][] {
  if (typeof wkt !== 'string' || !/^\s*(MULTI)?POLYGON/i.test(wkt)) return []
  const s = wkt.slice(wkt.indexOf('('))
  let i = 0
  const parse = (): unknown[] => {
    const arr: unknown[] = []
    let buf = ''
    i++ // skip '('
    while (i < s.length) {
      const c = s[i]
      if (c === '(') { arr.push(parse()); continue }
      if (c === ')') { if (buf.trim()) arr.push(buf.trim()); i++; return arr }
      if (c === ',') { if (buf.trim()) arr.push(buf.trim()); buf = ''; i++; continue }
      buf += c; i++
    }
    return arr
  }
  const tree = parse()
  const polygons = (/^\s*MULTIPOLYGON/i.test(wkt) ? tree : [tree]) as unknown[][]
  return polygons
    .map(p => ((Array.isArray(p[0]) ? p[0] : []) as string[]).map(pt => String(pt).split(/\s+/).map(Number)).filter(c => c.length >= 2 && c.every(Number.isFinite)))
    .filter(r => r.length >= 4)
    .map(r => (r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1] ? r : [...r, r[0]]))
}

function inRing(lng: number, lat: number, ring: number[][]): boolean {
  let c = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j]
    if (a[1] > lat !== b[1] > lat && lng < ((b[0] - a[0]) * (lat - a[1])) / (b[1] - a[1]) + a[0]) c = !c
  }
  return c
}

function ringAreaM2(ring: number[][]): number {
  const lat0 = ring.reduce((s, p) => s + p[1], 0) / ring.length
  const kx = 111_320 * Math.cos((lat0 * Math.PI) / 180)
  let a = 0
  for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * kx * ring[i + 1][1] * 111_320 - ring[i + 1][0] * kx * ring[i][1] * 111_320
  return Math.abs(a / 2)
}

/** The smallest registered title containing the point (flats can share a title), or null. Never throws. */
async function findTitle(lat: number, lng: number): Promise<Plot | null> {
  try {
    const u = new URL('https://www.planning.data.gov.uk/entity.json')
    u.searchParams.set('dataset', 'title-boundary')
    u.searchParams.set('longitude', String(lng))
    u.searchParams.set('latitude', String(lat))
    u.searchParams.set('limit', '20')
    const res = await fetch(u, { signal: AbortSignal.timeout(10_000), cache: 'no-store', headers: { 'User-Agent': 'AI4Planning/1.0 (intake title boundary)' } })
    if (!res.ok) return null
    const data = (await res.json()) as { entities?: { geometry?: string; reference?: string; 'end-date'?: string }[] }
    const today = new Date().toISOString().slice(0, 10)
    const hits = (data.entities ?? [])
      .filter(e => !e['end-date'] || e['end-date'] > today)
      .flatMap(e => parseWktPolygons(e.geometry).map(ring => ({ ring, reference: e.reference ?? null })))
      .filter(c => inRing(lng, lat, c.ring))
      .map(c => ({ ...c, areaM2: ringAreaM2(c.ring) }))
      .sort((a, b) => a.areaM2 - b.areaM2)
    if (!hits.length) return null
    const t = hits[0]
    return {
      ring: t.ring.map(([lo, la]) => ({ lat: la, lng: lo })),
      areaM2: Math.round(t.areaM2),
      reference: t.reference,
      attribution: `Title boundaries © HM Land Registry, Crown copyright and database rights ${new Date().getFullYear()} (via planning.data.gov.uk). Indicative only.`,
    }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get('lat'))
  const lng = Number(req.nextUrl.searchParams.get('lng'))
  // UK only — also keeps this from being used as an open Overpass proxy.
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 49 || lat > 61 || lng < -9 || lng > 2.5) {
    return NextResponse.json({ outline: null, neighbours: [], roads: [], plot: null }, { status: 400 })
  }
  if (!allow('property-building', req, 30)) {
    return NextResponse.json({ outline: null, neighbours: [], roads: [], plot: null }, { status: 429 })
  }

  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL) return NextResponse.json(hit.body, { headers: { 'Cache-Control': 'private, max-age=3600' } })

  const query = `[out:json][timeout:12];
way(around:45,${lat},${lng})["building"];out geom;
way(around:70,${lat},${lng})["highway"]["highway"!~"footway|path|steps|cycleway|service|track|pedestrian|corridor|bridleway|proposed|construction"];out geom;`

  const plotPromise = findTitle(lat, lng) // runs alongside the Overpass request

  let ways: OverpassWay[] | null = null
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'AI4Planning/1.0 (intake building outline)' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(13_000),
        cache: 'no-store',
      })
      if (!res.ok) continue
      const json = (await res.json()) as { elements?: OverpassWay[] }
      ways = (json.elements ?? []).filter(e => e.type === 'way' && e.geometry && e.geometry.length >= 2)
      break
    } catch {
      /* try the next endpoint */
    }
  }

  const plot = await plotPromise
  if (!ways) return NextResponse.json({ outline: null, neighbours: [], roads: [], plot: null })

  const here: LL = { lat, lng }
  const buildings = ways.filter(w => w.tags?.building && w.geometry!.length >= 4).map(w => ll(w.geometry!))
  const roads = ways.filter(w => w.tags?.highway).map(w => ll(w.geometry!)).slice(0, 25)

  // The building the point is inside, else the nearest one.
  const outline =
    buildings.find(b => inside(here, b)) ??
    buildings.map(b => ({ b, d: centroidDist(here, b) })).filter(x => x.d < 25).sort((a, b) => a.d - b.d)[0]?.b ??
    null

  const neighbours = outline ? buildings.filter(b => b !== outline).slice(0, 40) : []
  const body: Body = { outline, neighbours, roads, plot: outline ? plot : null }
  if (cache.size > 500) cache.clear()
  cache.set(key, { at: Date.now(), body })
  return NextResponse.json(body, { headers: { 'Cache-Control': 'private, max-age=3600' } })
}
