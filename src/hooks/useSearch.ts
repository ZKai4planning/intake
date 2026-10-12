// 'use client'

// import { useState, useCallback, useRef } from 'react'
// import { SEARCH_KEYWORDS, GOALS } from '@/lib/goals'
// import type { GoalId, SearchSuggestion, SearchState } from '@/types'

// const DEBOUNCE_MS = 300

// /**
//  * useSearch
//  * ──────────
//  * Manages hero search bar state.
//  *
//  * API integration point:
//  *   Replace the `classifyLocally()` call inside the debounced handler
//  *   with a fetch to POST /api/search/classify  { query: string }
//  *   which returns { goalId, confidence, label }.
//  *
//  * The hook returns everything the SearchBar component needs —
//  * no business logic lives in the component itself.
//  */
// export function useSearch() {
//   const [state, setState] = useState<SearchState>({
//     query:      '',
//     suggestion: null,
//     isLoading:  false,
//   })

//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

//   // ── Local keyword classifier ──────────────────────────────────
//   // Swap this out for an API call when the backend is ready.
//   const classifyLocally = useCallback(
//     (query: string): SearchSuggestion | null => {
//       const lower = query.toLowerCase().trim()
//       if (lower.length < 3) return null

//       const keywords = Object.keys(SEARCH_KEYWORDS)
//       for (const kw of keywords) {
//         if (lower.includes(kw)) {
//           const goalId = SEARCH_KEYWORDS[kw]
//           const goal   = GOALS.find(g => g.id === goalId)
//           if (!goal) continue
//           return {
//             goalId,
//             label:      goal.title,
//             confidence: 0.85,
//           }
//         }
//       }
//       return null
//     },
//     []
//   )

//   // ── Handler: called on every keystroke ────────────────────────
//   const handleChange = useCallback(
//     (query: string) => {
//       setState(prev => ({ ...prev, query }))

//       if (debounceRef.current) clearTimeout(debounceRef.current)

//       if (!query.trim()) {
//         setState(prev => ({ ...prev, suggestion: null, isLoading: false }))
//         return
//       }

//       setState(prev => ({ ...prev, isLoading: true }))

//       debounceRef.current = setTimeout(() => {
//         // ── API swap point ───────────────────────────────────────
//         // const res  = await fetch('/api/search/classify', { method: 'POST', body: JSON.stringify({ query }) })
//         // const data = await res.json()
//         // const suggestion = data.goalId ? { goalId: data.goalId, label: data.label, confidence: data.confidence } : null
//         // ────────────────────────────────────────────────────────
//         const suggestion = classifyLocally(query)
//         setState(prev => ({ ...prev, suggestion, isLoading: false }))
//       }, DEBOUNCE_MS)
//     },
//     [classifyLocally]
//   )

//   // ── Handler: user submits (Enter / button click) ──────────────
//   const handleSubmit = useCallback(
//     (redirectFn: (goalId: GoalId | 'unsure') => void) => {
//       const goalId = state.suggestion?.goalId ?? 'unsure'
//       redirectFn(goalId)
//     },
//     [state.suggestion]
//   )

//   const clear = useCallback(() => {
//     setState({ query: '', suggestion: null, isLoading: false })
//   }, [])

//   return {
//     query:      state.query,
//     suggestion: state.suggestion,
//     isLoading:  state.isLoading,
//     handleChange,
//     handleSubmit,
//     clear,
//   }
// }

// 'use client'

// import { useState, useCallback, useRef } from 'react'
// import { SEARCH_KEYWORDS, GOALS } from '@/lib/goals'
// import { ACTORS, detectActor, getActor } from '@/lib/actors'
// import { autocorrectOnSpace } from '@/lib/autocorrect'
// import type { GoalId, ActorId, SearchSuggestion, SearchState } from '@/types'

// const DEBOUNCE_MS = 300
// const MIN_QUERY_LENGTH = 3

// // Common domain words that won't appear as SEARCH_KEYWORDS or actor
// // keywords by themselves, but are typo'd often enough to be worth
// // correcting explicitly (e.g. "buld" -> "build").
// const EXTRA_VOCAB = [
//   'build', 'building', 'extend', 'extension', 'convert', 'conversion',
//   'renovate', 'renovation', 'demolish', 'demolition', 'planning',
//   'permission', 'application', 'garage', 'basement', 'kitchen',
//   'bedroom', 'rear', 'side', 'storey', 'story', 'roof', 'dormer',
// ]

// const AUTOCORRECT_VOCAB = Array.from(
//   new Set([
//     ...Object.keys(SEARCH_KEYWORDS).flatMap(phrase => phrase.toLowerCase().split(' ')),
//     ...ACTORS.flatMap(actor => actor.keywords.flatMap(kw => kw.toLowerCase().split(' '))),
//     ...EXTRA_VOCAB,
//   ].filter(w => w.length >= 3))
// )

// export function useSearch() {
//   const [state, setState] = useState<SearchState>({
//     query:           '',
//     suggestion:      null,
//     actorSuggestion: null,
//     selectedActor:   null,
//     isLoading:       false,
//   })

//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

//   const classifyGoalLocally = useCallback(
//     (query: string): SearchSuggestion | null => {
//       const lower = query.toLowerCase().trim()
//       if (lower.length < 3) return null

