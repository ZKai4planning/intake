import { councilFor as mockCouncilFor, checkConstraints as mockCheckConstraints, type ConstraintResult } from './constraints'
import type { PlanningConstraint } from './planningData'

/**
 * liveAddressLookup.ts
 * ──────────────────────
 * Client-safe replacement for calling the mock `councilFor`/
 * `checkConstraints` (lib/constraints.ts) directly. Hits the real
 * /api/planning-check route — which in turn calls postcodes.io +
 * planning.data.gov.uk (see lib/planningData.ts) — and only falls back
 * to the deterministic mock if that live lookup fails, instead of
 * always using the mock like several callers historically did.
 *
 * This is the one place every address/eligibility/checkout step should
 * go through so the council + constraints shown in the free snapshot,
 * the paid RPT-002/003 reports and the downloaded PDF all agree with
 * each other and reflect the real address whenever possible.
 */
export interface ResolvedAddressData {
  council: string
  constraints: ConstraintResult[]
  coordinates?: { latitude: number; longitude: number }
  dataSource: 'live' | 'estimate'
  /** Set when dataSource === 'estimate' — explain this to the reader wherever the data is shown/downloaded. */
  dataNote?: string
}

/** Turns one live planning.data.gov.uk dataset check into a plain-English line. */
function describeConstraint(c: PlanningConstraint): string {
  if (!c.present) return `No ${c.label.toLowerCase()} recorded at this location.`
  if (c.detail) return `Located within ${c.detail}.`
  return `Within a mapped ${c.label.toLowerCase()} area.`
}

/**
 * postcode → council + constraints, live wherever possible. Never
 * throws — always resolves to *something* so callers don't need their
 * own try/catch, but dataSource tells you whether it's real or a
 * fallback estimate so that can be surfaced to the reader.
 */
export async function resolveAddressData(postcode: string): Promise<ResolvedAddressData> {
  const clean = postcode.trim()
  if (!clean) {
    return {
      council: mockCouncilFor(postcode),
      constraints: mockCheckConstraints(postcode),
      dataSource: 'estimate',
      dataNote: 'No postcode was given, so the constraints below are a general estimate, not a check of a specific address.',
    }
  }

  try {
    const res = await fetch(`/api/planning-check?postcode=${encodeURIComponent(clean)}`)
    if (res.ok) {
      const json = await res.json()
      const coords = json?.location?.coordinates
      if (json?.location?.council && Array.isArray(json?.constraints) && typeof coords?.latitude === 'number') {
        const constraints: ConstraintResult[] = json.constraints.map((c: PlanningConstraint) => ({
          label: c.label,
          status: c.status,
          detail: describeConstraint(c),
        }))
        return {
          council: json.location.council,
          constraints,
          coordinates: { latitude: coords.latitude, longitude: coords.longitude },
          dataSource: 'live',
        }
      }
    }
  } catch {
    // fall through to the estimate below
  }

  return {
    council: mockCouncilFor(clean),
    constraints: mockCheckConstraints(clean),
    dataSource: 'estimate',
    dataNote: "We couldn't reach live planning data for this postcode just now, so the constraints below are a general estimate, not a check of this exact address — verify independently before relying on this.",
  }
}
