'use client'

import { useState, useMemo, useCallback } from 'react'
import { getQuestionsForTier } from '@/lib/questions/questionBank'
import type { QuestionAnswer, UpsellEvent, QuestionRow } from '@/types/questions'
import type { WorkspaceTier } from '@/types/workspace'
import type { ActorId } from '@/types'

export interface ActorContradiction {
  rowId: string
  impliedActorId: ActorId
}

/**
 * useQuestionFlow
 * ────────────────
 * Drives the tiered intake form on the dashboard.
 *
 * - Pulls the right question subset for the workspace tier
 * - Tracks answers keyed by rowId
 * - Detects when an answer should trigger an upsell event
 *   (any option with triggersUpsell: true, e.g. "Don't know" / "Unsure")
 * - Computes simple completion progress for a progress bar
 *
 * API integration point:
 *   On submit, POST /api/intake/submit { tier, answers, upsellEvents }
 *   The backend can then route upsellEvents into the consultant queue.
 */
export function useQuestionFlow(
  tier: WorkspaceTier,
  resolvedActorId?: ActorId | null,
  initialAnswers?: Record<string, QuestionAnswer>
) {
  const questions = useMemo(() => getQuestionsForTier(tier), [tier])

  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>(initialAnswers ?? {})
  const [upsellEvents, setUpsellEvents] = useState<UpsellEvent[]>([])
  const [contradiction, setContradiction] = useState<ActorContradiction | null>(null)
  const [dismissedRowIds, setDismissedRowIds] = useState<Set<string>>(new Set())

  const setAnswer = useCallback(
    (rowId: string, value: string | string[] | File[] | null) => {
      const question = questions.find(q => q.rowId === rowId)
      if (!question) return

      const flagged = isFlaggedForUpsell(question, value)

      setAnswers(prev => ({
        ...prev,
        [rowId]: { rowId, value, flaggedForUpsell: flagged },
      }))

      setUpsellEvents(prev => {
        const withoutThisRow = prev.filter(e => e.rowId !== rowId)
        if (!flagged) return withoutThisRow

        return [
          ...withoutThisRow,
          {
            rowId,
            field: question.field,
            reason: describeReason(question, value),
            suggestedAction: question.upsellTrigger ?? 'Recommend speaking with a consultant.',
          },
        ]
      })

      if (resolvedActorId && !dismissedRowIds.has(rowId)) {
        const implied = getImpliedActor(question, value)
        if (implied && implied !== resolvedActorId) {
          setContradiction({ rowId, impliedActorId: implied })
        } else if (contradiction?.rowId === rowId) {
          setContradiction(null)
        }
      }
    },
    [questions, resolvedActorId, dismissedRowIds, contradiction]
  )

  const dismissContradiction = useCallback(() => {
    if (!contradiction) return
    setDismissedRowIds(prev => new Set(prev).add(contradiction.rowId))
    setContradiction(null)
  }, [contradiction])

  const clearContradiction = useCallback(() => setContradiction(null), [])

  const visibleQuestions = useMemo(
    () => questions.filter(q => isVisible(q, answers)),
    [questions, answers]
  )

  const answeredCount = useMemo(
    () => visibleQuestions.filter(q => {
      const a = answers[q.rowId]
      return a && a.value !== null && a.value !== '' &&
        !(Array.isArray(a.value) && a.value.length === 0)
    }).length,
    [visibleQuestions, answers]
  )

  const requiredQuestions = visibleQuestions.filter(q => q.required)
  const requiredAnsweredCount = requiredQuestions.filter(q => {
    const a = answers[q.rowId]
    return a && a.value !== null && a.value !== ''
  }).length

  const progress = visibleQuestions.length
    ? Math.round((answeredCount / visibleQuestions.length) * 100)
    : 0

  const canSubmit = requiredAnsweredCount === requiredQuestions.length

  const reset = useCallback(() => {
    setAnswers({})
    setUpsellEvents([])
  }, [])

  return {
    questions: visibleQuestions,
    answers,
    setAnswer,
    upsellEvents,
    progress,
    answeredCount,
    totalCount: visibleQuestions.length,
    canSubmit,
    reset,
    contradiction,
    dismissContradiction,
    clearContradiction,
  }
}

// ── Helpers ──────────────────────────────────────────────────────

function isVisible(q: QuestionRow, answers: Record<string, QuestionAnswer>): boolean {
  if (!q.showIf) return true
  const dependency = answers[q.showIf.rowId]
  return dependency?.value === q.showIf.equals
}

function toStringValues(value: string | string[] | File[] | null): string[] {
  const arr = Array.isArray(value) ? value : [value]
  return arr.filter((v): v is string => typeof v === 'string')
}

function isFlaggedForUpsell(
  question: QuestionRow,
  value: string | string[] | File[] | null
): boolean {
  if (!question.options) return false

  const values = toStringValues(value)

  return question.options.some(
    opt => opt.triggersUpsell && values.includes(opt.value)
  )
}

function getImpliedActor(
  question: QuestionRow,
  value: string | string[] | File[] | null
): ActorId | null {
  if (!question.options) return null
  const values = toStringValues(value)

  const matched = question.options.find(
    opt => opt.impliesActor && values.includes(opt.value)
  )
  return matched?.impliesActor ?? null
}

function describeReason(
  question: QuestionRow,
  value: string | string[] | File[] | null
): string {
  const values = toStringValues(value)
  const labels = question.options
    ?.filter(o => values.includes(o.value))
    .map(o => o.label)
    .join(', ')

  return `"${question.field}" answered: ${labels ?? value}`
}
