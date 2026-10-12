// import type { ActorId } from '@/types'
// import { hasWholeWord, escapeRegExp } from '@/lib/textMatch'

// /**
//  * goalActorMap.ts
//  * ────────────────
//  * Single source of truth for "if someone's goal is X, they're probably
//  * actor Y" — used as a fallback suggestion ONLY when no actor was
//  * explicitly typed/detected in the query (see detectActor in actors.ts).
//  *
//  * This file is intentionally separate and dead simple to edit: add or
//  * change a row here, nothing else needs to change.
//  *
//  * IMPORTANT: this is a *suggestion*, never auto-applied. It always
//  * goes through the same ActorConfirmModal popup as text-detected
//  * actors before selectedActor is actually set.
//  */
// export const GOAL_ACTOR_MAP: Record<string, ActorId> = {
//   'build extension':  'homeowner',
//   'extension':         'homeowner',
//   'loft conversion':   'homeowner',
//   'home renovation':   'homeowner',

//   'development':       'landlord',
//   'rental property':   'landlord',
//   'buy to let':        'landlord',

//   'construction':      'builder',
//   'new build':         'builder',
//   'house building':    'builder',

//   'planning advice':   'consultant',
//   'planning application': 'consultant',

//   'design':            'architect',
//   'architectural drawings': 'architect',

//   'site acquisition':  'business',
//   'commercial development': 'business',
// }

// /**
//  * Returns the actor id whose goal-keyword appears (whole word) in the
//  * query, preferring the longest matching keyword if multiple match
//  * (so "build extension" beats "extension" if both were ever mapped
//  * to different actors).
//  */
// export function inferActorFromGoal(query: string): ActorId | null {
//   const lower = query.toLowerCase().trim()
//   if (!lower) return null

//   let bestMatch: { keyword: string; actorId: ActorId } | null = null

//   for (const [keyword, actorId] of Object.entries(GOAL_ACTOR_MAP)) {
//     if (hasWholeWord(lower, keyword)) {
//       if (!bestMatch || keyword.length > bestMatch.keyword.length) {
//         bestMatch = { keyword, actorId }
//       }
//     }
//   }

//   return bestMatch ? bestMatch.actorId : null
// }

// // Re-exported for any callers that previously imported escapeRegExp
// // from this file directly (kept for backwards compatibility).
// export { escapeRegExp }


// import type { ActorId, GoalId } from '@/types'
// import { INTENT_QUESTIONS } from '@/lib/intent/intentQuestions'
// import { scoreSignals } from '@/lib/intent/resolveActor'
// import { escapeRegExp } from '@/lib/textMatch'

// /**
//  * goalActorMap.ts
//  * ────────────────
//  * "If someone's classified goal is X, they're probably actor Y" —
//  * used as a fallback suggestion ONLY when no actor was explicitly
//  * typed/detected in the query (see detectActor in actors.ts).
//  *
//  * GOAL_ID_TO_INTENT_GOAL is the only thing this file still hardcodes:
//  * which option of the intent flow's "goal" question (see
//  * lib/intent/intentQuestions.ts) a given homepage GoalId corresponds
//  * to. Everything downstream — which actor(s) that goal implies, and
//  * by how much — comes from the exact same Signal_Weights the
//  * goal/relationship/role question flow uses, via scoreSignals().
//  *
//  * Previously this file carried its own independent keyword→actor
//  * table (re-scanning the raw query text with a second, separate set
//  * of phrases) that could silently drift out of sync with the intent
//  * flow's weights. Now there's one scoring engine behind both surfaces:
//  * a search for "loft conversion" suggests the same actor a user would
//  * get by answering "Build, extend, or alter it" on the first intent
//  * question, because it's the literal same signals object.
//  *
//  * IMPORTANT: this is a *suggestion*, never auto-applied. It always
//  * goes through the same ActorConfirmModal popup as text-detected
//  * actors before selectedActor is actually set.
//  */
// const GOAL_ID_TO_INTENT_GOAL: Partial<Record<GoalId, string>> = {
//   ext:         'improve',
//   loft:        'improve',
//   windows:     'improve',
//   outbuilding: 'improve',
//   hmo:         'hmo',
//   land:        'develop',
//   refusal:     'refusal',
//   b2b:         'client_check',
//   unsure:      'unsure',
//   // 'managed' ("handle everything for me") is intentionally omitted —
//   // it doesn't imply a single actor persona, same as the intent flow
//   // has no direct equivalent option for it.
// }

