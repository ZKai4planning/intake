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
 * Returns { outline: {lat,lng}[] | null, roads: {lat,lng}[][] }.
 * Never errors for the UI: on any failure it returns outline: null and the
 * preview falls back to an estimated outline.
 */

type LL = { lat: number; lng: number }
interface OverpassWay {
  type: 'way'
  tags?: Record<string, string>
  geometry?: { lat: number; lon: number }[]
}

const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']
const cache = new Map<string, { at: number; body: { outline: LL[] | null; roads: LL[][] } }>()
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

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get('lat'))
  const lng = Number(req.nextUrl.searchParams.get('lng'))
  // UK only — also keeps this from being used as an open Overpass proxy.
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 49 || lat > 61 || lng < -9 || lng > 2.5) {
    return NextResponse.json({ outline: null, roads: [] }, { status: 400 })
  }
  if (!allow('property-building', req, 30)) {
    return NextResponse.json({ outline: null, roads: [] }, { status: 429 })
  }

  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL) return NextResponse.json(hit.body, { headers: { 'Cache-Control': 'private, max-age=3600' } })

  const query = `[out:json][timeout:12];
way(around:30,${lat},${lng})["building"];out geom;
way(around:70,${lat},${lng})["highway"]["highway"!~"footway|path|steps|cycleway|service|track|pedestrian|corridor|bridleway|proposed|construction"];out geom;`

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

  if (!ways) return NextResponse.json({ outline: null, roads: [] })

  const here: LL = { lat, lng }
  const buildings = ways.filter(w => w.tags?.building && w.geometry!.length >= 4).map(w => ll(w.geometry!))
  const roads = ways.filter(w => w.tags?.highway).map(w => ll(w.geometry!)).slice(0, 25)

  // The building the point is inside, else the nearest one.
  const outline =
    buildings.find(b => inside(here, b)) ??
    buildings.map(b => ({ b, d: centroidDist(here, b) })).filter(x => x.d < 25).sort((a, b) => a.d - b.d)[0]?.b ??
    null

  const body = { outline, roads }
  if (cache.size > 500) cache.clear()
  cache.set(key, { at: Date.now(), body })
  return NextResponse.json(body, { headers: { 'Cache-Control': 'private, max-age=3600' } })
}
