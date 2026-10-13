/**
 * fit.ts
 * ───────
 * "Will it physically fit?" — checks the drawn proposal against the real
 * outlines of the neighbouring buildings (OpenStreetMap) and reports:
 *
 *   collision → it overlaps a neighbouring building (e.g. a side extension into next door)
 *   tight     → it would leave under ~1 m to a neighbouring building
 *   ok        → no clash found
 *   unknown   → we have no building outline to check against
 *
 * Limits (also stated in the UI): only buildings are known, NOT property
 * boundaries — so this finds buildings that are in the way, but "within 2 m of
 * the boundary" still comes from the person's answer. Outlines are accurate to
 * about a metre, so small overlaps are ignored.
 */
import { buildPreview, centroid, type Pt } from './footprint'
import type { Site } from './site'
import type { SiteFit } from './types'
import type { Answers, CategoryId } from './projectTypes'

const OVERLAP_M2 = 0.4 // ignore slivers (shared party walls, OSM drawing error)
const TIGHT_M = 1.0
const ADJOIN_M = 0.3 // closer than this (but not overlapping) = shares a wall → party-wall note
const BOUNDARY_TOLERANCE_M = 0.5 // ignore anything within this of the title outline (map data accuracy)
const BOUNDARY_CROSS_M2 = 0.5 // area beyond the title boundary at or above this = "crosses"

// ── polygon helpers ───────────────────────────────────────────────────

function signedArea(p: Pt[]): number {
  let a = 0
  for (let i = 0; i < p.length; i++) {
    const q = p[(i + 1) % p.length]
    a += p[i].x * q.y - q.x * p[i].y
  }
  return a / 2
}

/** Sutherland–Hodgman: `subject` clipped to the CONVEX polygon `clip`. */
function clipPolygon(subject: Pt[], clip: Pt[]): Pt[] {
  const c = signedArea(clip) < 0 ? [...clip].reverse() : clip
  let out = subject
  for (let i = 0; i < c.length && out.length; i++) {
    const a = c[i]
    const b = c[(i + 1) % c.length]
    const inside = (p: Pt) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) >= 0
    const cross = (p: Pt, q: Pt): Pt => {
      const dx = q.x - p.x, dy = q.y - p.y
      const t = ((b.x - a.x) * (a.y - p.y) - (b.y - a.y) * (a.x - p.x)) / ((b.x - a.x) * dy - (b.y - a.y) * dx)
      return { x: p.x + t * dx, y: p.y + t * dy }
    }
    const input = out
    out = []
    for (let j = 0; j < input.length; j++) {
      const cur = input[j]
      const prev = input[(j + input.length - 1) % input.length]
      if (inside(cur)) {
        if (!inside(prev)) out.push(cross(prev, cur))
        out.push(cur)
      } else if (inside(prev)) out.push(cross(prev, cur))
    }
  }
  return out
}

function overlap(a: Pt[], clipConvex: Pt[]): { area: number; at: Pt } {
  const poly = clipPolygon(a, clipConvex)
  if (poly.length < 3) return { area: 0, at: { x: 0, y: 0 } }
  return {
    area: Math.abs(signedArea(poly)),
    at: { x: poly.reduce((s, p) => s + p.x, 0) / poly.length, y: poly.reduce((s, p) => s + p.y, 0) / poly.length },
  }
}

function distPointSeg(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x, dy = b.y - a.y
  const l2 = dx * dx + dy * dy
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

function minGap(a: Pt[], b: Pt[]): number {
  let d = Infinity
  for (const [P, Q] of [[a, b], [b, a]] as const) {
    for (const p of P) for (let i = 0; i < Q.length; i++) d = Math.min(d, distPointSeg(p, Q[i], Q[(i + 1) % Q.length]))
  }
  return d
}

function pointInPoly(pt: Pt, poly: Pt[]): boolean {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j]
    if (a.y > pt.y !== b.y > pt.y && pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x) c = !c
  }
  return c
}

const DIRS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west']
/** Compass word for an offset in our local frame (x = east, y = south). */
function compass(dx: number, dy: number): string {
  return DIRS[Math.round(((((Math.atan2(dx, -dy) * 180) / Math.PI) + 360) % 360) / 45) % 8]
}
const r1 = (n: number) => Math.round(n * 10) / 10