// export interface GoalActorInference {
//   actorId: ActorId
//   /** top score ÷ total, from the same engine the intent flow uses — not a flat guess */
//   confidence: number
// }

// /**
//  * Infers an actor from an already-classified GoalId (see
//  * classifyGoalLocally in useSearch.ts) — no separate keyword scan.
//  * Runs that goal's intent-question signals through the same scoring
//  * engine the goal/relationship/role flow uses.
//  */
// export function inferActorFromGoalId(goalId: GoalId): GoalActorInference | null {
//   const intentGoalValue = GOAL_ID_TO_INTENT_GOAL[goalId]
//   if (!intentGoalValue) return null

//   const option = INTENT_QUESTIONS
//     .find(q => q.id === 'goal')
//     ?.options.find(o => o.value === intentGoalValue)
//   if (!option) return null

//   const { actorId, confidence } = scoreSignals([option.signals])
//   if (!actorId) return null

//   return { actorId, confidence }
// }

// // Re-exported for any callers that previously imported escapeRegExp
// // from this file directly (kept for backwards compatibility).
// export { escapeRegExp }



import type { ActorId, GoalId } from '@/types'
import { INTENT_QUESTIONS } from '@/lib/intent/intentQuestions'
import { scoreSignals } from '@/lib/intent/resolveActor'
import { escapeRegExp } from '@/lib/textMatch'

/**
 * goalActorMap.ts
 * ────────────────
 * "If someone's classified goal is X, they're probably actor Y" —
 * used as a fallback suggestion ONLY when no actor was explicitly
 * typed/detected in the query (see detectActor in actors.ts).
 *
 * GOAL_ID_TO_INTENT_GOAL is the only thing this file still hardcodes:
 * which option of the intent flow's "goal" question (see
 * lib/intent/intentQuestions.ts) a given homepage GoalId corresponds
 * to. Everything downstream — which actor(s) that goal implies, and
 * by how much — comes from the exact same Signal_Weights the
 * goal/relationship/role question flow uses, via scoreSignals().
 *
 * Previously this file carried its own independent keyword→actor
 * table (re-scanning the raw query text with a second, separate set
 * of phrases) that could silently drift out of sync with the intent
 * flow's weights. Now there's one scoring engine behind both surfaces:
 * a search for "loft conversion" suggests the same actor a user would
 * get by answering "Build, extend, or alter it" on the first intent
 * question, because it's the literal same signals object.
 *
 * IMPORTANT: this is a *suggestion*, never auto-applied. It always
 * goes through the same ActorConfirmModal popup as text-detected
 * actors before selectedActor is actually set.
 */
const GOAL_ID_TO_INTENT_GOAL: Partial<Record<GoalId, string>> = {
  ext:         'improve',
  loft:        'improve',
  windows:     'improve',
  outbuilding: 'improve',
  hmo:         'hmo',
  land:        'develop',
  refusal:     'refusal',
  b2b:         'client_check',
  unsure:      'unsure',
  // 'managed' ("handle everything for me") is intentionally omitted —
  // it doesn't imply a single actor persona, same as the intent flow
  // has no direct equivalent option for it.
}

export interface GoalActorInference {
  actorId: ActorId
  /** top score ÷ total, from the same engine the intent flow uses — not a flat guess */
  confidence: number
}

/**
 * Infers an actor from an already-classified GoalId (see
 * classifyGoalLocally in useSearch.ts) — no separate keyword scan.
 * Runs that goal's intent-question signals through the same scoring
 * engine the goal/relationship/role flow uses.
 */
export function inferActorFromGoalId(goalId: GoalId): GoalActorInference | null {
  const intentGoalValue = GOAL_ID_TO_INTENT_GOAL[goalId]
  if (!intentGoalValue) return null

  const option = INTENT_QUESTIONS
    .find(q => q.id === 'goal')
    ?.options.find(o => o.value === intentGoalValue)
  if (!option) return null

  const { actorId, confidence } = scoreSignals([option.signals])
  if (!actorId) return null

  return { actorId, confidence }
}

// Re-exported for any callers that previously imported escapeRegExp
// from this file directly (kept for backwards compatibility).
export { escapeRegExp }