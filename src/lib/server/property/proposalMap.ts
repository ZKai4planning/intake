/**
 * proposalMap.ts
 * ───────────────
 * Translates the intake chat's answers ("rear extension, 4 m deep …") into the
 * planning engine's proposal body ({ type: 'rear_extension', depthM: 4, … }).
 *
 * The ENGINE stays the single source of truth for everything it computes — map
 * geometry, neighbour / title-boundary checks, defaults and limits. This file
 * only maps field names, and fills anything the person hasn't answered yet from
 * the defaults the engine itself publishes at GET /api/work-types.
 */
import { parseDimensions, parseNumber, type Answers } from '@/lib/intake/projectTypes'

export interface EngineField {
  name: string
  kind: 'number' | 'boolean' | 'select'
  required?: boolean
  default?: unknown
  min?: number
  max?: number
  options?: { value: unknown }[]
}
export interface EngineWorkType { type: string; fields: EngineField[] }

export interface ProposalInput {
  categoryId: string
  subtypeId: string | null
  answers: Answers
  /** true = the "Other side" toggle. */
  flip: boolean
}

const STOREYS = (v: string | undefined) => (v === 'two' ? 2 : 1)
const num = (v: string | undefined) => {
  const n = parseNumber(v)
  return n !== null && n > 0 ? n : undefined
}

/** { engine work type, the fields we can fill from the answers } — or null if the engine has no equivalent. */
export function toEngineProposal(inp: ProposalInput): { type: string; values: Record<string, unknown> } | null {
  const { categoryId, subtypeId, answers: a, flip } = inp
  // The local preview draws "side > 0" (west of a south-facing house = LEFT when facing the house) when not flipped.
  const side = flip ? 'right' : 'left'

  if (categoryId === 'extend') {
    switch (subtypeId) {
      case 'rear':
        return { type: 'rear_extension', values: { storeys: STOREYS(a['rear.storeys']), depthM: num(a['rear.depth']), heightM: num(a['rear.height']) } }
      case 'side':
        return { type: 'side_extension', values: { side, storeys: STOREYS(a['side.storeys']), widthM: num(a['side.width']), heightM: num(a['side.height']) } }
      case 'wrap':
        return { type: 'wraparound_extension', values: { side, depthM: num(a['wrap.depth']), widthM: num(a['wrap.width']), heightM: num(a['wrap.height']) } }
      case 'porch':
        return { type: 'front_porch', values: { depthM: num(a['porch.projection']), heightM: num(a['porch.height']) } }
      case 'storey':
        return { type: 'additional_storey', values: { storeys: a['storey.count'] === 'two' ? 2 : 1, heightM: num(a['storey.height']) } }
    }
    return null
  }

  if (categoryId === 'build') {
    if (subtypeId === 'outbuilding') {
      const { length, width } = parseDimensions(a['out.size'])
      return { type: 'outbuilding', values: { widthM: num(length), depthM: num(width), eavesHeightM: num(a['out.eaves']) } }
    }
    if (subtypeId === 'garage') {
      const { length, width } = parseDimensions(a['gar.size'])
      if (a['gar.attached'] === 'attached') return { type: 'side_extension', values: { side, widthM: num(width), lengthM: num(length) } }
      return { type: 'outbuilding', values: { widthM: num(width), depthM: num(length) } }
    }
  }
  return null
}

/** Drops undefined values, clamps numbers to the engine's limits, and fills required fields from the engine's own defaults. */
export function finishProposal(wt: EngineWorkType, values: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { type: wt.type }
  for (const f of wt.fields) {
    let v = values[f.name]
    if (v === undefined || v === null) {
      if (f.required && f.default !== undefined) v = f.default
      else continue
    }
    if (f.kind === 'number') {
      if (typeof v !== 'number' || !Number.isFinite(v)) continue
      v = Math.min(f.max ?? 1000, Math.max(f.min ?? 0, v))
    } else if (f.kind === 'select') {
      if (!f.options?.some(o => o.value === v)) continue
    }
    out[f.name] = v
  }
  return out
}
