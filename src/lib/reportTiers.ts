import type { ReportTierDef, ReportTierId, ChatQuestion } from '@/types/reportTiers'
import { QUESTION_SLOTS } from './questionSlots'

/**
 * REPORT_TIERS
 * ──────────────
 * Source: pasted Report_Tier_Catalogue (RPT-001–RPT-005). Copy is kept
 * verbatim from the workbook wherever possible so this stays the single
 * source of truth for pricing/positioning copy across the chat flow,
 * report cards, and any future pricing page.
 */
export const REPORT_TIERS: ReportTierDef[] = [
  {
    id: 'RPT-001',
    name: 'Quick Planning Snapshot',
    positioning: 'Free',
    badge: 'Free',
    inputsSummary: 'Goal + postcode/address + property type + a few key questions',
    outputSummary:
      "Basic likely route, obvious constraints, what to check next, and a confidence caveat. No full strategy or application-ready advice.",
    upsellQuestion:
      'Would you like a more tailored planning view with location checks, risks and next steps?',
    automated: true,
    priceGBP: null,
    priceLabel: 'Free',
  },
  {
    id: 'RPT-002',
    name: 'Planning Eligibility Report',
    positioning: 'Low-paid / first paid conversion',
    badge: 'Eligibility report',
    inputsSummary: 'Free inputs + selected address + 10–20 tailored questions',
    outputSummary:
      'Likely route, possible application/licence type, key location risks, missing info and recommended next steps.',
    upsellQuestion:
      'Would you like a more detailed planning-risk assessment before committing time or money?',
    automated: true,
    priceGBP: 29,
    priceLabel: '£29',
  },
  {
    id: 'RPT-003',
    name: 'Planning Potential / Risk Report',
    positioning: 'Premium report',
    badge: 'Premium report',
    inputsSummary: 'Fuller answers + location data + constraints + documents + project scale',
    outputSummary:
      'Deeper risk analysis, route options, a document checklist, likely complexity level and a recommended package.',
    upsellQuestion: 'Would you like a planning consultant to review this and confirm the best route?',
    automated: true,
    priceGBP: 79,
    priceLabel: '£79',
  },
  {
    id: 'RPT-004',
    name: 'Consultant Planning Assessment',
    positioning: 'Professional paid report',
    badge: 'Consultant-reviewed',
    inputsSummary: 'Detailed intake + evidence/documents + selected route',
    outputSummary:
      'A consultant-reviewed assessment: route recommendation, risks, required documents, next actions and a package proposal.',
    upsellQuestion:
      'Would you like us to prepare and manage the application or supporting documents for you?',
    automated: false,
    priceGBP: null,
    priceLabel: 'Custom quote',
  },
  {
    id: 'RPT-005',
    name: 'Full Application / Managed Service Proposal',
    positioning: 'Package / quote / bespoke',
    badge: 'Managed service',
    inputsSummary: 'Consultant assessment + project scope + document needs + client preference',
    outputSummary: 'A commercial proposal: scope, service stages, deliverables, quote and timeline.',
    upsellQuestion: 'Proceed with application support, book a consultation, or accept the proposal.',
    automated: false,
    priceGBP: null,
    priceLabel: 'Bespoke quote',
  },
]

export function getTierDef(id: ReportTierId): ReportTierDef {
  const tier = REPORT_TIERS.find(t => t.id === id)
  if (!tier) throw new Error(`Unknown report tier: ${id}`)
  return tier
}

export function nextTierId(id: ReportTierId): ReportTierId | null {
  const index = REPORT_TIERS.findIndex(t => t.id === id)
  if (index === -1 || index === REPORT_TIERS.length - 1) return null
  return REPORT_TIERS[index + 1].id
}

/** RPT-002/003 — fixed-price, instantly generated, but locked until paid. */
export function isPaidTier(id: ReportTierId): boolean {
  const tier = getTierDef(id)
  return tier.automated && typeof tier.priceGBP === 'number' && tier.priceGBP > 0
}

/**
 * CHAT_QUESTION_BANK
 * ─────────────────────
 * Re-exported from lib/questionSlots.ts, the canonical schema every
 * question id/option value is defined against.
 *
 * This is no longer what the live chat asks verbatim — as of the LLM
 * question-tailoring change, /api/chat/questions sends this same
 * schema to the model and gets back the same slots reordered, phrased
 * for the actor/goal, and with irrelevant non-required slots dropped
 * (see lib/questionEngine.ts + lib/questionSkill.ts). getQuestionsForTier()
 * and getQuestionsUpTo() below are kept as the FALLBACK path — used
 * verbatim if GROQ_API_KEY isn't set or the tailoring call fails, so
 * the chat still works, just without per-actor phrasing.
 */
export const CHAT_QUESTION_BANK: ChatQuestion[] = QUESTION_SLOTS

/** Every question tagged for a given tier, in bank order. Fallback path — see comment above. */
export function getQuestionsForTier(tier: ReportTierId): ChatQuestion[] {
  return CHAT_QUESTION_BANK.filter(q => q.tier === tier)
}

/**
 * Cumulative question set to go from RPT-001 (already asked at the
 * start of every chat) straight to any target tier — e.g. picking
 * RPT-003 from the tier menu asks RPT-002's questions AND RPT-003's,
 * since nothing beyond RPT-001 has been asked yet. Callers filter out
 * anything already answered before queuing these.
 */
export function getQuestionsUpTo(targetTier: ReportTierId): ChatQuestion[] {
  const targetIndex = REPORT_TIERS.findIndex(t => t.id === targetTier)
  if (targetIndex <= 0) return []
  const tierIds = new Set(REPORT_TIERS.slice(1, targetIndex + 1).map(t => t.id))
  return CHAT_QUESTION_BANK.filter(q => tierIds.has(q.tier))
}
