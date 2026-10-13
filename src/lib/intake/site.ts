/**
 * site.ts
 * ────────
 * Works out, from the real building outline and nearby roads (OpenStreetMap),
 * the house's size and which way its front faces — the same idea the planning
 * engine uses ("front faces north-east, from the nearest road").
 *
 * All coordinates are metres relative to the property point:
 *   x = east, y = south (screen-style).
 */
import type { Pt } from './footprint'

export interface LatLng { lat: number; lng: number }

export interface Site {
  /** Real outline of the existing house. */
  outline: Pt[]
  /** Centre of the house's bounding rectangle. */
  center: Pt
  /** Frontage width (along the road), m. */
  width: number
  /** Front-to-back depth, m. */
  depth: number
  /** Direction the front faces, degrees clockwise from north. */
  bearing: number
  /** True when the front was worked out from a nearby road. */
  fromRoad: boolean
  /** Outlines of the other buildings nearby (next door, behind, opposite). */
  neighbours: Pt[][]
  /** HM Land Registry title boundary containing the house (indicative, NOT the legal boundary), or null. */
  plot: Pt[] | null
  plotAreaM2: number | null
}

export function toLocal(origin: LatLng, p: LatLng): Pt {
  const k = Math.cos((origin.lat * Math.PI) / 180)
  return { x: (p.lng - origin.lng) * 111_320 * k, y: -(p.lat - origin.lat) * 110_540 }
}

/** Smallest-area rectangle (any rotation) around a polygon. */
export function minAreaRect(poly: Pt[]) {
  let best: { area: number; angle: number; minU: number; maxU: number; minV: number; maxV: number } | null = null
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    if (len < 0.3) continue
    const ux = (b.x - a.x) / len
    const uy = (b.y - a.y) / len
    let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity
    for (const p of poly) {
      const u = p.x * ux + p.y * uy
      const v = -p.x * uy + p.y * ux
      minU = Math.min(minU, u); maxU = Math.max(maxU, u)
      minV = Math.min(minV, v); maxV = Math.max(maxV, v)
    }
    const area = (maxU - minU) * (maxV - minV)
    if (!best || area < best.area - 1e-6) best = { area, angle: Math.atan2(uy, ux), minU, maxU, minV, maxV }
  }
  if (!best) return null
  const ux = Math.cos(best.angle), uy = Math.sin(best.angle)
  const vx = -uy, vy = ux
  const cu = (best.minU + best.maxU) / 2
  const cv = (best.minV + best.maxV) / 2
  return {
    center: { x: cu * ux + cv * vx, y: cu * uy + cv * vy } as Pt,
    axisU: { x: ux, y: uy } as Pt,
    axisV: { x: vx, y: vy } as Pt,
    lenU: best.maxU - best.minU,
    lenV: best.maxV - best.minV,
  }
}

function polyArea(p: Pt[]): number {
  let a = 0
  for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i].x * q.y - q.x * p[i].y }
  return a / 2
}

function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x, dy = b.y - a.y
  const l2 = dx * dx + dy * dy
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

export function deriveSite(origin: LatLng, outlineLL: LatLng[], roadsLL: LatLng[][], neighboursLL: LatLng[][] = [], plotLL: LatLng[] | null = null): Site | null {
  const outline = outlineLL.map(p => toLocal(origin, p))
  // OSM closes polygons by repeating the first point.
  if (outline.length > 1 && Math.hypot(outline[0].x - outline[outline.length - 1].x, outline[0].y - outline[outline.length - 1].y) < 0.01) outline.pop()
  if (outline.length < 3) return null

  const rect = minAreaRect(outline)
  if (!rect || rect.lenU < 2 || rect.lenV < 2) return null

  const roads = roadsLL.map(r => r.map(p => toLocal(origin, p)))
  const roadDist = (p: Pt) => {
    let d = Infinity
    for (const r of roads) for (let i = 0; i < r.length - 1; i++) d = Math.min(d, distToSegment(p, r[i], r[i + 1]))
    return d
  }

  // Four candidate fronts: the outward normal of each side of the rectangle.
  const cands = [
    { dir: rect.axisU, ext: rect.lenU, across: rect.lenV },
    { dir: { x: -rect.axisU.x, y: -rect.axisU.y }, ext: rect.lenU, across: rect.lenV },
    { dir: rect.axisV, ext: rect.lenV, across: rect.lenU },
    { dir: { x: -rect.axisV.x, y: -rect.axisV.y }, ext: rect.lenV, across: rect.lenU },
  ].map(c => ({ ...c, mid: { x: rect.center.x + (c.dir.x * c.ext) / 2, y: rect.center.y + (c.dir.y * c.ext) / 2 } }))

  let pick = cands[0]
  let fromRoad = false
  if (roads.length) {
    const scored = cands.map(c => ({ c, d: roadDist(c.mid) })).sort((a, b) => a.d - b.d)
    pick = scored[0].c
    fromRoad = true
  } else {
    // No road data: a house's frontage is normally its shorter side, i.e. the front normal runs
    // along the longer axis (ext >= across). Of those two directions, face the more southerly.
    const longAxis = cands.filter(c => c.ext >= c.across)
    pick = (longAxis.length ? longAxis : cands).sort((a, b) => b.dir.y - a.dir.y)[0]
  }

  // `pick.ext` is the extent measured along the front direction = the house's depth.
  const bearing = ((Math.atan2(pick.dir.x, -pick.dir.y) * 180) / Math.PI + 360) % 360
  const neighbours = neighboursLL
    .map(n => {
      const pts = n.map(p => toLocal(origin, p))
      if (pts.length > 1 && Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y) < 0.01) pts.pop()
      return pts
    })
    .filter(n => n.length >= 3)
  let plot: Pt[] | null = null
  if (plotLL && plotLL.length >= 4) {
    plot = plotLL.map(p => toLocal(origin, p))
    if (Math.hypot(plot[0].x - plot[plot.length - 1].x, plot[0].y - plot[plot.length - 1].y) < 0.01) plot.pop()
    if (plot.length < 3) plot = null
  }
  return { outline, center: rect.center, width: pick.across, depth: pick.ext, bearing, fromRoad, neighbours, plot, plotAreaM2: plot ? Math.abs(polyArea(plot)) : null }
}
