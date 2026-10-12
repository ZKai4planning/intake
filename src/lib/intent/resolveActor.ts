// // import { INTENT_QUESTIONS } from './intentQuestions'
// // import type { ActorId } from '@/types'
// // import type { ActorResolution, IntentAnswer, IntentQuestionId } from '@/types/intent'

// // const ACTOR_IDS: ActorId[] = ['homeowner', 'landlord', 'developer', 'consultant', 'architect', 'business']

// // /**
// //  * resolveActor
// //  * ─────────────
// //  * Sums the weighted actor signals from every answered intent question
// //  * and returns the current best guess plus a confidence score. Confidence
// //  * is `topScore / totalScore` — how dominant the leading actor is relative
// //  * to everything else in play, not an absolute probability.
// //  *
// //  * isConfident gates whether we can stop asking questions: either the top
// //  * actor holds a clear majority of the signal weight, or it leads the
// //  * runner-up by a wide enough margin that a third question wouldn't change
// //  * the outcome.
// //  */
// // export function resolveActor(answers: IntentAnswer[]): ActorResolution {
// //   const scores = Object.fromEntries(ACTOR_IDS.map(id => [id, 0])) as Record<ActorId, number>

// //   for (const answer of answers) {
// //     const question = INTENT_QUESTIONS.find(q => q.id === answer.questionId)
// //     const option = question?.options.find(o => o.value === answer.optionValue)
// //     if (!option) continue

// //     for (const actorId of ACTOR_IDS) {
// //       scores[actorId] += option.signals[actorId] ?? 0
// //     }
// //   }

// //   const ranked = ACTOR_IDS
// //     .map(id => ({ id, score: scores[id] }))
// //     .sort((a, b) => b.score - a.score)

// //   const top = ranked[0]
// //   const runnerUp = ranked[1]
// //   const total = ranked.reduce((sum, r) => sum + r.score, 0)

// //   const confidence = total > 0 ? top.score / total : 0
// //   const margin = total > 0 ? (top.score - runnerUp.score) / total : 0
// //   const isConfident = total > 0 && top.score > 0 && (confidence >= 0.55 || margin >= 0.3)

// //   return {
// //     actorId: top.score > 0 ? top.id : null,
// //     confidence: Number(confidence.toFixed(2)),
// //     scores,
// //     resolvedFrom: answers,
// //     isConfident,
// //   }
// // }

// // /**
// //  * getNextQuestionId
// //  * ───────────────────
// //  * Decides the next question in the sequence, or null when the flow is done.
// //  * "goal" and "relationship" are always asked. "role" is only asked when the
// //  * person flagged they're acting for someone else (relationship = client_work,
// //  * or goal = client_check) or when the answers so far are still ambiguous —
// //  * so most people finish after 2 questions, not 3.
// //  */
// // export function getNextQuestionId(answers: IntentAnswer[]): IntentQuestionId | null {
// //   const answeredIds = new Set(answers.map(a => a.questionId))

// //   if (!answeredIds.has('goal')) return 'goal'
// //   if (!answeredIds.has('relationship')) return 'relationship'
// //   if (answeredIds.has('role')) return null

// //   const relationship = answers.find(a => a.questionId === 'relationship')?.optionValue
// //   const resolution = resolveActor(answers)

// //   const needsRoleClarification = relationship === 'client_work' || !resolution.isConfident
// //   return needsRoleClarification ? 'role' : null
// // }

// import { INTENT_QUESTIONS } from './intentQuestions'
// import type { ActorId } from '@/types'
// import type { ActorResolution, IntentAnswer, IntentQuestionId } from '@/types/intent'

// const ACTOR_IDS: ActorId[] = ['homeowner', 'landlord', 'developer', 'consultant', 'architect', 'business']

// /**
//  * resolveActor
//  * ─────────────
//  * Sums the weighted actor signals from every answered intent question
//  * and returns the current best guess plus a confidence score. Confidence
//  * is `topScore / totalScore` — how dominant the leading actor is relative
//  * to everything else in play, not an absolute probability.
//  *
//  * isConfident gates whether we can stop asking questions: either the top
//  * actor holds a clear majority of the signal weight, or it leads the
//  * runner-up by a wide enough margin that a third question wouldn't change
//  * the outcome.
//  */
// export function resolveActor(answers: IntentAnswer[]): ActorResolution {
//   const scores = Object.fromEntries(ACTOR_IDS.map(id => [id, 0])) as Record<ActorId, number>

//   for (const answer of answers) {
//     const question = INTENT_QUESTIONS.find(q => q.id === answer.questionId)
//     const option = question?.options.find(o => o.value === answer.optionValue)
//     if (!option) continue

//     for (const actorId of ACTOR_IDS) {
//       scores[actorId] += option.signals[actorId] ?? 0
//     }
//   }

//   const ranked = ACTOR_IDS
//     .map(id => ({ id, score: scores[id] }))
//     .sort((a, b) => b.score - a.score)