//       const keywords = Object.keys(SEARCH_KEYWORDS)
//       for (const kw of keywords) {
//         if (lower.includes(kw)) {
//           const goalId = SEARCH_KEYWORDS[kw]
//           const goal   = GOALS.find(g => g.id === goalId)
//           if (!goal) continue
//           return { goalId, label: goal.title, confidence: 0.85 }
//         }
//       }
//       return null
//     },
//     []
//   )

//   const handleChange = useCallback(
//     (rawQuery: string) => {
//       const query = autocorrectOnSpace(rawQuery, AUTOCORRECT_VOCAB)

//       setState(prev => ({ ...prev, query }))

//       if (debounceRef.current) clearTimeout(debounceRef.current)

//       if (!query.trim()) {
//         setState(prev => ({
//           ...prev,
//           suggestion:      null,
//           actorSuggestion: null,
//           isLoading:       false,
//         }))
//         return
//       }

//       setState(prev => ({ ...prev, isLoading: true }))

//       debounceRef.current = setTimeout(() => {
//         const goalSuggestion  = classifyGoalLocally(query)
//         const actorSuggestion = detectActor(query)

//         setState(prev => ({
//           ...prev,
//           suggestion:      goalSuggestion,
//           actorSuggestion,
//           isLoading:       false,
//         }))
//       }, DEBOUNCE_MS)
//     },
//     [classifyGoalLocally]
//   )

//   const selectActor = useCallback((actorId: ActorId | null) => {
//     setState(prev => ({ ...prev, selectedActor: actorId }))
//   }, [])

//   const acceptActorSuggestion = useCallback(() => {
//     setState(prev => ({
//       ...prev,
//       selectedActor: prev.actorSuggestion?.actorId ?? prev.selectedActor,
//     }))
//   }, [])

//   const handleSubmit = useCallback(
//     (redirectFn: (goalId: GoalId | 'unsure', actorId: ActorId | null) => void) => {
//       const trimmed = state.query.trim()
//       if (trimmed.length < MIN_QUERY_LENGTH) {
//         return
//       }

//       const goalId  = state.suggestion?.goalId ?? 'unsure'
//       const actorId = state.selectedActor ?? state.actorSuggestion?.actorId ?? null
//       redirectFn(goalId, actorId)
//     },
//     [state.query, state.suggestion, state.selectedActor, state.actorSuggestion]
//   )

//   const clear = useCallback(() => {
//     setState({
//       query: '', suggestion: null, actorSuggestion: null,
//       selectedActor: null, isLoading: false,
//     })
//   }, [])

//   return {
//     query:            state.query,
//     suggestion:       state.suggestion,
//     actorSuggestion:  state.actorSuggestion,
//     selectedActor:    state.selectedActor,
//     selectedActorMeta: state.selectedActor ? getActor(state.selectedActor) : null,
//     isLoading:        state.isLoading,
//     handleChange,
//     handleSubmit,
//     selectActor,
//     acceptActorSuggestion,
//     clear,
//   }
// }

// 'use client'

// import { useState, useCallback, useRef, useEffect } from 'react'
// import { SEARCH_KEYWORDS, GOALS } from '@/lib/goals'
// import { ACTORS, detectActor, getActor } from '@/lib/actors'
// import { inferActorFromGoal } from '@/lib/goalActorMap'
// import { autocorrectOnSpace, GENERAL_WORDS } from '@/lib/autocorrect'
// import type { GoalId, ActorId, SearchSuggestion, ActorSuggestion, SearchState } from '@/types'

// const DEBOUNCE_MS = 300
// const MIN_QUERY_LENGTH = 3

// // How many extra characters the user must type after declining a
// // suggestion before the SAME actor is allowed to be suggested again.
// // Stops "Not quite" -> same chip reappearing a keystroke later.
// const DECLINE_SUPPRESS_CHARS = 5

// const EXTRA_VOCAB = [
//   'build', 'building', 'extend', 'extension', 'convert', 'conversion',
//   'renovate', 'renovation', 'demolish', 'demolition', 'planning',
//   'permission', 'application', 'garage', 'basement', 'kitchen',
//   'bedroom', 'rear', 'side', 'storey', 'story', 'roof', 'dormer',
// ]

// const AUTOCORRECT_VOCAB = Array.from(
//   new Set([
//     ...Object.keys(SEARCH_KEYWORDS).flatMap(phrase => phrase.toLowerCase().split(' ')),
//     ...ACTORS.flatMap(actor => actor.keywords.flatMap(kw => kw.toLowerCase().split(' '))),
//     ...EXTRA_VOCAB,
//     ...GENERAL_WORDS,
//   ].filter(w => w.length >= 2))
// )

// export function useSearch() {
//   const [state, setState] = useState<SearchState>({
//     query:           '',
//     suggestion:      null,
//     actorSuggestion: null,
//     selectedActor:   null,
//     isLoading:       false,
//   })

//   // Actor suggestion awaiting popup confirmation. Stores the full
//   // suggestion (not just the id) so the modal can show *why* it's
//   // suggesting this actor (explicit text match vs fuzzy-corrected vs
//   // inferred from goal) rather than one generic message for all cases.
//   const [pendingActorConfirm, setPendingActorConfirm] = useState<ActorSuggestion | null>(null)

//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