/**
 * How much of the proposal lies OUTSIDE the registered title boundary, ignoring anything within
 * `tol` metres of its outline (map data is only that accurate). Same method as the planning engine.
 */
function outsideStats(polys: Pt[][], plot: Pt[], tol = BOUNDARY_TOLERANCE_M, step = 0.1): { areaM2: number; maxDepthM: number } {
  let n = 0
  let maxD = 0
  for (const P of polys) {
    const xs = P.map(p => p.x), ys = P.map(p => p.y)
    const x1 = Math.max(...xs), y1 = Math.max(...ys)
    for (let x = Math.min(...xs) + step / 2; x < x1; x += step) {
      for (let y = Math.min(...ys) + step / 2; y < y1; y += step) {
        const pt = { x, y }
        if (!pointInPoly(pt, P) || pointInPoly(pt, plot)) continue
        let d = Infinity
        for (let i = 0; i < plot.length; i++) d = Math.min(d, distPointSeg(pt, plot[i], plot[(i + 1) % plot.length]))
        if (d <= tol) continue
        n++
        maxD = Math.max(maxD, d)
      }
    }
  }
  return { areaM2: n * step * step, maxDepthM: maxD }
}

function minEdgeDistance(polys: Pt[][], plot: Pt[]): number {
  let d = Infinity
  for (const P of polys) for (const p of P) for (let i = 0; i < plot.length; i++) d = Math.min(d, distPointSeg(p, plot[i], plot[(i + 1) % plot.length]))
  return d
}

// ── the check ─────────────────────────────────────────────────────────

export interface FitInput {
  categoryId: CategoryId | null
  subtypeId: string | null
  answers: Answers
  bearing: number
  flip: boolean
  site: Site | null
}

export interface FitResult {
  fit: SiteFit
  /** Indices (into site.neighbours) of buildings the proposal runs into. */
  hits: number[]
  /** True when the proposal sticks out beyond the registered title boundary (draw the plot red). */
  boundaryCrossed: boolean
}

/** Answer key + label of the one dimension we can shrink to find "the most that fits". */
const SIZE_KEY: Record<string, { key: string; label: string }> = {
  'extend.rear': { key: 'rear.depth', label: 'depth' },
  'extend.side': { key: 'side.width', label: 'width' },
  'extend.wrap': { key: 'wrap.depth', label: 'rear depth' },
  'extend.porch': { key: 'porch.projection', label: 'projection' },
}

/** Pull a convex polygon's corners in towards its centre so walls that merely touch don't count as a clash. */
function inset(poly: Pt[], d: number): Pt[] {
  const c = { x: poly.reduce((a, p) => a + p.x, 0) / poly.length, y: poly.reduce((a, p) => a + p.y, 0) / poly.length }
  return poly.map(p => {
    const dx = c.x - p.x, dy = c.y - p.y
    const l = Math.hypot(dx, dy) || 1
    return { x: p.x + (dx / l) * Math.min(d, l / 2), y: p.y + (dy / l) * Math.min(d, l / 2) }
  })
}

function collisions(polys: Pt[][], site: Site): { hits: Map<number, { area: number; at: Pt }>; gap: number; nearest: number; adjoining: Set<number> } {
  const hits = new Map<number, { area: number; at: Pt }>()
  const adjoining = new Set<number>()
  let gap = Infinity
  let nearest = -1
  site.neighbours.forEach((n, i) => {
    // Skip anything that is really part of this house (duplicate / building:part outlines).
    if (overlap(n, hull(site.outline)).area > 0.5 * Math.abs(signedArea(n))) return
    for (const poly of polys) {
      const o = overlap(n, inset(poly, 0.3))
      if (o.area > OVERLAP_M2) {
        const prev = hits.get(i)
        if (!prev || o.area > prev.area) hits.set(i, o)
      } else {
        const g = minGap(poly, n)
        if (g > 0.15 && g < gap) { gap = g; nearest = i } // touching a party wall is normal, not "tight"
        if (g <= ADJOIN_M) adjoining.add(i)
      }
    }
  })
  return { hits, gap, nearest, adjoining }
}

/** Convex hull (monotone chain) — the clipper in overlap() must be convex. */
function hull(points: Pt[]): Pt[] {
  const p = [...points].sort((a, b) => a.x - b.x || a.y - b.y)
  if (p.length < 3) return p
  const cross = (o: Pt, a: Pt, b: Pt) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  const lo: Pt[] = []
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q) }
  const up: Pt[] = []
  for (const q of [...p].reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q) }
  return [...lo.slice(0, -1), ...up.slice(0, -1)]
}