//   const top = ranked[0]
//   const runnerUp = ranked[1]
//   const total = ranked.reduce((sum, r) => sum + r.score, 0)

//   const confidence = total > 0 ? top.score / total : 0
//   const margin = total > 0 ? (top.score - runnerUp.score) / total : 0
//   const isConfident = total > 0 && top.score > 0 && (confidence >= 0.55 || margin >= 0.3)

//   return {
//     actorId: top.score > 0 ? top.id : null,
//     confidence: Number(confidence.toFixed(2)),
//     scores,
//     resolvedFrom: answers,
//     isConfident,
//   }
// }

// /**
//  * getNextQuestionId
//  * ───────────────────
//  * Decides the next question in the sequence, or null when the flow is done.
//  * "goal" and "relationship" are always asked. "role" is only asked when the
//  * person flagged they're acting for someone else (relationship = 'client_work',
//  * or goal = 'client_check') — never as a generic low-confidence fallback, since
//  * its options are exclusively professional and have no correct answer for an
//  * owner. So most people finish after 2 questions, not 3.
//  */
// export function getNextQuestionId(answers: IntentAnswer[]): IntentQuestionId | null {
//   const answeredIds = new Set(answers.map(a => a.questionId))

//   if (!answeredIds.has('goal')) return 'goal'
//   if (!answeredIds.has('relationship')) return 'relationship'
//   if (answeredIds.has('role')) return null

//   const relationship = answers.find(a => a.questionId === 'relationship')?.optionValue
//   const goal = answers.find(a => a.questionId === 'goal')?.optionValue

//   // The "role" clarifier ONLY makes sense when the person is acting on
//   // someone else's behalf — its options are exclusively professional
//   // ("planning consultant", "architect/designer", "agency/business").
//   // Previously this was also triggered by a generic `!isConfident`
//   // check, which meant an owner who picked e.g. "Develop or check the
//   // potential of a site" + "I own it and live here" (a perfectly clear
//   // homeowner) could land just under the confidence threshold and be
//   // forced to pick one of those three professional labels — there was
//   // no "it's my own project" option — corrupting their result toward
//   // architect/consultant/business.
//   //
//   // "relationship" is the authoritative signal (see the doc comment on
//   // INTENT_QUESTIONS above) — an ownership answer (live_in / rent_out /
//   // developing / multi_property) should never be overridden by this
//   // fallback. Only ask "role" when relationship = 'client_work', or
//   // (belt-and-braces) when the goal itself was "checking this for a
//   // client" but the relationship question didn't get flagged as such.check
//   const needsRoleClarification = relationship === 'client_work' || goal === 'client_check'
//   return needsRoleClarification ? 'role' : null
// }

import { INTENT_QUESTIONS } from './intentQuestions'
import type { ActorId } from '@/types'
import type { ActorResolution, IntentAnswer, IntentQuestionId } from '@/types/intent'

export const ACTOR_IDS: ActorId[] = ['homeowner', 'landlord', 'developer', 'consultant', 'architect', 'business']

/**
 * Tie-break priority — mirrors the Actor Resolution Matrix exactly.
 * When two actors are exactly tied on score, the more specialized
 * workflow wins: Architect > Business > Developer > Consultant >
 * Landlord > Homeowner.
 */
export const TIE_BREAK_PRIORITY: ActorId[] = ['architect', 'business', 'developer', 'consultant', 'landlord', 'homeowner']

/** Actor clarifier (Q-014) fires below this share of total signal weight. */
export const ACTOR_CLARIFIER_CONFIDENCE_THRESHOLD = 0.55

export interface ScoredSignals {
  scores: Record<ActorId, number>
  ranked: Array<{ id: ActorId; score: number }>
  total: number
  actorId: ActorId | null
  /** top score ÷ total of all 6 actor scores */
  confidence: number
  /** top score − second score, RAW difference, not normalized */
  margin: number
}

/**
 * scoreSignals
 * ─────────────
 * Canonical scoring engine — mirrors the Actor Resolution Matrix's
 * Signal_Weights / Resolution_Matrix sheets exactly. This is the ONLY
 * place actor scores get computed; both the goal/relationship/role
 * question flow (resolveActor, below) and the search bar's goal-based
 * actor inference (lib/goalActorMap.ts) call into this same function,
 * so the two surfaces can't drift out of sync with each other again.
 *
 *   score      = sum of the matched signal weights, across however
 *                many answers/options are passed in
 *   confidence = top actor's score ÷ total of all 6 actor scores
 *   margin     = top actor's score − second actor's score
 *                (raw difference, NOT normalized)
 *   tie-break  = TIE_BREAK_PRIORITY, most specialized workflow wins
 */