//   // Scaffolding for the eventual real API call (see classifyGoalLocally
//   // doc comment below). Not used by the local classifier since it's
//   // synchronous, but kept here so the abort pattern is already in
//   // place when classifyLocally/detectActor are swapped for fetch calls.
//   const abortRef = useRef<AbortController | null>(null)

//   // Remembers the last actor suggestion the user explicitly dismissed
//   // ("Not quite"), and the query length at the time, so the same
//   // suggestion isn't immediately re-shown on the next keystroke.
//   const declinedRef = useRef<{ actorId: ActorId; queryLength: number } | null>(null)

//   // ── Cleanup on unmount: cancel any in-flight debounce/abort ─────
//   useEffect(() => {
//     return () => {
//       if (debounceRef.current) clearTimeout(debounceRef.current)
//       abortRef.current?.abort()
//     }
//   }, [])

//   /**
//    * classifyGoalLocally
//    * API integration point: replace this (and detectActor) with:
//    *   POST /api/search/classify { query }
//    *   → { goalId, confidence, label, actorId, actorConfidence, actorLabel }
//    * When swapping to a real fetch, use `abortRef` (see handleChange)
//    * to cancel a stale in-flight request when a newer one starts.
//    */
//   const classifyGoalLocally = useCallback(
//     (query: string): SearchSuggestion | null => {
//       const lower = query.toLowerCase().trim()
//       if (lower.length < 3) return null

//       const keywords = Object.keys(SEARCH_KEYWORDS)
//       for (const kw of keywords) {
//         if (lower.includes(kw)) {
//           const goalId = SEARCH_KEYWORDS[kw]
//           const goal   = GOALS.find(g => g.id === goalId)
//           if (!goal) continue
//           return { goalId, label: goal.title, confidence: 0.85 }
//         }
//       }
//       return null
//     },
//     []
//   )

//   const handleChange = useCallback(
//     (rawQuery: string) => {
//       const query = autocorrectOnSpace(rawQuery, AUTOCORRECT_VOCAB)

//       setState(prev => ({ ...prev, query }))

//       if (debounceRef.current) clearTimeout(debounceRef.current)
//       abortRef.current?.abort()

//       if (!query.trim()) {
//         setState(prev => ({
//           ...prev,
//           suggestion:      null,
//           actorSuggestion: null,
//           isLoading:       false,
//         }))
//         return
//       }

//       setState(prev => ({ ...prev, isLoading: true }))

//       // Scaffolding: a real fetch-based classifier would create its
//       // controller here and pass controller.signal into the request.
//       const controller = new AbortController()
//       abortRef.current = controller

//       debounceRef.current = setTimeout(() => {
//         if (controller.signal.aborted) return

//         const goalSuggestion = classifyGoalLocally(query)

//         // Explicit text detection takes priority (e.g. user literally
//         // typed "landlord"). Only fall back to the goal->actor table
//         // when nothing was explicitly detected.
//         const explicitActor = detectActor(query)
//         let actorSuggestion: ActorSuggestion | null = explicitActor

//         if (!explicitActor) {
//           const inferredActorId = inferActorFromGoal(query)
//           if (inferredActorId) {
//             const actor = getActor(inferredActorId)
//             if (actor) {
//               actorSuggestion = {
//                 actorId: inferredActorId,
//                 label: actor.label,
//                 confidence: 0.6,
//                 wasCorrected: false,
//               }
//             }
//           }
//         }

//         // Suppress a suggestion the user just declined, until they've
//         // typed enough new characters that it's worth re-asking.
//         if (
//           actorSuggestion &&
//           declinedRef.current &&
//           declinedRef.current.actorId === actorSuggestion.actorId &&
//           query.length - declinedRef.current.queryLength < DECLINE_SUPPRESS_CHARS
//         ) {
//           actorSuggestion = null
//         }

//         setState(prev => ({
//           ...prev,
//           suggestion:      goalSuggestion,
//           actorSuggestion,
//           isLoading:       false,
//         }))
//       }, DEBOUNCE_MS)
//     },
//     [classifyGoalLocally]
//   )

//   const selectActor = useCallback((actorId: ActorId | null) => {
//     setState(prev => ({ ...prev, selectedActor: actorId }))
//     declinedRef.current = null // manual pill selection clears any decline memory
//   }, [])

//   // Clicking the detected-actor chip opens a confirmation popup
//   // instead of applying it immediately. Reads state.actorSuggestion
//   // directly (declared as a dependency) rather than reaching into a
//   // no-op setState — avoids a stale-closure workaround.
//   const acceptActorSuggestion = useCallback(() => {
//     if (state.actorSuggestion) setPendingActorConfirm(state.actorSuggestion)
//   }, [state.actorSuggestion])

//   const confirmPendingActor = useCallback(() => {
//     if (pendingActorConfirm) {
//       setState(prev => ({ ...prev, selectedActor: pendingActorConfirm.actorId }))
//       declinedRef.current = null
//     }
//     setPendingActorConfirm(null)
//   }, [pendingActorConfirm])

//   const cancelPendingActor = useCallback(() => {
//     if (pendingActorConfirm) {
//       declinedRef.current = {
//         actorId: pendingActorConfirm.actorId,
//         queryLength: state.query.length,
//       }
//     }
//     setPendingActorConfirm(null)
//   }, [pendingActorConfirm, state.query.length])

