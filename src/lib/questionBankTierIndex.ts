/**
 * Only the (rowId, minTier) pairs from the frontend's QUESTION_BANK —
 * enough to replicate getQuestionsForTier()'s COUNT and ORDER for a
 * given tier, which is all Project.totalCount / deriveTitle() need.
 * The full question content (field labels, guidance, options) stays
 * owned by the frontend's lib/questions/questionBank.ts — the agentx
 * UI imports that directly to actually render the form, since it's
 * already a complete, working question renderer; duplicating all of
 * it here would just be a second copy to keep in sync for zero
 * behavioural benefit to this server-side module.
 */

const TIER_ORDER: Record<string, number> = {
  simple: 0,
  standard: 1,
  advanced: 2,
  professional: 3,
  enterprise: 4,
}

const ROW_TIERS: { rowId: string; minTier: string }[] = [
  { rowId: '001', minTier: 'simple' },
  { rowId: '002', minTier: 'standard' },
  { rowId: '003', minTier: 'simple' },
  { rowId: '004', minTier: 'standard' },
  { rowId: '005', minTier: 'simple' },
  { rowId: '006', minTier: 'simple' },
  { rowId: '007', minTier: 'simple' },
  { rowId: '008', minTier: 'simple' },
  { rowId: '009', minTier: 'simple' },
  { rowId: '010', minTier: 'standard' },
  { rowId: '011', minTier: 'standard' },
  { rowId: '012', minTier: 'standard' },
  { rowId: '013', minTier: 'advanced' },
  { rowId: '014', minTier: 'advanced' },
  { rowId: '015', minTier: 'advanced' },
  { rowId: '016', minTier: 'standard' },
  { rowId: '017', minTier: 'simple' },
]

// Enterprise (business/agency) workspaces use their own bulk-mode subset — see the frontend's getEnterpriseFields().
const ENTERPRISE_ROW_IDS = ['001', '003', '005', '017']

export function getQuestionRowIdsForTier(tier: string): string[] {
  if (tier === 'enterprise') return ENTERPRISE_ROW_IDS

  const tierLevel = TIER_ORDER[tier] ?? 0
  return ROW_TIERS.filter(r => TIER_ORDER[r.minTier] <= tierLevel).map(r => r.rowId)
}