export function scoreSignals(signalSets: Array<Partial<Record<ActorId, number>> | undefined>): ScoredSignals {
  const scores = Object.fromEntries(ACTOR_IDS.map(id => [id, 0])) as Record<ActorId, number>

  for (const signals of signalSets) {
    if (!signals) continue
    for (const actorId of ACTOR_IDS) {
      scores[actorId] += signals[actorId] ?? 0
    }
  }

  const ranked = ACTOR_IDS
    .map(id => ({ id, score: scores[id] }))
    .sort((a, b) => b.score - a.score || TIE_BREAK_PRIORITY.indexOf(a.id) - TIE_BREAK_PRIORITY.indexOf(b.id))

  const top = ranked[0]
  const second = ranked[1]
  const total = ranked.reduce((sum, r) => sum + r.score, 0)

  const confidence = total > 0 ? top.score / total : 0
  const margin = top.score - second.score // raw difference, not normalized

  return {
    scores,
    ranked,
    total,
    actorId: top.score > 0 ? top.id : null,
    confidence,
    margin,
  }
}

/**
 * roleNeeded — Q-003. Yes only if relationship = "working on it for a
 * client, not myself" OR relationship = "part of a business managing
 * multiple properties" OR goal = "checking this for a client, not
 * myself". Never a generic low-confidence fallback — role's options
 * are exclusively professional, so it must never fire just because an
 * owner's combination happened to score ambiguously.
 */
export function roleNeeded(goal?: string, relationship?: string): boolean {
  return relationship === 'client_work' || relationship === 'multi_property' || goal === 'client_check'
}

/**
 * actorClarifierNeeded — Q-014. Yes if goal = "not sure yet —
 * exploring" OR confidence is below the cutoff. This is a plain-English
 * confirmation only — it never exposes scores to the user.
 */
export function actorClarifierNeeded(
  goal: string | undefined,
  confidence: number,
  threshold: number = ACTOR_CLARIFIER_CONFIDENCE_THRESHOLD
): boolean {
  return goal === 'unsure' || confidence < threshold
}

/**
 * businessSubRoleNeeded — ask the sub-role clarifier (Q-004) if the
 * role answer was "I represent an agency/company" OR the winning
 * actor is Business.
 */
export function businessSubRoleNeeded(roleValue: string | null | undefined, actorId: ActorId | null): boolean {
  return roleValue === 'agency_business' || actorId === 'business'
}

function signalSetsForAnswers(answers: IntentAnswer[]): Array<Partial<Record<ActorId, number>> | undefined> {
  return answers.map(answer => {
    const question = INTENT_QUESTIONS.find(q => q.id === answer.questionId)
    return question?.options.find(o => o.value === answer.optionValue)?.signals
  })
}

/**
 * resolveActor
 * ─────────────
 * Sums the weighted actor signals from every answered intent question
 * (via scoreSignals) and applies the matrix's Q-014 / Q-004 rules on
 * top to report whether the actor clarifier or business sub-role
 * clarifier should fire.
 */
export function resolveActor(answers: IntentAnswer[]): ActorResolution {
  const result = scoreSignals(signalSetsForAnswers(answers))

  const goal = answers.find(a => a.questionId === 'goal')?.optionValue
  const roleValue = answers.find(a => a.questionId === 'role')?.optionValue
  const subRoleValue = answers.find(a => a.questionId === 'subrole')?.optionValue ?? null

  const needsClarifier = actorClarifierNeeded(goal, result.confidence)
  const needsSubRole = businessSubRoleNeeded(roleValue, result.actorId)

  return {
    actorId: result.actorId,
    confidence: Number(result.confidence.toFixed(2)),
    margin: Number(result.margin.toFixed(2)),
    scores: result.scores,
    resolvedFrom: answers,
    isConfident: !needsClarifier,
    needsSubRole,
    subRoleValue,
  }
}

/**
 * getNextQuestionId
 * ───────────────────
 * Decides the next question in the sequence, or null when the flow is
 * done.
 *
 *   1. "goal"          — always asked first.
 *   2. "relationship"  — always asked second.
 *   3. "role"          — asked when roleNeeded() says so.
 *   4. "subrole"       — asked when businessSubRoleNeeded() says so,
 *                         i.e. the role answer was "I represent an
 *                         agency/company" OR the actor resolved from
 *                         goal+relationship(+role) so far is Business.
 *                         Pure metadata — its options carry no signals,
 *                         so asking it can never change which actor won.
 *
 * Most people finish after 2 questions; client/business paths add a
 * 3rd; Business specifically may add a 4th.
 */
export function getNextQuestionId(answers: IntentAnswer[]): IntentQuestionId | null {
  const answeredIds = new Set(answers.map(a => a.questionId))

  if (!answeredIds.has('goal')) return 'goal'
  if (!answeredIds.has('relationship')) return 'relationship'

  const relationship = answers.find(a => a.questionId === 'relationship')?.optionValue
  const goal = answers.find(a => a.questionId === 'goal')?.optionValue

  if (roleNeeded(goal, relationship) && !answeredIds.has('role')) return 'role'
  if (answeredIds.has('subrole')) return null

  const roleValue = answers.find(a => a.questionId === 'role')?.optionValue
  const { actorId } = scoreSignals(signalSetsForAnswers(answers))

  return businessSubRoleNeeded(roleValue, actorId) ? 'subrole' : null
}