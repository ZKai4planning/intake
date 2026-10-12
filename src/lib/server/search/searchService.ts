import { hasWholeWord } from './textMatch'
import { GOALS, SEARCH_KEYWORDS, GOAL_USERTYPE_TO_ACTOR, type GoalId } from './goalsData'
import { detectActor, type ActorSuggestion } from './actorsData'

const MIN_QUERY_LENGTH = 3

export interface ClassifyResponse {
  goalId: GoalId | 'unsure'
  confidence: number
  label: string
  actor: ActorSuggestion | null
}

/**
 * Whole-word goal classifier, preferring the longest matching keyword
 * when more than one hits (e.g. "side extension" should win over the
 * shorter "site" if both happen to match). Server-side counterpart of
 * the frontend's classifyGoalLocally/classifyGoalId, kept deliberately
 * identical so results don't drift once this endpoint is live.
 */
export function classifyQuery(query: string): ClassifyResponse {
  const lower = query.toLowerCase().trim()

  if (lower.length < MIN_QUERY_LENGTH) {
    return { goalId: 'unsure', confidence: 0, label: 'Not sure — let me check', actor: null }
  }

  let best: { keyword: string; goalId: GoalId } | null = null
  for (const [kw, goalId] of Object.entries(SEARCH_KEYWORDS)) {
    if (hasWholeWord(lower, kw)) {
      if (!best || kw.length > best.keyword.length) best = { keyword: kw, goalId }
    }
  }

  const actor = detectActor(query)

  if (!best) {
    return { goalId: 'unsure', confidence: 0, label: 'Not sure — let me check', actor }
  }

  const goal = GOALS.find(g => g.id === best!.goalId)!

  // No explicit actor mentioned in the text — fall back to what this
  // goal usually implies (e.g. "hmo" implies a landlord).
  const resolvedActor = actor ?? (
    GOAL_USERTYPE_TO_ACTOR[goal.userType]
      ? { actorId: GOAL_USERTYPE_TO_ACTOR[goal.userType]!, label: goal.userType, confidence: 0.6, wasCorrected: false }
      : null
  )

  return { goalId: goal.id, confidence: 0.85, label: goal.title, actor: resolvedActor }
}

export function listGoals() {
  return GOALS
}
