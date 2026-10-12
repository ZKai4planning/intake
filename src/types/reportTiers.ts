import type { QuestionOption } from './questions'
import type { ActorId } from './index'

/**
 * reportTiers.ts
 * ────────────────
 * Mirrors the Report_Tier_Catalogue (RPT-001–RPT-005) from the workbook.
 * This is a SEPARATE axis from WorkspaceTier (types/workspace.ts):
 *
 *   WorkspaceTier  → who the person is (homeowner / landlord / developer…)
 *   ReportTierId   → how deep the report they're asking for is, inside
 *                     the public, pre-login chat (RPT-001 free snapshot
 *                     all the way through to RPT-005 bespoke proposal)
 *
 * Report generation itself never requires login. Only two things sit
 * behind auth:
 *   1. Downloading/saving a generated report (any tier)
 *   2. RPT-004/005, which need a human consultant, so "generating" them
 *      is really submitting a lead rather than an instant AI report
 */

export type ReportTierId = 'RPT-001' | 'RPT-002' | 'RPT-003' | 'RPT-004' | 'RPT-005'

export interface ReportTierDef {
  id: ReportTierId
  name: string
  positioning: string
  /** Short badge shown on the report card, e.g. "Free" / "Premium report" */
  badge: string
  inputsSummary: string
  outputSummary: string
  /**
   * The exact upsell/CTA line from the workbook, asked as a chat message
   * with Yes/No (or single CTA button for RPT-005, the terminal tier).
   */
  upsellQuestion: string
  /** Whether this tier is instantly AI-generated, or routes to a human/lead form */
  automated: boolean
  /** Price in GBP. null = free (RPT-001) or bespoke/quote-only (RPT-004/005). */
  priceGBP: number | null
  /** What to show next to the price — "Free", "£29", "Custom quote" */
  priceLabel: string
}

export interface ChatQuestion {
  id: string
  tier: ReportTierId
  /** Fallback wording — used verbatim if the LLM tailoring call fails/is unavailable. */
  shortLabel: string   // ← short tag shown above the answer bubble, e.g. "Postcode"
  /** Fallback wording — used verbatim if the LLM tailoring call fails/is unavailable. */
  prompt: string
  inputType: 'text' | 'options'
  placeholder?: string
  /** Required answers are never skipped, even if the LLM judges them irrelevant for this actor. */
  required?: boolean
  /**
   * Short note on what this data is used for downstream (report logic,
   * upsell triggers, etc). Sent to the LLM as context when tailoring the
   * question for a specific actor/goal — never shown to the end user.
   */
  hint?: string
  options?: {
    /** Canonical value — the LLM may relabel but must never change or drop this. */
    value: string
    label: string
    impliesActor?: ActorId
    triggersUpsell?: boolean
  }[]
}
export type TierAnswers = Record<string, string>