//   const handleSubmit = useCallback(
//     (redirectFn: (goalId: GoalId | 'unsure', actorId: ActorId | null) => void) => {
//       const trimmed = state.query.trim()
//       if (trimmed.length < MIN_QUERY_LENGTH) {
//         return
//       }

//       const goalId  = state.suggestion?.goalId ?? 'unsure'
//       const actorId = state.selectedActor ?? state.actorSuggestion?.actorId ?? null
//       redirectFn(goalId, actorId)
//     },
//     [state.query, state.suggestion, state.selectedActor, state.actorSuggestion]
//   )

//   const clear = useCallback(() => {
//     setState({
//       query: '', suggestion: null, actorSuggestion: null,
//       selectedActor: null, isLoading: false,
//     })
//     declinedRef.current = null
//     setPendingActorConfirm(null)
//   }, [])

//   return {
//     query:            state.query,
//     suggestion:       state.suggestion,
//     actorSuggestion:  state.actorSuggestion,
//     selectedActor:    state.selectedActor,
//     selectedActorMeta: state.selectedActor ? getActor(state.selectedActor) : null,
//     isLoading:        state.isLoading,
//     handleChange,
//     handleSubmit,
//     selectActor,
//     acceptActorSuggestion,
//     // Popup confirmation flow
//     pendingActorConfirm,
//     pendingActorConfirmMeta: pendingActorConfirm ? getActor(pendingActorConfirm.actorId) : null,
//     confirmPendingActor,
//     cancelPendingActor,
//     clear,
//   }
// }


// 'use client'

// import { useState, useCallback, useRef } from 'react'
// import { SEARCH_KEYWORDS, GOALS } from '@/lib/goals'
// import type { GoalId, SearchSuggestion, SearchState } from '@/types'

// const DEBOUNCE_MS = 300

// /**
//  * useSearch
//  * ──────────
//  * Manages hero search bar state.
//  *
//  * API integration point:
//  *   Replace the `classifyLocally()` call inside the debounced handler
//  *   with a fetch to POST /api/search/classify  { query: string }
//  *   which returns { goalId, confidence, label }.
//  *
//  * The hook returns everything the SearchBar component needs —
//  * no business logic lives in the component itself.
//  */
// export function useSearch() {
//   const [state, setState] = useState<SearchState>({
//     query:      '',
//     suggestion: null,
//     isLoading:  false,
//   })

//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

//   // ── Local keyword classifier ──────────────────────────────────
//   // Swap this out for an API call when the backend is ready.
//   const classifyLocally = useCallback(
//     (query: string): SearchSuggestion | null => {
//       const lower = query.toLowerCase().trim()
//       if (lower.length < 3) return null

//       const keywords = Object.keys(SEARCH_KEYWORDS)
//       for (const kw of keywords) {
//         if (lower.includes(kw)) {
//           const goalId = SEARCH_KEYWORDS[kw]
//           const goal   = GOALS.find(g => g.id === goalId)
//           if (!goal) continue
//           return {
//             goalId,
//             label:      goal.title,
//             confidence: 0.85,
//           }
//         }
//       }
//       return null
//     },
//     []
//   )

//   // ── Handler: called on every keystroke ────────────────────────
//   const handleChange = useCallback(
//     (query: string) => {
//       setState(prev => ({ ...prev, query }))

//       if (debounceRef.current) clearTimeout(debounceRef.current)

//       if (!query.trim()) {
//         setState(prev => ({ ...prev, suggestion: null, isLoading: false }))
//         return
//       }

//       setState(prev => ({ ...prev, isLoading: true }))

//       debounceRef.current = setTimeout(() => {
//         // ── API swap point ───────────────────────────────────────
//         // const res  = await fetch('/api/search/classify', { method: 'POST', body: JSON.stringify({ query }) })
//         // const data = await res.json()
//         // const suggestion = data.goalId ? { goalId: data.goalId, label: data.label, confidence: data.confidence } : null
//         // ────────────────────────────────────────────────────────
//         const suggestion = classifyLocally(query)
//         setState(prev => ({ ...prev, suggestion, isLoading: false }))
//       }, DEBOUNCE_MS)
//     },
//     [classifyLocally]
//   )

//   // ── Handler: user submits (Enter / button click) ──────────────
//   const handleSubmit = useCallback(
//     (redirectFn: (goalId: GoalId | 'unsure') => void) => {
//       const goalId = state.suggestion?.goalId ?? 'unsure'
//       redirectFn(goalId)
//     },
//     [state.suggestion]
//   )

//   const clear = useCallback(() => {
//     setState({ query: '', suggestion: null, isLoading: false })
//   }, [])

//   return {
//     query:      state.query,
//     suggestion: state.suggestion,
//     isLoading:  state.isLoading,
//     handleChange,
//     handleSubmit,
//     clear,
//   }
// }

// 'use client'

// import { useState, useCallback, useRef } from 'react'
// import { SEARCH_KEYWORDS, GOALS } from '@/lib/goals'
// import { ACTORS, detectActor, getActor } from '@/lib/actors'
// import { autocorrectOnSpace } from '@/lib/autocorrect'
// import type { GoalId, ActorId, SearchSuggestion, SearchState } from '@/types'

