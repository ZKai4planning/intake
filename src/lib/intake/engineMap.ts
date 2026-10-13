/**
 * engineMap.ts
 * ─────────────
 * Types + helpers for the live preview when the PLANNING ENGINE does the work
 * (POST /api/property/proposal). The engine returns the map layers and the
 * Map checks; here we only turn that into a SiteFit (what the draft stores and
 * the "Continue" button reacts to).
 */
import type { SiteFit } from './types'

export interface EnginePreviewLayer {
  id: string
  kind: string
  label: string
  style: string
  status?: string
  indicative: boolean
  dimsText: string | null
  /** [lng, lat] pairs, closed. */
  ring: [number, number][]
}

export interface EnginePreview {
  frame: { frontBearingDeg: number; frontSource: string; houseWidthM: number; houseDepthM: number; indicative: boolean }
  layers: EnginePreviewLayer[]
  siteChecks: {
    items: { status: 'fail' | 'warn' | 'pass' | 'info'; message: string }[]
    disclaimer: string
    attribution: string[]
    boundary: { status: string; outsideM2: number; maxOutsideM: number }
    neighbours: { status: string }[]
  }
  frontNote: string
  proposalLabel: string | null
  assessment: unknown
}

/** Same statuses the rest of the intake already understands (collision stops "Continue", tight/ok don't). */
export function engineToFit(p: EnginePreview): SiteFit {
  const { items, boundary, neighbours } = p.siteChecks
  const b = boundary.status === 'inside' || boundary.status === 'crosses' || boundary.status === 'unavailable' || boundary.status === 'unreliable'
    ? { status: boundary.status as 'inside' | 'crosses' | 'unavailable' | 'unreliable', outsideM2: boundary.outsideM2, maxOutsideM: boundary.maxOutsideM }
    : null

  if (p.frame.indicative) {
    return { status: 'unknown', message: "We couldn't find this building's outline, so we haven't checked the proposal against the neighbouring buildings.", items, boundary: b }
  }
  const fails = items.filter(i => i.status === 'fail')
  const warns = items.filter(i => i.status === 'warn')
  const overlaps = neighbours.some(n => n.status === 'overlap')
  const sentence = (m: string) => m.replace(/^Overlaps/, 'It overlaps').replace(/^Extends/, 'It extends').replace(/^Within/, 'It is within')

  if (overlaps) {
    const first = fails.find(i => /^Overlaps/.test(i.message)) ?? fails[0]
    return { status: 'collision', message: `${sentence(first.message)} It looks not possible at this size. Try a smaller size, or a different position.`, items, boundary: b }
  }
  if (fails.length || warns.length) {
    const first = fails[0] ?? warns[0]
    return { status: 'tight', message: `${sentence(first.message)} It may still be possible, but it needs checking on site.`, items, boundary: b }
  }
  const passes = items.filter(i => i.status === 'pass').map(i => i.message)
  return { status: 'ok', message: passes.join(' ') || 'No clash found.', items, boundary: b }
}
