import type { WorkspaceTier } from './workspace'
import type { ActorId } from './index'

/**
 * questions.ts
 * ─────────────
 * Mirrors the Question_Module_Bank (QMB) schema from the workbook.
 * Row IDs below correspond directly to the pasted question set
 * (Row 001–017, the householder/full-application intake form).
 *
 * Each question declares minTier — the simplest workspace tier that
 * sees it. A homeowner (tier: simple) only sees questions where
 * minTier === 'simple'. A developer (tier: advanced) sees everything
 * up to and including 'advanced'.
 *
 * This lets ONE question bank drive every workspace — no actor-specific
 * branching in components, only data-driven filtering.
 */

export type QuestionInputType =
  | 'text'
  | 'textarea'
  | 'radio'
  | 'radio-text'        // radio with conditional text reveal (e.g. Yes/No + details)
  | 'dropdown'
  | 'dropdown-text'
  | 'checkbox-group'
  | 'file-upload'
  | 'radio-file'         // radio + conditional file upload
  | 'signature'

export interface QuestionOption {
  value: string
  label: string
  /** If selecting this option should trigger an upsell/consultation prompt */
  triggersUpsell?: boolean
  /**
   * If selecting this option strongly implies a different actor than the
   * one resolved during intent confirmation (e.g. picking "Change of use"
   * after being set up as a homeowner), useQuestionFlow surfaces an
   * ActorRevisionBanner so the workspace/tier can be corrected mid-form.
   */
  impliesActor?: ActorId
}

export interface QuestionRow {
  /** Matches the workbook Row ID, e.g. "001" */
  rowId:        string
  field:        string
  inputType:    QuestionInputType
  options?:      QuestionOption[]
  placeholder?: string
  guidance:     string
  /** Revenue / consultation trigger description from the workbook */
  upsellTrigger?: string
  /** Simplest workspace tier that should see this question */
  minTier:      WorkspaceTier
  required:     boolean
  /** Conditional: only show if another row's answer matches a value */
  showIf?: {
    rowId: string
    equals: string
  }
}

export interface QuestionAnswer {
  rowId: string
  value: string | string[] | File[] | null
  /** Set true when the user picked an option/state that should trigger an upsell */
  flaggedForUpsell?: boolean
}

export interface UpsellEvent {
  rowId:       string
  field:       string
  reason:      string
  suggestedAction: string
}