type MapItem = NonNullable<SiteFit['items']>[number]

/** Neighbour overlap + registered-title-boundary checks — the same "Map checks" the planning engine shows. */
function mapChecks(
  model: NonNullable<ReturnType<typeof buildPreview>>,
  site: Site,
  hits: Map<number, { area: number; at: Pt }>,
  gap: number,
  nearest: number,
  adjoining: Set<number>,
  roofLevel: boolean,
): { items: MapItem[]; boundary: NonNullable<SiteFit['boundary']> | null } {
  if (roofLevel) {
    return { items: [{ status: 'info', message: 'Roof-level work does not extend the building footprint, so overlap and boundary checks do not apply.' }], boundary: null }
  }
  const items: MapItem[] = []
  const from = site.center
  const dir = (poly: Pt[]) => { const c = centroid(poly); return compass(c.x - from.x, c.y - from.y) }

  // ── neighbouring buildings ──
  const overlaps = [...hits.entries()].sort((a, b) => b[1].area - a[1].area)
  for (const [i, h] of overlaps) items.push({ status: 'fail', message: `Overlaps the neighbouring building to the ${dir(site.neighbours[i])} by about ${r1(h.area)} m².` })
  if (!overlaps.length) {
    if (nearest >= 0 && gap < TIGHT_M) items.push({ status: 'warn', message: `Within about ${r1(gap)} m of the neighbouring building to the ${dir(site.neighbours[nearest])}.` })
    for (const i of adjoining) if (i !== nearest || gap >= TIGHT_M) items.push({ status: 'info', message: `Adjoins the neighbouring building to the ${dir(site.neighbours[i])}; party wall matters may apply.` })
    items.push({ status: 'pass', message: 'No overlap with neighbouring buildings found (OpenStreetMap outlines can be incomplete).' })
  }

  // ── registered title boundary ──
  if (!site.plot) {
    items.push({ status: 'info', message: 'No registered title boundary was found for this property, so the boundary check was skipped.' })
    return { items, boundary: { status: 'unavailable', outsideM2: 0, maxOutsideM: 0 } }
  }
  const hc = centroid(site.outline)
  if (!pointInPoly(hc, site.plot)) {
    items.push({ status: 'info', message: 'The title boundary found does not seem to contain the house (shared or split titles are common), so the boundary check was skipped.' })
    return { items, boundary: { status: 'unreliable', outsideM2: 0, maxOutsideM: 0 } }
  }
  const st = outsideStats(model.proposed, site.plot)
  if (st.areaM2 >= BOUNDARY_CROSS_M2) {
    const b = { status: 'crosses' as const, outsideM2: r1(st.areaM2), maxOutsideM: r1(st.maxDepthM) }
    items.push({ status: 'fail', message: `Extends about ${b.maxOutsideM} m beyond the registered title boundary (about ${b.outsideM2} m² outside it).` })
    return { items, boundary: b }
  }
  const dist = r1(minEdgeDistance(model.proposed, site.plot))
  items.push({ status: 'pass', message: `Inside the registered title boundary${dist <= BOUNDARY_TOLERANCE_M ? ' (up to the boundary line)' : ` (about ${dist} m from the nearest boundary line)`}.` })
  return { items, boundary: { status: 'inside', outsideM2: 0, maxOutsideM: 0 } }
}

