/**
 * footprint.ts
 * ─────────────
 * Turns the person's answers ("rear extension, 4 m deep" …) into simple
 * plan-view shapes in METRES, relative to the property point, so the intake
 * can draw a live preview on the map / aerial photo.
 *
 * The existing house outline is an ESTIMATE (typical UK house, centred on the
 * address point) — the preview is labelled "indicative" and the person can
 * rotate / swap / drag it to line it up. It is never used for the planning
 * assessment itself.
 *
 * Coordinates: x = east, y = south (screen-style), metres.
 */
import { parseDimensions, parseNumber, type Answers, type CategoryId } from './projectTypes'
import type { Site } from './site'

export interface Pt { x: number; y: number }

export interface PreviewModel {
  /** Estimated outline of the existing house. */
  existing: Pt[]
  /** The proposal. Several polygons are drawn in the same style. */
  proposed: Pt[][]
  /** Short label drawn on the proposal, e.g. "Rear extension · 4.0 m deep". */
  label: string
  /** False while a needed size is missing — defaults are drawn instead. */
  complete: boolean
}

export const HOUSE_W = 6 // frontage, m
export const HOUSE_D = 9 // front-to-back, m

export const PREVIEW_CATEGORIES: CategoryId[] = ['extend', 'build']

export function hasPreview(categoryId: CategoryId | null, subtypeId: string | null): boolean {
  if (categoryId === 'extend') return true
  if (categoryId === 'build') return subtypeId === 'outbuilding' || subtypeId === 'garage'
  return false
}

const m1 = (n: number) => n.toFixed(1).replace(/\.0$/, '.0')

export function buildPreview(
  categoryId: CategoryId | null,
  subtypeId: string | null,
  answers: Answers,
  frontBearingDeg: number,
  flipSide: boolean,
  /** Real house outline / size / direction when we have it; otherwise an estimate is used. */
  site?: Site | null,
): PreviewModel | null {
  if (!hasPreview(categoryId, subtypeId)) return null

  // Unit vectors: f = direction the front of the house faces, r = to the right of f.
  const t = (frontBearingDeg * Math.PI) / 180
  const f: Pt = { x: Math.sin(t), y: -Math.cos(t) }
  const r: Pt = { x: -f.y, y: f.x }
  const side = flipSide ? -1 : 1
  // local (u along r, v along f) → world metres
  const o: Pt = site?.center ?? { x: 0, y: 0 }
  const P = (u: number, v: number): Pt => ({ x: o.x + u * r.x + v * f.x, y: o.y + u * r.y + v * f.y })
  const rect = (u0: number, u1: number, v0: number, v1: number): Pt[] => [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]

  const W = site?.width ?? HOUSE_W
  const D = site?.depth ?? HOUSE_D
  const existing = site?.outline ?? rect(-W / 2, W / 2, -D / 2, D / 2)

  const num = (id: string, fallback: number) => {
    const n = parseNumber(answers[id])
    return { v: n && n > 0 ? n : fallback, known: !!(n && n > 0) }
  }
  const dims = (id: string, fl: number, fw: number) => {
    const { length, width } = parseDimensions(answers[id])
    const l = parseNumber(length)
    const w = parseNumber(width)
    return { l: l && l > 0 ? l : fl, w: w && w > 0 ? w : fw, known: !!(l && l > 0 && w && w > 0) }
  }

  if (categoryId === 'extend') {
    switch (subtypeId) {
      case 'rear': {
        const d = num('rear.depth', 3)
        return { existing, complete: d.known, label: `Rear extension · ${m1(d.v)} m deep`, proposed: [rect(-W / 2, W / 2, -D / 2 - d.v, -D / 2)] }
      }
      case 'side': {
        const w = num('side.width', 2.5)
        const L = Math.min(D - 1.5, 5)
        const u0 = side > 0 ? W / 2 : -W / 2 - w.v
        const u1 = side > 0 ? W / 2 + w.v : -W / 2
        return { existing, complete: w.known, label: `Side extension · ${m1(w.v)} × ${m1(L)} m`, proposed: [rect(u0, u1, -D / 2, -D / 2 + L)] }
      }
      case 'wrap': {
        const d = num('wrap.depth', 3)
        const w = num('wrap.width', 2.5)
        const a = W / 2
        const b = W / 2 + w.v
        const pts = side > 0
          ? [P(a, D / 2 - 1), P(b, D / 2 - 1), P(b, -D / 2 - d.v), P(-a, -D / 2 - d.v), P(-a, -D / 2), P(a, -D / 2)]
          : [P(-a, D / 2 - 1), P(-b, D / 2 - 1), P(-b, -D / 2 - d.v), P(a, -D / 2 - d.v), P(a, -D / 2), P(-a, -D / 2)]
        return { existing, complete: d.known && w.known, label: `Wraparound · ${m1(d.v)} m rear, ${m1(w.v)} m side`, proposed: [pts] }
      }
      case 'porch': {
        const p = num('porch.projection', 1.5)
        return { existing, complete: p.known, label: `Porch · ${m1(p.v)} m out`, proposed: [rect(-0.9, 0.9, D / 2, D / 2 + p.v)] }
      }
      case 'storey': {
        const h = num('storey.height', 2.5)
        return { existing, complete: h.known, label: `Extra storey · +${m1(h.v)} m`, proposed: [existing] }
      }
    }
    return null
  }

  if (categoryId === 'build') {
    if (subtypeId === 'outbuilding') {
      const s = dims('out.size', 4, 3)
      return { existing, complete: s.known, label: `Outbuilding · ${m1(s.l)} × ${m1(s.w)} m`, proposed: [rect(-s.l / 2, s.l / 2, -D / 2 - 2 - s.w, -D / 2 - 2)] }
    }
    if (subtypeId === 'garage') {
      const s = dims('gar.size', 5, 3)
      const attached = answers['gar.attached'] === 'attached'
      if (attached) {
        const u0 = side > 0 ? W / 2 : -W / 2 - s.w
        const u1 = side > 0 ? W / 2 + s.w : -W / 2
        return { existing, complete: s.known, label: `Garage · ${m1(s.l)} × ${m1(s.w)} m`, proposed: [rect(u0, u1, -D / 2, -D / 2 + Math.min(s.l, D))] }
      }
      return { existing, complete: s.known, label: `Garage · ${m1(s.l)} × ${m1(s.w)} m`, proposed: [rect(-s.w / 2, s.w / 2, -D / 2 - 2 - s.l, -D / 2 - 2)] }
    }
  }
  return null
}

/** Metres per screen pixel at a given web-mercator zoom and latitude (256 px tiles). */
export function metresPerPixel(latDeg: number, zoom: number): number {
  return (156543.03392 * Math.cos((latDeg * Math.PI) / 180)) / 2 ** zoom
}

export function centroid(pts: Pt[]): Pt {
  const n = pts.length
  return { x: pts.reduce((a, p) => a + p.x, 0) / n, y: pts.reduce((a, p) => a + p.y, 0) / n }
}
