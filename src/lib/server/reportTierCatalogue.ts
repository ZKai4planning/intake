import { ApiError } from './apiError'

export type ReportTierId = 'RPT-001' | 'RPT-002' | 'RPT-003' | 'RPT-004' | 'RPT-005'

/**
 * Just the (name, priceGBP) pairs from the frontend's lib/reportTiers.ts
 * TIER_DEFS — enough for cart pricing. Full tier definitions (what's
 * included, automated vs bespoke, etc.) stay frontend-owned for now,
 * same reasoning as elsewhere in this port: the catalogue itself is
 * product content, not something this API needs to be authoritative
 * about — only the PRICE needs to be server-authoritative, since that's
 * what actually gets charged.
 */
const TIER_CATALOGUE: Record<ReportTierId, { name: string; priceGBP: number | null }> = {
  'RPT-001': { name: 'Free Snapshot', priceGBP: null },
  'RPT-002': { name: 'Standard Report', priceGBP: 29 },
  'RPT-003': { name: 'Detailed Report', priceGBP: 79 },
  'RPT-004': { name: 'Consultant Review', priceGBP: null },
  'RPT-005': { name: 'Bespoke Proposal', priceGBP: null },
}

/** Server-authoritative price lookup — never trust a client-supplied price for cart items. */
export function priceForTier(tier: ReportTierId): { name: string; priceGBP: number } {
  const def = TIER_CATALOGUE[tier]
  if (!def) throw ApiError.badRequest(`Unknown report tier: ${tier}`, 'invalid_tier')
  if (def.priceGBP === null) {
    throw ApiError.badRequest(`${def.name} isn't a purchasable tier (bespoke/quote-only)`, 'not_purchasable')
  }
  return { name: def.name, priceGBP: def.priceGBP }
}