export function checkFit(inp: FitInput): FitResult | null {
  const { categoryId, subtypeId, answers, bearing, flip, site } = inp
  const model = buildPreview(categoryId, subtypeId, answers, bearing, flip, site)
  if (!model) return null

  if (!site) {
    return {
      hits: [],
      boundaryCrossed: false,
      fit: {
        status: 'unknown',
        message: "We couldn't find this building's outline, so we haven't checked the proposal against the neighbouring buildings.",
        items: [{ status: 'info', message: 'No building outline was found, so neighbour and boundary checks were skipped.' }],
      },
    }
  }
  if (subtypeId === 'storey') {
    const checks = mapChecks(model, site, new Map(), Infinity, -1, new Set(), true)
    return { hits: [], boundaryCrossed: false, fit: { status: 'ok', message: 'An extra storey stays within the existing footprint, so nothing next door is in the way.', items: checks.items, boundary: null } }
  }

  const noun = model.label.split(' · ')[0].toLowerCase()
  const { hits, gap, nearest, adjoining } = collisions(model.proposed, site)
  const checks = mapChecks(model, site, hits, gap, nearest, adjoining, false)
  const crossed = checks.boundary?.status === 'crosses'
  const boundaryNote = crossed && checks.boundary
    ? ` It also extends about ${checks.boundary.maxOutsideM.toFixed(1)} m beyond the registered title boundary, so check who owns that land.`
    : ''
  const extra = { items: checks.items, boundary: checks.boundary }

  if (hits.size > 0) {
    // Where is the building we hit — next door, behind, or in front?
    const t = (bearing * Math.PI) / 180
    const f = { x: Math.sin(t), y: -Math.cos(t) }
    const r = { x: -f.y, y: f.x }
    const first = [...hits.values()].sort((a, b) => b.area - a.area)[0]
    const d = { x: first.at.x - site.center.x, y: first.at.y - site.center.y }
    const u = d.x * r.x + d.y * r.y
    const v = d.x * f.x + d.y * f.y
    const where =
      Math.abs(u) > site.width / 2 ? 'the building next door' : v < 0 ? 'the building behind your house' : 'a building in front of your house'

    // Largest value of the main dimension that still clears every neighbour.
    let maxFit: SiteFit['maxFit'] = null
    const size = SIZE_KEY[`${categoryId}.${subtypeId}`]
    if (size) {
      const asked = Number((answers[size.key] ?? '').replace(',', '.'))
      if (Number.isFinite(asked) && asked > 0) {
        let best = 0
        for (let x = Math.round(asked * 10) - 1; x >= 1; x--) {
          const trial = buildPreview(categoryId, subtypeId, { ...answers, [size.key]: String(x / 10) }, bearing, flip, site)
          if (trial && collisions(trial.proposed, site).hits.size === 0) { best = x / 10; break }
        }
        maxFit = { label: size.label, value: best }
      }
    }

    const tail = !maxFit
      ? ' Try a smaller size, or a different position.'
      : maxFit.value >= 0.5
        ? ` The most that appears to fit here is about ${maxFit.value.toFixed(1)} m ${maxFit.label}.`
        : ' There appears to be no room for it on this side.'
    // Side extensions / attached garages: would the other side of the house be clear?
    let otherSide = ''
    if (subtypeId === 'side' || subtypeId === 'wrap' || (subtypeId === 'garage' && answers['gar.attached'] === 'attached')) {
      const alt = buildPreview(categoryId, subtypeId, answers, bearing, !flip, site)
      if (alt && collisions(alt.proposed, site).hits.size === 0) otherSide = ' The other side of the house looks clear — try “Other side”.'
    }
    return {
      hits: [...hits.keys()],
      boundaryCrossed: crossed,
      fit: {
        status: 'collision',
        message: `This ${noun} would run into ${where}, so it looks not possible at this size.${tail}${otherSide}`,
        maxFit,
        ...extra,
      },
    }
  }

  if (gap < TIGHT_M) {
    return {
      hits: [],
      boundaryCrossed: crossed,
      fit: {
        status: 'tight',
        message: `It would leave only about ${Math.max(gap, 0).toFixed(1)} m to the neighbouring building. It may still be possible, but the distance to the boundary will need checking.${boundaryNote}`,
        ...extra,
      },
    }
  }
  if (crossed) {
    return {
      hits: [],
      boundaryCrossed: true,
      fit: {
        status: 'tight',
        message: `No clash with the neighbouring buildings, but it extends about ${checks.boundary!.maxOutsideM.toFixed(1)} m beyond the registered title boundary (indicative). Check the plot boundary on site before going further.`,
        ...extra,
      },
    }
  }
  const boundaryKnown = checks.boundary?.status === 'inside'
  return {
    hits: [],
    boundaryCrossed: false,
    fit: {
      status: 'ok',
      message: boundaryKnown
        ? 'No clash with the neighbouring buildings shown on the map, and it stays inside the registered title boundary (indicative — a title boundary is not the legal boundary).'
        : 'No clash with the neighbouring buildings shown on the map. We couldn’t check the plot boundary, so the "within 2 m of the boundary" answer is still taken from you.',
      ...extra,
    },
  }
}