// const DEBOUNCE_MS = 300
// const MIN_QUERY_LENGTH = 3

// // Common domain words that won't appear as SEARCH_KEYWORDS or actor
// // keywords by themselves, but are typo'd often enough to be worth
// // correcting explicitly (e.g. "buld" -> "build").
// const EXTRA_VOCAB = [
//   'build', 'building', 'extend', 'extension', 'convert', 'conversion',
//   'renovate', 'renovation', 'demolish', 'demolition', 'planning',
//   'permission', 'application', 'garage', 'basement', 'kitchen',
//   'bedroom', 'rear', 'side', 'storey', 'story', 'roof', 'dormer',
// ]

// const AUTOCORRECT_VOCAB = Array.from(
//   new Set([
//     ...Object.keys(SEARCH_KEYWORDS).flatMap(phrase => phrase.toLowerCase().split(' ')),
//     ...ACTORS.flatMap(actor => actor.keywords.flatMap(kw => kw.toLowerCase().split(' '))),
//     ...EXTRA_VOCAB,
//   ].filter(w => w.length >= 3))
// )

// export function useSearch() {
//   const [state, setState] = useState<SearchState>({
//     query:           '',
//     suggestion:      null,
//     actorSuggestion: null,
//     selectedActor:   null,
//     isLoading:       false,
//   })

//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

//   const classifyGoalLocally = useCallback(
//     (query: string): SearchSuggestion | null => {
//       const lower = query.toLowerCase().trim()
//       if (lower.length < 3) return null

//       const keywords = Object.keys(SEARCH_KEYWORDS)
//       for (const kw of keywords) {
//         if (lower.includes(kw)) {
//           const goalId = SEARCH_KEYWORDS[kw]
//           const goal   = GOALS.find(g => g.id === goalId)
//           if (!goal) continue
//           return { goalId, label: goal.title, confidence: 0.85 }
//         }
//       }
//       return null
//     },
//     []
//   )

//   const handleChange = useCallback(
//     (rawQuery: string) => {
//       const query = autocorrectOnSpace(rawQuery, AUTOCORRECT_VOCAB)

//       setState(prev => ({ ...prev, query }))

//       if (debounceRef.current) clearTimeout(debounceRef.current)

//       if (!query.trim()) {
//         setState(prev => ({
//           ...prev,
//           suggestion:      null,
//           actorSuggestion: null,
//           isLoading:       false,
//         }))
//         return
//       }

//       setState(prev => ({ ...prev, isLoading: true }))

//       debounceRef.current = setTimeout(() => {
//         const goalSuggestion  = classifyGoalLocally(query)
//         const actorSuggestion = detectActor(query)

//         setState(prev => ({
//           ...prev,
//           suggestion:      goalSuggestion,
//           actorSuggestion,
//           isLoading:       false,
//         }))
//       }, DEBOUNCE_MS)
//     },
//     [classifyGoalLocally]
//   )

//   const selectActor = useCallback((actorId: ActorId | null) => {
//     setState(prev => ({ ...prev, selectedActor: actorId }))
//   }, [])

//   const acceptActorSuggestion = useCallback(() => {
//     setState(prev => ({
//       ...prev,
//       selectedActor: prev.actorSuggestion?.actorId ?? prev.selectedActor,
//     }))
//   }, [])

//   const handleSubmit = useCallback(
//     (redirectFn: (goalId: GoalId | 'unsure', actorId: ActorId | null) => void) => {
//       const trimmed = state.query.trim()
//       if (trimmed.length < MIN_QUERY_LENGTH) {
//         return
//       }

//       const goalId  = state.suggestion?.goalId ?? 'unsure'
//       const actorId = state.selectedActor ?? state.actorSuggestion?.actorId ?? null
//       redirectFn(goalId, actorId)
//     },
//     [state.query, state.suggestion, state.selectedActor, state.actorSuggestion]
//   )

//   const clear = useCallback(() => {
//     setState({
//       query: '', suggestion: null, actorSuggestion: null,
//       selectedActor: null, isLoading: false,
//     })
//   }, [])

//   return {
//     query:            state.query,
//     suggestion:       state.suggestion,
//     actorSuggestion:  state.actorSuggestion,
//     selectedActor:    state.selectedActor,
//     selectedActorMeta: state.selectedActor ? getActor(state.selectedActor) : null,
//     isLoading:        state.isLoading,
//     handleChange,
//     handleSubmit,
//     selectActor,
//     acceptActorSuggestion,
//     clear,
//   }
// }

// 'use client'

// import { useState, useCallback, useRef } from 'react'
// import { SEARCH_KEYWORDS, GOALS } from '@/lib/goals'
// import type { GoalId, SearchSuggestion, SearchState } from '@/types'

// const DEBOUNCE_MS = 300

// /**
//  * useSearch
//  * ──────────
//  * Manages hero search bar state.
//  *
//  * API integration point:
//  *   Replace the `classifyLocally()` call inside the debounced handler
//  *   with a fetch to POST /api/search/classify  { query: string }
//  *   which returns { goalId, confidence, label }.
//  *
//  * The hook returns everything the SearchBar component needs —
//  * no business logic lives in the component itself.
//  */
// export function useSearch() {
//   const [state, setState] = useState<SearchState>({
//     query:      '',
//     suggestion: null,
//     isLoading:  false,
//   })

