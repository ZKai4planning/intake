// import type { ActorId } from './index'

// /**
//  * intent.ts
//  * ──────────
//  * The pre-flight "intent confirmation" step that runs BEFORE the tiered
//  * IntakeForm. Its job: infer the actor (homeowner / landlord / developer /
//  * consultant / architect / business) from a short sequence of goal-intent
//  * questions, instead of asking the user to self-select a pill.
//  *
//  * Why this exists: a self-selected "I am a…" pill is guessable/misjudged
//  * (e.g. a landlord doing an extension on their rental might click
//  * "Homeowner" because the goal feels like a homeowner task). Asking what
//  * they're trying to DO, then their relationship to the property, resolves
//  * the actor far more reliably — and lets us re-resolve mid-form if a later
//  * answer contradicts it.
//  */

// export type IntentQuestionId = 'goal' | 'relationship' | 'role'

// export interface IntentOption {
//   value: string
//   label: string
//   emoji?: string
//   /** Actor signals this option casts a weighted vote for. Values are additive, not normalised. */
//   signals: Partial<Record<ActorId, number>>
// }

// export interface IntentQuestion {
//   id: IntentQuestionId
//   prompt: string
//   helper?: string
//   options: IntentOption[]
// }

// export interface IntentAnswer {
//   questionId: IntentQuestionId
//   optionValue: string
// }

// export interface ActorResolution {
//   actorId: ActorId | null
//   /** 0–1, share of total signal weight the top actor holds */
//   confidence: number
//   scores: Record<ActorId, number>
//   resolvedFrom: IntentAnswer[]
//   isConfident: boolean
// }



/**
 * intent.ts
 * ──────────
 * The pre-flight "intent confirmation" step that runs BEFORE the tiered
 * IntakeForm. Its job: infer the actor (homeowner / landlord / developer /
 * consultant / architect / business) from a short sequence of goal-intent
 * questions, instead of asking the user to self-select a pill.
 *
 * Why this exists: a self-selected "I am a…" pill is guessable/misjudged
 * (e.g. a landlord doing an extension on their rental might click
 * "Homeowner" because the goal feels like a homeowner task). Asking what
 * they're trying to DO, then their relationship to the property, resolves
 * the actor far more reliably — and lets us re-resolve mid-form if a later
 * answer contradicts it.
 */

import type { ActorId } from './index'

/**
 * intent.ts
 * ──────────
 * The pre-flight "intent confirmation" step that runs BEFORE the tiered
 * IntakeForm. Its job: infer the actor (homeowner / landlord / developer /
 * consultant / architect / business) from a short sequence of goal-intent
 * questions, instead of asking the user to self-select a pill.
 *
 * Why this exists: a self-selected "I am a…" pill is guessable/misjudged
 * (e.g. a landlord doing an extension on their rental might click
 * "Homeowner" because the goal feels like a homeowner task). Asking what
 * they're trying to DO, then their relationship to the property, resolves
 * the actor far more reliably — and lets us re-resolve mid-form if a later
 * answer contradicts it.
 */

export type IntentQuestionId = 'goal' | 'relationship' | 'role' | 'subrole'

export interface IntentOption {
  value: string
  label: string
  emoji?: string
  /** Actor signals this option casts a weighted vote for. Values are additive, not normalised. */
  signals: Partial<Record<ActorId, number>>
}

export interface IntentQuestion {
  id: IntentQuestionId
  prompt: string
  helper?: string
  options: IntentOption[]
}

export interface IntentAnswer {
  questionId: IntentQuestionId
  optionValue: string
}

export interface ActorResolution {
  actorId: ActorId | null
  /** 0–1, share of total signal weight the top actor holds */
  confidence: number
  /** Raw (non-normalized) score gap between the top and second actor */
  margin: number
  scores: Record<ActorId, number>
  resolvedFrom: IntentAnswer[]
  /** false whenever the actor clarifier (Q-014) should fire */
  isConfident: boolean
  /** true when the winning actor is Business, or the role answer was "I represent an agency/company" — sub-role clarifier (Q-004) should fire */
  needsSubRole: boolean
  /** The answered 'subrole' option value, once the sub-role clarifier has been asked and answered */
  subRoleValue: string | null
}