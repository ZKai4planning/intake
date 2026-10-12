// 'use client'

// import { useState, useMemo, useCallback } from 'react'
// import { INTENT_QUESTIONS } from '@/lib/intent/intentQuestions'
// import { resolveActor, getNextQuestionId } from '@/lib/intent/resolveActor'
// import type { IntentAnswer, IntentQuestionId } from '@/types/intent'

// /**
//  * useIntentFlow
//  * ───────────────
//  * Drives the 2–3 question "what are you trying to do / what's your
//  * relationship to the property" sequence that runs before the tiered
//  * IntakeForm. Tracks a visited-question stack (so Back works properly
//  * even though the 3rd question is conditional), scores answers via
//  * resolveActor on every change, and reports isComplete once
//  * getNextQuestionId returns null.
//  */
// export function useIntentFlow() {
//   const [answers, setAnswers] = useState<IntentAnswer[]>([])
//   const [history, setHistory] = useState<IntentQuestionId[]>(['goal'])
//   const [isComplete, setIsComplete] = useState(false)

//   const currentId = history[history.length - 1]
//   const currentQuestion = useMemo(
//     () => INTENT_QUESTIONS.find(q => q.id === currentId) ?? null,
//     [currentId]
//   )

//   const resolution = useMemo(() => resolveActor(answers), [answers])

//   const selectedValue = useMemo(
//     () => answers.find(a => a.questionId === currentId)?.optionValue ?? null,
//     [answers, currentId]
//   )

//   const answer = useCallback((optionValue: string) => {
//     const next = [...answers.filter(a => a.questionId !== currentId), { questionId: currentId, optionValue }]
//     setAnswers(next)

//     const nextQuestionId = getNextQuestionId(next)
//     if (nextQuestionId) {
//       setHistory(h => [...h, nextQuestionId])
//       setIsComplete(false)
//     } else {
//       setIsComplete(true)
//     }
//   }, [answers, currentId])

//   const goBack = useCallback(() => {
//     if (history.length <= 1) return
//     setIsComplete(false)
//     setAnswers(a => a.filter(x => x.questionId !== currentId))
//     setHistory(h => h.slice(0, -1))
//   }, [history, currentId])

//   const reset = useCallback(() => {
//     setAnswers([])
//     setHistory(['goal'])
//     setIsComplete(false)
//   }, [])

//   return {
//     currentQuestion,
//     selectedValue,
//     answer,
//     goBack,
//     reset,
//     answers,
//     resolution,
//     isComplete,
//     stepIndex: history.length,
//     totalStepsEstimate: history.includes('role') ? 3 : 2,
//     canGoBack: history.length > 1,
//   }
// }

'use client'

import { useState, useMemo, useCallback } from 'react'
import { INTENT_QUESTIONS } from '@/lib/intent/intentQuestions'
import { resolveActor, getNextQuestionId } from '@/lib/intent/resolveActor'
import type { IntentAnswer, IntentQuestionId } from '@/types/intent'

/**
 * useIntentFlow
 * ───────────────
 * Drives the 2–4 question "what are you trying to do / what's your
 * relationship to the property" sequence that runs before the tiered
 * IntakeForm. Tracks a visited-question stack (so Back works properly
 * even though the 3rd and 4th questions are conditional), scores answers
 * via resolveActor on every change, and reports isComplete once
 * getNextQuestionId returns null.
 */
export function useIntentFlow() {
  const [answers, setAnswers] = useState<IntentAnswer[]>([])
  const [history, setHistory] = useState<IntentQuestionId[]>(['goal'])
  const [isComplete, setIsComplete] = useState(false)

  const currentId = history[history.length - 1]
  const currentQuestion = useMemo(
    () => INTENT_QUESTIONS.find(q => q.id === currentId) ?? null,
    [currentId]
  )

  const resolution = useMemo(() => resolveActor(answers), [answers])

  const selectedValue = useMemo(
    () => answers.find(a => a.questionId === currentId)?.optionValue ?? null,
    [answers, currentId]
  )

  const answer = useCallback((optionValue: string) => {
    const next = [...answers.filter(a => a.questionId !== currentId), { questionId: currentId, optionValue }]
    setAnswers(next)

    const nextQuestionId = getNextQuestionId(next)
    if (nextQuestionId) {
      setHistory(h => [...h, nextQuestionId])
      setIsComplete(false)
    } else {
      setIsComplete(true)
    }
  }, [answers, currentId])

  const goBack = useCallback(() => {
    if (history.length <= 1) return
    setIsComplete(false)
    setAnswers(a => a.filter(x => x.questionId !== currentId))
    setHistory(h => h.slice(0, -1))
  }, [history, currentId])

  const reset = useCallback(() => {
    setAnswers([])
    setHistory(['goal'])
    setIsComplete(false)
  }, [])

  return {
    currentQuestion,
    selectedValue,
    answer,
    goBack,
    reset,
    answers,
    resolution,
    isComplete,
    stepIndex: history.length,
    totalStepsEstimate: 2 + (history.includes('role') ? 1 : 0) + (history.includes('subrole') ? 1 : 0),
    canGoBack: history.length > 1,
  }
}