//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

//   // ── Local keyword classifier ──────────────────────────────────
//   // Swap this out for an API call when the backend is ready.
//   const classifyLocally = useCallback(
//     (query: string): SearchSuggestion | null => {
//       const lower = query.toLowerCase().trim()
//       if (lower.length < 3) return null

//       const keywords = Object.keys(SEARCH_KEYWORDS)
//       for (const kw of keywords) {
//         if (lower.includes(kw)) {
//           const goalId = SEARCH_KEYWORDS[kw]
//           const goal   = GOALS.find(g => g.id === goalId)
//           if (!goal) continue
//           return {
//             goalId,
//             label:      goal.title,
//             confidence: 0.85,
//           }
//         }
//       }
//       return null
//     },
//     []
//   )

//   // ── Handler: called on every keystroke ────────────────────────
//   const handleChange = useCallback(
//     (query: string) => {
//       setState(prev => ({ ...prev, query }))

//       if (debounceRef.current) clearTimeout(debounceRef.current)

//       if (!query.trim()) {
//         setState(prev => ({ ...prev, suggestion: null, isLoading: false }))
//         return
//       }

//       setState(prev => ({ ...prev, isLoading: true }))

//       debounceRef.current = setTimeout(() => {
//         // ── API swap point ───────────────────────────────────────
//         // const res  = await fetch('/api/search/classify', { method: 'POST', body: JSON.stringify({ query }) })
//         // const data = await res.json()
//         // const suggestion = data.goalId ? { goalId: data.goalId, label: data.label, confidence: data.confidence } : null
//         // ────────────────────────────────────────────────────────
//         const suggestion = classifyLocally(query)
//         setState(prev => ({ ...prev, suggestion, isLoading: false }))
//       }, DEBOUNCE_MS)
//     },
//     [classifyLocally]
//   )

//   // ── Handler: user submits (Enter / button click) ──────────────
//   const handleSubmit = useCallback(
//     (redirectFn: (goalId: GoalId | 'unsure') => void) => {
//       const goalId = state.suggestion?.goalId ?? 'unsure'
//       redirectFn(goalId)
//     },
//     [state.suggestion]
//   )

//   const clear = useCallback(() => {
//     setState({ query: '', suggestion: null, isLoading: false })
//   }, [])

//   return {
//     query:      state.query,
//     suggestion: state.suggestion,
//     isLoading:  state.isLoading,
//     handleChange,
//     handleSubmit,
//     clear,
//   }
// }

// 'use client'

// import { useState, useCallback, useRef } from 'react'
// import { SEARCH_KEYWORDS, GOALS } from '@/lib/goals'
// import { ACTORS, detectActor, getActor } from '@/lib/actors'
// import { autocorrectOnSpace } from '@/lib/autocorrect'
// import type { GoalId, ActorId, SearchSuggestion, SearchState } from '@/types'

// const DEBOUNCE_MS = 300
// const MIN_QUERY_LENGTH = 3

// // Common domain words that won't appear as SEARCH_KEYWORDS or actor
// // keywords by themselves, but are typo'd often enough to be worth
// // correcting explicitly (e.g. "buld" -> "build").
// const EXTRA_VOCAB = [
//   'build', 'building', 'extend', 'extension', 'convert', 'conversion',
//   'renovate', 'renovation', 'demolish', 'demolition', 'planning',
//   'permission', 'application', 'garage', 'basement', 'kitchen',
//   'bedroom', 'rear', 'side', 'storey', 'story', 'roof', 'dormer',
// ]

// const AUTOCORRECT_VOCAB = Array.from(
//   new Set([
//     ...Object.keys(SEARCH_KEYWORDS).flatMap(phrase => phrase.toLowerCase().split(' ')),
//     ...ACTORS.flatMap(actor => actor.keywords.flatMap(kw => kw.toLowerCase().split(' '))),
//     ...EXTRA_VOCAB,
//   ].filter(w => w.length >= 3))
// )

// export function useSearch() {
//   const [state, setState] = useState<SearchState>({
//     query:           '',
//     suggestion:      null,
//     actorSuggestion: null,
//     selectedActor:   null,
//     isLoading:       false,
//   })

//   const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

//   const classifyGoalLocally = useCallback(
//     (query: string): SearchSuggestion | null => {
//       const lower = query.toLowerCase().trim()
//       if (lower.length < 3) return null

//       const keywords = Object.keys(SEARCH_KEYWORDS)
//       for (const kw of keywords) {
//         if (lower.includes(kw)) {
//           const goalId = SEARCH_KEYWORDS[kw]
//           const goal   = GOALS.find(g => g.id === goalId)
//           if (!goal) continue
//           return { goalId, label: goal.title, confidence: 0.85 }
//         }
//       }
//       return null
//     },
//     []
//   )

//   const handleChange = useCallback(
//     (rawQuery: string) => {
//       const query = autocorrectOnSpace(rawQuery, AUTOCORRECT_VOCAB)

//       setState(prev => ({ ...prev, query }))

//       if (debounceRef.current) clearTimeout(debounceRef.current)

//       if (!query.trim()) {
//         setState(prev => ({
//           ...prev,
//           suggestion:      null,
//           actorSuggestion: null,
//           isLoading:       false,
//         }))
//         return
//       }

