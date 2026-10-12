import { getQuestionsForTier, getQuestionsUpTo } from './reportTiers'
import type { ChatQuestion, ReportTierId, TierAnswers } from '@/types/reportTiers'
import type { ActorId, GoalId } from '@/types'

/**
 * questionEngine.ts
 * ───────────────────
 * Client-side entry point useReportChatFlow.ts calls to get the next
 * batch of intake questions for a tier — tailored to the actor/goal via
 * /api/chat/questions. Mirrors the same fallback the API route already
 * does server-side, so a network failure here degrades to the exact
 * same untailored bank rather than breaking the flow.
 */
export interface TailoredQuestionsRequest {
  /** 'tier' → only this tier's own questions (used for the initial RPT-001 flow). */
  mode: 'tier' | 'upTo'
  tier: ReportTierId
  actorId: ActorId | null
  goalId: GoalId | 'unsure' | null
  /** Already-collected answers — used both to skip re-asking and as context for tailoring. */
  answers: TierAnswers
}

export async function getTailoredQuestions(req: TailoredQuestionsRequest): Promise<ChatQuestion[]> {
  const fallback = (req.mode === 'upTo' ? getQuestionsUpTo(req.tier) : getQuestionsForTier(req.tier)).filter(
    q => !(q.id in req.answers)
  )

  try {
    const res = await fetch('/api/chat/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    if (!res.ok) return fallback

    const data = await res.json()
    if (!Array.isArray(data.questions)) return fallback
    // Empty array is a valid, meaningful answer ("nothing left to ask") —
    // only fall back when the shape itself is unusable.
    return data.questions as ChatQuestion[]
  } catch {
    return fallback
  }
}