//       setState(prev => ({ ...prev, isLoading: true }))

//       debounceRef.current = setTimeout(() => {
//         const goalSuggestion  = classifyGoalLocally(query)
//         const actorSuggestion = detectActor(query)

//         setState(prev => ({
//           ...prev,
//           suggestion:      goalSuggestion,
//           actorSuggestion,
//           isLoading:       false,
//         }))
//       }, DEBOUNCE_MS)
//     },
//     [classifyGoalLocally]
//   )

//   const selectActor = useCallback((actorId: ActorId | null) => {
//     setState(prev => ({ ...prev, selectedActor: actorId }))
//   }, [])

//   const acceptActorSuggestion = useCallback(() => {
//     setState(prev => ({
//       ...prev,
//       selectedActor: prev.actorSuggestion?.actorId ?? prev.selectedActor,
//     }))
//   }, [])

//   const handleSubmit = useCallback(
//     (redirectFn: (goalId: GoalId | 'unsure', actorId: ActorId | null) => void) => {
//       const trimmed = state.query.trim()
//       if (trimmed.length < MIN_QUERY_LENGTH) {
//         return
//       }

//       const goalId  = state.suggestion?.goalId ?? 'unsure'
//       const actorId = state.selectedActor ?? state.actorSuggestion?.actorId ?? null
//       redirectFn(goalId, actorId)
//     },
//     [state.query, state.suggestion, state.selectedActor, state.actorSuggestion]
//   )

//   const clear = useCallback(() => {
//     setState({
//       query: '', suggestion: null, actorSuggestion: null,
//       selectedActor: null, isLoading: false,
//     })
//   }, [])

//   return {
//     query:            state.query,
//     suggestion:       state.suggestion,
//     actorSuggestion:  state.actorSuggestion,
//     selectedActor:    state.selectedActor,
//     selectedActorMeta: state.selectedActor ? getActor(state.selectedActor) : null,
//     isLoading:        state.isLoading,
//     handleChange,
//     handleSubmit,
//     selectActor,
//     acceptActorSuggestion,
//     clear,
//   }
// }

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { SEARCH_KEYWORDS, GOALS } from '@/lib/goals'
import { ACTORS, detectActor, getActor } from '@/lib/actors'
import { inferActorFromGoalId } from '@/lib/goalActorMap'
import { autocorrectOnSpace, GENERAL_WORDS } from '@/lib/autocorrect'
import type { GoalId, ActorId, SearchSuggestion, ActorSuggestion, SearchState } from '@/types'

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 3

// How many extra characters the user must type after declining a
// suggestion before the SAME actor is allowed to be suggested again.
// Stops "Not quite" -> same chip reappearing a keystroke later.
const DECLINE_SUPPRESS_CHARS = 5

const EXTRA_VOCAB = [
  'build', 'building', 'extend', 'extension', 'convert', 'conversion',
  'renovate', 'renovation', 'demolish', 'demolition', 'planning',
  'permission', 'application', 'garage', 'basement', 'kitchen',
  'bedroom', 'rear', 'side', 'storey', 'story', 'roof', 'dormer',
]

const AUTOCORRECT_VOCAB = Array.from(
  new Set([
    ...Object.keys(SEARCH_KEYWORDS).flatMap(phrase => phrase.toLowerCase().split(' ')),
    ...ACTORS.flatMap(actor => actor.keywords.flatMap(kw => kw.toLowerCase().split(' '))),
    ...EXTRA_VOCAB,
    ...GENERAL_WORDS,
  ].filter(w => w.length >= 2))
)

export function useSearch() {
  const [state, setState] = useState<SearchState>({
    query:           '',
    suggestion:      null,
    actorSuggestion: null,
    selectedActor:   null,
    isLoading:       false,
  })

  // Actor suggestion awaiting popup confirmation. Stores the full
  // suggestion (not just the id) so the modal can show *why* it's
  // suggesting this actor (explicit text match vs fuzzy-corrected vs
  // inferred from goal) rather than one generic message for all cases.
  const [pendingActorConfirm, setPendingActorConfirm] = useState<ActorSuggestion | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Scaffolding for the eventual real API call (see classifyGoalLocally
  // doc comment below). Not used by the local classifier since it's
  // synchronous, but kept here so the abort pattern is already in
  // place when classifyLocally/detectActor are swapped for fetch calls.
  const abortRef = useRef<AbortController | null>(null)

  // Remembers the last actor suggestion the user explicitly dismissed
  // ("Not quite"), and the query length at the time, so the same
  // suggestion isn't immediately re-shown on the next keystroke.
  const declinedRef = useRef<{ actorId: ActorId; queryLength: number } | null>(null)

  // ── Cleanup on unmount: cancel any in-flight debounce/abort ─────
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      abortRef.current?.abort()
    }
  }, [])

  /**
   * classifyGoalLocally
   * API integration point: replace this (and detectActor) with:
   *   POST /api/search/classify { query }
   *   → { goalId, confidence, label, actorId, actorConfidence, actorLabel }
   * When swapping to a real fetch, use `abortRef` (see handleChange)
   * to cancel a stale in-flight request when a newer one starts.
   */
  const classifyGoalLocally = useCallback(
    (query: string): SearchSuggestion | null => {
      const lower = query.toLowerCase().trim()
      if (lower.length < 3) return null

      const keywords = Object.keys(SEARCH_KEYWORDS)
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          const goalId = SEARCH_KEYWORDS[kw]
          const goal   = GOALS.find(g => g.id === goalId)
          if (!goal) continue
          return { goalId, label: goal.title, confidence: 0.85 }
        }
      }
      return null
    },
    []
  )

  const handleChange = useCallback(
    (rawQuery: string) => {
      const query = autocorrectOnSpace(rawQuery, AUTOCORRECT_VOCAB)

      setState(prev => ({ ...prev, query }))

      if (debounceRef.current) clearTimeout(debounceRef.current)
      abortRef.current?.abort()

      if (!query.trim()) {
        setState(prev => ({
          ...prev,
          suggestion:      null,
          actorSuggestion: null,
          isLoading:       false,
        }))
        return
      }

      setState(prev => ({ ...prev, isLoading: true }))

      // Scaffolding: a real fetch-based classifier would create its
      // controller here and pass controller.signal into the request.
      const controller = new AbortController()
      abortRef.current = controller

      debounceRef.current = setTimeout(() => {
        if (controller.signal.aborted) return

        const goalSuggestion = classifyGoalLocally(query)

        // Explicit text detection takes priority (e.g. user literally
        // typed "landlord"). Only fall back to the goal-derived
        // inference (same Signal_Weights matrix as the intent question
        // flow — see goalActorMap.ts) when nothing was explicitly
        // detected, and only once we actually have a classified goal.
        const explicitActor = detectActor(query)
        let actorSuggestion: ActorSuggestion | null = explicitActor

        if (!explicitActor && goalSuggestion) {
          const inferred = inferActorFromGoalId(goalSuggestion.goalId)
          if (inferred) {
            const actor = getActor(inferred.actorId)
            if (actor) {
              actorSuggestion = {
                actorId: inferred.actorId,
                label: actor.label,
                confidence: inferred.confidence,
                wasCorrected: false,
              }
            }
          }
        }

        // Suppress a suggestion the user just declined, until they've
        // typed enough new characters that it's worth re-asking.
        if (
          actorSuggestion &&
          declinedRef.current &&
          declinedRef.current.actorId === actorSuggestion.actorId &&
          query.length - declinedRef.current.queryLength < DECLINE_SUPPRESS_CHARS
        ) {
          actorSuggestion = null
        }

        setState(prev => ({
          ...prev,
          suggestion:      goalSuggestion,
          actorSuggestion,
          isLoading:       false,
        }))
      }, DEBOUNCE_MS)
    },
    [classifyGoalLocally]
  )

  const selectActor = useCallback((actorId: ActorId | null) => {
    setState(prev => ({ ...prev, selectedActor: actorId }))
    declinedRef.current = null // manual pill selection clears any decline memory
  }, [])

  // Clicking the detected-actor chip opens a confirmation popup
  // instead of applying it immediately. Reads state.actorSuggestion
  // directly (declared as a dependency) rather than reaching into a
  // no-op setState — avoids a stale-closure workaround.
  const acceptActorSuggestion = useCallback(() => {
    if (state.actorSuggestion) setPendingActorConfirm(state.actorSuggestion)
  }, [state.actorSuggestion])

  const confirmPendingActor = useCallback(() => {
    if (pendingActorConfirm) {
      setState(prev => ({ ...prev, selectedActor: pendingActorConfirm.actorId }))
      declinedRef.current = null
    }
    setPendingActorConfirm(null)
  }, [pendingActorConfirm])

  const cancelPendingActor = useCallback(() => {
    if (pendingActorConfirm) {
      declinedRef.current = {
        actorId: pendingActorConfirm.actorId,
        queryLength: state.query.length,
      }
    }
    setPendingActorConfirm(null)
  }, [pendingActorConfirm, state.query.length])

  const handleSubmit = useCallback(
    (redirectFn: (goalId: GoalId | 'unsure', actorId: ActorId | null) => void) => {
      const trimmed = state.query.trim()
      if (trimmed.length < MIN_QUERY_LENGTH) {
        return
      }
      // An actor must be explicitly selected (typed/detected suggestions
      // aren't enough on their own) before we'll route anywhere.
      if (!state.selectedActor) {
        return
      }

      const goalId  = state.suggestion?.goalId ?? 'unsure'
      redirectFn(goalId, state.selectedActor)
    },
    [state.query, state.suggestion, state.selectedActor]
  )

  const clear = useCallback(() => {
    setState({
      query: '', suggestion: null, actorSuggestion: null,
      selectedActor: null, isLoading: false,
    })
    declinedRef.current = null
    setPendingActorConfirm(null)
  }, [])

  return {
    query:            state.query,
    suggestion:       state.suggestion,
    actorSuggestion:  state.actorSuggestion,
    selectedActor:    state.selectedActor,
    selectedActorMeta: state.selectedActor ? getActor(state.selectedActor) : null,
    isLoading:        state.isLoading,
    handleChange,
    handleSubmit,
    selectActor,
    acceptActorSuggestion,
    // Popup confirmation flow
    pendingActorConfirm,
    pendingActorConfirmMeta: pendingActorConfirm ? getActor(pendingActorConfirm.actorId) : null,
    confirmPendingActor,
    cancelPendingActor,
    clear,
  }
}