'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { generateAnswerRemote, type ChatAnswer, type RemoteAnswerResult, type ResolvedPostcode } from '@/lib/chatAnswers'
import { REPORT_TIERS, getTierDef, isPaidTier } from '@/lib/reportTiers'
import { getTailoredQuestions } from '@/lib/questionEngine'
import { generateTieredReport, generateLeadSummary } from '@/lib/reportContent'
import { savePendingReport, getPendingReport } from '@/lib/reportStorage'
import type { ChatQuestion, ReportTierId, TierAnswers } from '@/types/reportTiers'
import type { TieredReportContent, LeadRequestContent } from '@/lib/reportContent'
import type { ActorId, GoalId } from '@/types'

/**
 * What the fake opening "user" bubble says when the person arrived via
 * a hero actor card (no typed query) — this is also what gets tagged
 * onto the LLM's context below, so the very first reply is actor-aware
 * instead of a generic "how can I help?".
 */
const ACTOR_INTRO_TEXT: Record<ActorId, string> = {
  homeowner: "I'm a homeowner working on my own property.",
  landlord: "I'm a landlord renting out property.",
  developer: "I'm a developer, building or developing sites.",
  builder: "I'm a builder carrying out construction work.",
  consultant: "I'm a planning consultant advising a client.",
  architect: "I'm an architect designing for a client.",
  business: "I'm a business or professional looking for planning support.",
}

export type FlowMessage =
  | { id: string; kind: 'user-text'; text: string }
  | { id: string; kind: 'assistant-text'; text: string }
  | {
      id: string
      kind: 'assistant-answer'
      answer: ChatAnswer
      /**
       * Set only when this turn also called check_planning_constraints —
       * a short "Live check — planning.data.gov.uk" style label the UI
       * renders under the bubble, so a grounded answer visibly reads
       * differently from a general one. Never set from anything the
       * model merely claims; only from resolvedConstraints actually
       * being present on the API response.
       */
      sourceTag?: string
    }
  | {
      id: string
      kind: 'assistant-question'
      question: ChatQuestion
      stepIndex: number
      stepTotal: number
      resolvedValue?: string
      resolvedLabel?: string
    }
  | { id: string; kind: 'user-answer'; label: string }
  /**
   * A multiple-choice question the LLM itself asked mid-conversation
   * (via the ask_choice tool) — homeowner-vs-landlord-vs-developer
   * disambiguation, intent classification, etc. Distinct from
   * 'assistant-question', which drives the fixed report-intake
   * stepper; this is free-chat, so once answered the picked label
   * goes back to the LLM as the next turn's query (see answerChoice),
   * not into answersRef / the tier-question queue.
   */
  | { id: string; kind: 'assistant-choice'; prompt: string; options: string[]; resolvedLabel?: string }
  /**
   * The LLM called suggest_partner_handoff — a genuine "this needs a
   * qualified professional" moment (structural engineer, party wall
   * surveyor, etc.), not a regular answer. Rendered as its own card
   * with a connect CTA rather than a text bubble.
   */
  | { id: string; kind: 'partner-handoff'; reason: string; specialism: string }
  | { id: string; kind: 'report'; reportId: string; tier: ReportTierId; content: TieredReportContent }
  | { id: string; kind: 'report-loading'; tier: ReportTierId }
  /** Shown briefly while /api/chat/questions tailors the next batch of questions for this actor/goal. */
  | { id: string; kind: 'question-loading' }
  | { id: string; kind: 'tier-menu'; options: ReportTierId[]; resolved?: ReportTierId | 'skip' }
  | { id: string; kind: 'lead'; tier: ReportTierId; content: LeadRequestContent }

/** Offered up front, right after the free snapshot — RPT-005 isn't
 *  offered directly, it's reached via RPT-004's own handoff CTA. */
const SELECTABLE_TIERS: ReportTierId[] = ['RPT-002', 'RPT-003', 'RPT-004']

let seq = 0
function nextId() {
  seq += 1
  return `f${seq}`
}

/**
 * Chat session persistence
 * ───────────────────────────
 * Scoped deliberately narrow: only the pre-report free-chat portion
 * (before the postcode/report stepper takes over) is persisted, and
 * only ever offered back as an explicit "continue where you left off?"
 * choice — never auto-loaded over whatever the person just navigated
 * to. The report stepper already has its own, more complete resume
 * path (getPendingReport/ResumeUpgrade), so once startReportFlow runs
 * this stops saving and clears out — no stale half-state to reconcile.
 */
const CHAT_SESSION_KEY = 'chat_flow_session_v1'
const CHAT_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000 // stop offering resume after a day

interface StoredChatSession {
  savedAt: string
  actorId: ActorId | null
  goalId: GoalId | 'unsure' | null
  messages: FlowMessage[]
}

function readStoredChatSession(): StoredChatSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CHAT_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredChatSession
    if (Date.now() - new Date(parsed.savedAt).getTime() > CHAT_SESSION_MAX_AGE_MS) return null
    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

function writeStoredChatSession(session: StoredChatSession) {
  try {
    localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session))
  } catch {
    // ignore quota/availability errors — resume just won't survive a refresh
  }
}

function clearStoredChatSession() {
  try {
    localStorage.removeItem(CHAT_SESSION_KEY)
  } catch {
    // ignore
  }
}

/**
 * useReportChatFlow
 * ────────────────────
 * State machine for the public, pre-login report chat:
 *
 *   1. Person's initial query gets a real LLM-driven answer, run
 *      through the funnel skill (see lib/chatSkill.ts + /api/chat/ask).
 *      The model naturally asks for a postcode as part of the
 *      conversation and calls a real lookup_council tool to resolve
 *      it — no canned "howto" copy anymore.
 *   2. The MOMENT the LLM successfully resolves a postcode (any turn,
 *      not just the first), we auto-launch the free RPT-001 report
 *      flow — pre-filled with that postcode so its own postcode
 *      question is skipped — and ask whatever's still needed
 *      (property type, ownership, etc.) one at a time, chat-bubble
 *      style, with tap-able options. This is the "collect basic
 *      details to complete the funnel" step.
 *   3. On completion, the report renders inline, followed by a single
 *      TIER MENU listing all remaining report options at once (not a
 *      one-at-a-time "want the next one?" cascade) — same tap-a-chip
 *      pattern as the questions themselves.
 *   4. Picking a tier asks only the questions that tier still needs
 *      (cumulative from wherever they already are), then generates
 *      that exact report. Paid tiers (RPT-002/003) go straight to the
 *      cart/paywall; RPT-004 hands off to a lead-capture card.
 *   5. The menu reappears afterward minus whatever's already been
 *      generated, so they can grab another tier without repeating
 *      anything already answered — or dismiss it.
 *   6. Download of any generated report is gated by registration —
 *      see components/home/ReportDownloadGate.tsx.
 */
export interface ResumeUpgrade {
  reportId: string
  targetTier: ReportTierId
}

export function useReportChatFlow(
  initialQuery: string,
  initialGoalId: GoalId | 'unsure' | null,
  actorId: ActorId | null,
  resume?: ResumeUpgrade
) {
  const [messages, setMessages] = useState<FlowMessage[]>(() => {
    if (resume) return []
    const openingText =
      initialQuery || (actorId ? ACTOR_INTRO_TEXT[actorId] : 'What can you help me with?')
    const first: FlowMessage = { id: nextId(), kind: 'user-text', text: openingText }
    return [first]
  })

  const [activeQuestion, setActiveQuestion] = useState<ChatQuestion | null>(null)
  const [hasStartedReport, setHasStartedReport] = useState(false)
  const queueRef = useRef<ChatQuestion[]>([])
  const queueTotalRef = useRef<number>(0)
  const answersRef = useRef<TierAnswers>({})
  const currentTierRef = useRef<ReportTierId | null>(null)
  const completedRef = useRef<Set<ReportTierId>>(new Set())
  const initialFetchedRef = useRef(false)
  // Mirrors hasStartedReport but readable synchronously inside callbacks
  // (state updates are async, this guard prevents double-launching the
  // stepper if the LLM resolves a postcode more than once).
  const reportLaunchedRef = useRef(false)

  // ── Chat session resume ──────────────────────────────────────────
  // Offered, never auto-applied — see the CHAT_SESSION_KEY block above
  // for scope. Checked once on mount; the resume/report-upgrade prop
  // path (a different, more specific resume) always takes priority and
  // skips this entirely.
  const [resumableSession, setResumableSession] = useState<StoredChatSession | null>(null)
  const resumeSessionCheckedRef = useRef(false)

  useEffect(() => {
    if (resume || resumeSessionCheckedRef.current) return
    resumeSessionCheckedRef.current = true
    const stored = readStoredChatSession()
    // Only worth offering if there's more than the auto-generated
    // opening bubble — a session that never got a real reply isn't
    // worth resuming over a fresh start.
    if (stored && stored.messages.length > 1) setResumableSession(stored)
  }, [resume])

  // Persists the free-chat portion as it grows. Stops the moment the
  // report stepper takes over (hasStartedReport) — that flow has its
  // own, more complete resume path, and continuing to overwrite this
  // key with report-stepper messages would just make the eventual
  // "resume?" offer stale/confusing.
  useEffect(() => {
    if (resume || hasStartedReport || messages.length <= 1) return
    writeStoredChatSession({ savedAt: new Date().toISOString(), actorId, goalId: initialGoalId, messages })
  }, [messages, hasStartedReport, actorId, initialGoalId, resume])

  const resumeChatSession = useCallback(() => {
    if (!resumableSession) return
    setMessages(resumableSession.messages)
    setResumableSession(null)
  }, [resumableSession])

  const dismissChatSession = useCallback(() => {
    clearStoredChatSession()
    setResumableSession(null)
  }, [])

  const push = useCallback((m: FlowMessage | FlowMessage[]) => {
    setMessages(prev => [...prev, ...(Array.isArray(m) ? m : [m])])
  }, [])

  const remainingMenuOptions = useCallback(() => {
    return SELECTABLE_TIERS.filter(id => !completedRef.current.has(id))
  }, [])

  const pushTierMenu = useCallback(
    (opts: { intro: string }) => {
      const options = remainingMenuOptions()
      if (options.length === 0) {
        push({
          id: nextId(),
          kind: 'assistant-text',
          text: "That's the full range for this address — you can always come back to any of these later.",
        })
        return
      }
      push([
        { id: nextId(), kind: 'assistant-text', text: opts.intro },
        { id: nextId(), kind: 'tier-menu', options },
      ])
    },
    [push, remainingMenuOptions]
  )

  const advanceQueue = useCallback(() => {
    const next = queueRef.current.shift()
    if (next) {
      setActiveQuestion(next)
      const stepTotal = queueTotalRef.current
      const stepIndex = stepTotal - queueRef.current.length
      push({ id: nextId(), kind: 'assistant-question', question: next, stepIndex, stepTotal })
      return
    }

    // Queue empty → generate (or hand off) the tier we were filling in
    const tier = currentTierRef.current
    if (!tier) return
    setActiveQuestion(null)
    const tierDef = getTierDef(tier)
    completedRef.current.add(tier)

    if (!tierDef.automated) {
      const content = generateLeadSummary(tier, answersRef.current)
      push({ id: nextId(), kind: 'lead', tier, content })
      return
    }

    const loadingId = nextId()
    push({ id: loadingId, kind: 'report-loading', tier })

  //   generateTieredReport({ tier, answers: answersRef.current }).then(content => {
  //     const reportId = savePendingReport({ tier, answers: { ...answersRef.current }, content })

  //     setMessages(prev =>
  //       prev.map(m => (m.id === loadingId ? { id: loadingId, kind: 'report', reportId, tier, content } : m))
  //     )

  //     if (tier !== 'RPT-001') {
  //       pushTierMenu({ intro: 'Want to add another report for this address?' })
  //     }
  //   })
  // }, [push, pushTierMenu])
  generateTieredReport({ tier, answers: answersRef.current }).then(content => {
      const reportId = savePendingReport({ tier, answers: { ...answersRef.current }, content })

      setMessages(prev =>
        prev.map(m => (m.id === loadingId ? { id: loadingId, kind: 'report', reportId, tier, content } : m))
      )

      // Always offer the tier menu after a report finishes — including
      // right after the free RPT-001, which is the most important
      // moment to upsell. This used to skip RPT-001 specifically, which
      // meant the "upgrade" prompt never appeared for anyone straight
      // after their free report.
      pushTierMenu({
        intro:
          tier === 'RPT-001'
            ? 'Your free snapshot is ready above. Want a deeper report for this address?'
            : 'Want to add another report for this address?',
      })
    })
  }, [push, pushTierMenu])

  /**
   * Kicks off (or restarts) the RPT-001 free flow. Filters out any
   * question whose id is already in answersRef.current — this is what
   * lets a pre-filled postcode (from the LLM's lookup_council call)
   * skip straight past the postcode question.
   */
  const startReportFlow = useCallback(async () => {
    setHasStartedReport(true)
    reportLaunchedRef.current = true
    currentTierRef.current = 'RPT-001'
    clearStoredChatSession()

    const loadingId = nextId()
    push({ id: loadingId, kind: 'question-loading' })

    const questions = await getTailoredQuestions({
      mode: 'tier',
      tier: 'RPT-001',
      actorId,
      goalId: initialGoalId,
      answers: answersRef.current,
    })

    setMessages(prev => prev.filter(m => m.id !== loadingId))
    queueRef.current = [...questions]
    queueTotalRef.current = questions.length
    advanceQueue()
  }, [advanceQueue, push, actorId, initialGoalId])

  /**
   * Called whenever an LLM turn resolves one or more QUESTION_SLOTS
   * answers from free chat text (see resolve_answer in api/chat/ask —
   * data-driven off lib/questionSlots.ts, so this stays generic no
   * matter what slots exist). Silently pre-fills them — same idea as
   * handleResolvedPostcode, but without its own chat bubble, since the
   * model's own reply already acknowledges it naturally ("Since you live
   * in a flat…"). This is what lets the stepper skip a question the
   * person effectively already answered earlier in the conversation.
   */
  const handleResolvedSlots = useCallback((slots: Partial<TierAnswers>) => {
    if (reportLaunchedRef.current) return
    // Partial<TierAnswers> allows `undefined` values (e.g. a slot the
    // model considered but didn't actually resolve); TierAnswers itself
    // doesn't, so filter those out before merging rather than spreading
    // them straight in.
    const resolved = Object.fromEntries(
      Object.entries(slots).filter(([, value]) => value !== undefined)
    ) as TierAnswers
    answersRef.current = { ...answersRef.current, ...resolved }
  }, [])

  /**
   * Called whenever an LLM turn resolves a postcode. Pre-fills the
   * answer, acknowledges it in chat, and auto-launches the stepper for
   * whatever RPT-001 still needs — unless the report's already running.
   */
  const handleResolvedPostcode = useCallback(
    (resolved: ResolvedPostcode) => {
      if (reportLaunchedRef.current) return
      answersRef.current = { ...answersRef.current, postcode: resolved.postcode }

      push({
        id: nextId(),
        kind: 'assistant-text',
        text: `Got it — that's in ${resolved.council}. Let's grab a few more details to put your free report together:`,
      })
      startReportFlow()
    },
    [push, startReportFlow]
  )

  /**
   * Single place that decides what to do with whatever a turn resolved.
   * Every caller of generateAnswerRemote funnels its result through here
   * instead of destructuring individual fields itself — this is what
   * keeps a new resolvable field (property type, then whatever comes
   * next) from being wired up in one call site and silently forgotten
   * in another, which is exactly how the property-type question kept
   * getting re-asked.
   */
  const applyResolvedAnswer = useCallback(
    ({ answer, resolvedPostcode, resolvedSlots, resolvedChoice, resolvedConstraints, resolvedPartnerHandoff }: RemoteAnswerResult) => {
      // Non-postcode resolved slots go first (synchronously, into
      // answersRef) so that if this same turn ALSO resolves a postcode,
      // the stepper launched below already has them and won't re-ask.
      if (resolvedSlots) handleResolvedSlots(resolvedSlots)

      // When this turn resolved a postcode, handleResolvedPostcode pushes
      // its own "Got it — that's in <council>…" acknowledgment and
      // immediately launches the question stepper. Pushing the model's
      // own free-text reply as well ends up asking two separate questions
      // back-to-back — so skip the raw answer bubble on that turn.
      if (resolvedPostcode) {
        handleResolvedPostcode(resolvedPostcode)
      } else if (resolvedChoice) {
        // Same idea: resolvedChoice.prompt duplicates answer.text (the
        // API route returns the choice's own prompt as the plain-text
        // reply too, as a fallback) — render the tappable version only,
        // not both.
        push({ id: nextId(), kind: 'assistant-choice', prompt: resolvedChoice.prompt, options: resolvedChoice.options })
      } else if (resolvedPartnerHandoff) {
        // Same idea again: resolvedPartnerHandoff.reason duplicates
        // answer.text — render the structured handoff card only.
        push({
          id: nextId(),
          kind: 'partner-handoff',
          reason: resolvedPartnerHandoff.reason,
          specialism: resolvedPartnerHandoff.specialism,
        })
      } else {
        // resolvedConstraints means this turn's answer is grounded in a
        // real planning.data.gov.uk check (not just the model's own
        // knowledge) — tag the bubble so that's visible, not just implied.
        const sourceTag = resolvedConstraints ? 'Live check — planning.data.gov.uk' : undefined
        push({ id: nextId(), kind: 'assistant-answer', answer, sourceTag })
      }
    },
    [push, handleResolvedSlots, handleResolvedPostcode]
  )

  // Fires once: gets the real LLM reply to the person's opening query.
  // initialGoalId (from the goal button they clicked, e.g. "Build an
  // extension") and actorId (from the hero's "I'm a homeowner" /
  // "I'm a business" card) are both passed through as bracketed
  // context tags so the model doesn't have to re-guess — or ask for —
  // what's already known from which button was pressed. See the
  // "[Actor: …] / [Selected goal: …]" tag convention in chatSkill.ts.
  useEffect(() => {
    if (resume || initialFetchedRef.current) return
    initialFetchedRef.current = true
    const text = initialQuery || (actorId ? ACTOR_INTRO_TEXT[actorId] : 'What can you help me with?')
    const tags = [
      actorId ? `[Actor: ${actorId}]` : null,
      initialGoalId && initialGoalId !== 'unsure' ? `[Selected goal: ${initialGoalId}]` : null,
    ]
      .filter(Boolean)
      .join(' ')
    const contextHint = tags ? `${tags} ${text}` : text
    generateAnswerRemote(contextHint, []).then(applyResolvedAnswer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const answerActiveQuestion = useCallback(
    (value: string, label: string) => {
      if (!activeQuestion) return
      answersRef.current = { ...answersRef.current, [activeQuestion.id]: value }
      setMessages(prev =>
        prev.map(m =>
          m.kind === 'assistant-question' && m.question.id === activeQuestion.id
            ? { ...m, resolvedValue: value, resolvedLabel: label }
            : m
        )
      )
      push({ id: nextId(), kind: 'user-answer', label })
      advanceQueue()
    },
    [activeQuestion, push, advanceQueue]
  )

  /** Person picks one tier from the menu — asks only what that tier still needs. */
  const selectTier = useCallback(
    async (tier: ReportTierId) => {
      setMessages(prev =>
        prev.map(m => (m.kind === 'tier-menu' && !m.resolved ? { ...m, resolved: tier } : m))
      )
      const tierDef = getTierDef(tier)
      push({ id: nextId(), kind: 'user-answer', label: tierDef.name })

      if (!tierDef.automated) {
        currentTierRef.current = tier
        queueRef.current = []
        queueTotalRef.current = 0
        advanceQueue()
        return
      }

      const loadingId = nextId()
      push({ id: loadingId, kind: 'question-loading' })

      const stillNeeded = await getTailoredQuestions({
        mode: 'upTo',
        tier,
        actorId,
        goalId: initialGoalId,
        answers: answersRef.current,
      })

      setMessages(prev => prev.filter(m => m.id !== loadingId))
      currentTierRef.current = tier
      queueRef.current = stillNeeded
      queueTotalRef.current = stillNeeded.length

      if (isPaidTier(tier)) {
        push({
          id: nextId(),
          kind: 'assistant-text',
          text: `Just so you know — the ${tierDef.name} is a paid report (${tierDef.priceLabel}). Answering ${
            stillNeeded.length > 0 ? 'these questions' : 'is'
          } still free; you'll see a preview and only pay to unlock the full report.`,
        })
      }

      if (stillNeeded.length > 0) {
        push({
          id: nextId(),
          kind: 'assistant-text',
          text: `A few more questions to put together your ${tierDef.name.toLowerCase()}:`,
        })
      }

      advanceQueue()
    },
    [push, advanceQueue, actorId, initialGoalId]
  )

  const resumeHandledRef = useRef(false)

  /**
   * Resuming an upgrade from "My reports": load the previously
   * generated report's answers so its questions aren't asked again,
   * mark every tier up to it as already completed, then jump straight
   * into selectTier() for the target tier — which asks only the
   * DELTA questions that tier still needs (see getQuestionsUpTo).
   */
  useEffect(() => {
    if (!resume || resumeHandledRef.current) return
    resumeHandledRef.current = true

    const prior = getPendingReport(resume.reportId)
    if (!prior) {
      push({
        id: nextId(),
        kind: 'assistant-text',
        text: "We couldn't find that report in this browser — let's start fresh instead.",
      })
      startReportFlow()
      return
    }

    answersRef.current = { ...prior.answers }
    reportLaunchedRef.current = true
    const priorIndex = REPORT_TIERS.findIndex(t => t.id === prior.tier)
    REPORT_TIERS.slice(0, priorIndex + 1).forEach(t => completedRef.current.add(t.id))

    const targetDef = getTierDef(resume.targetTier)
    push({
      id: nextId(),
      kind: 'assistant-text',
      text: `Picking up from your ${getTierDef(prior.tier).name} — let's get you to the ${targetDef.name}.`,
    })
    selectTier(resume.targetTier)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume])

  /** Person dismisses the menu without picking anything. */
  const dismissTierMenu = useCallback(() => {
    setMessages(prev => prev.map(m => (m.kind === 'tier-menu' && !m.resolved ? { ...m, resolved: 'skip' } : m)))
    push({ id: nextId(), kind: 'user-answer', label: 'No thanks' })
    push({
      id: nextId(),
      kind: 'assistant-text',
      text: 'No problem — everything generated so far is yours to keep. Register any time to download it or pick this back up later.',
    })
  }, [push])

  /**
   * The rolling context sent to /api/chat/ask alongside each new query —
   * everything the free-chat conversation (not the report stepper) has
   * said so far, turned into plain user/assistant turns. Shared by
   * sendFollowUp and answerChoice so a choice question the person
   * answered by tapping isn't invisible to the LLM on the next turn —
   * before assistant-choice existed, this filter simply didn't know
   * about it and the model would lose track of its own question the
   * moment someone tapped instead of typing.
   */
  const buildLlmHistory = useCallback((msgs: FlowMessage[]) => {
    return msgs
      .filter(
        m =>
          m.kind === 'user-text' ||
          m.kind === 'user-answer' ||
          m.kind === 'assistant-answer' ||
          m.kind === 'assistant-text' ||
          m.kind === 'assistant-choice'
      )
      .map(m => {
        if (m.kind === 'user-text') return { role: 'user' as const, content: m.text }
        if (m.kind === 'user-answer') return { role: 'user' as const, content: m.label }
        if (m.kind === 'assistant-text') return { role: 'assistant' as const, content: m.text }
        if (m.kind === 'assistant-choice') return { role: 'assistant' as const, content: m.prompt }
        return {
          role: 'assistant' as const,
          content: m.answer.kind === 'services' ? 'Showed the services list.' : m.answer.text,
        }
      })
  }, [])

  const sendFollowUp = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      push({ id: nextId(), kind: 'user-text', text: trimmed })

      const history = buildLlmHistory(messages)
      generateAnswerRemote(trimmed, history).then(applyResolvedAnswer)
    },
    [push, messages, buildLlmHistory, applyResolvedAnswer]
  )

  /**
   * Person taps one of an assistant-choice question's options (e.g.
   * narrowing "business" down to "Developer") instead of typing. Locks
   * that bubble to the picked label, echoes it as a user-answer bubble
   * (matching how tier-menu/stepper picks look), then sends the label
   * back to the LLM as the next turn's query — same call sendFollowUp
   * makes, just without a free-text composer round-trip.
   */
  const answerChoice = useCallback(
    (messageId: string, optionLabel: string) => {
      const target = messages.find(m => m.id === messageId)
      if (!target || target.kind !== 'assistant-choice' || target.resolvedLabel) return

      setMessages(prev =>
        prev.map(m => (m.id === messageId && m.kind === 'assistant-choice' ? { ...m, resolvedLabel: optionLabel } : m))
      )
      push({ id: nextId(), kind: 'user-answer', label: optionLabel })

      const history = buildLlmHistory(messages)
      generateAnswerRemote(optionLabel, history).then(applyResolvedAnswer)
    },
    [messages, push, buildLlmHistory, applyResolvedAnswer]
  )

  /**
   * "Change" tap on an already-answered assistant-choice bubble — clears
   * its resolvedLabel so the tappable options reappear. Deliberately
   * doesn't touch the user-answer bubble that echoed the original pick
   * or send anything to the LLM by itself: picking a new option runs
   * through answerChoice as normal, which sends the new label as the
   * next turn's query, so the model sees the correction the same way
   * it'd see someone simply changing their mind mid-conversation.
   */
  const changeChoice = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(m => (m.id === messageId && m.kind === 'assistant-choice' ? { ...m, resolvedLabel: undefined } : m))
    )
  }, [])

  const inReportFlow = activeQuestion !== null

  return {
    messages,
    activeQuestion,
    inReportFlow,
    hasStartedReport,
    startReportFlow,
    answerActiveQuestion,
    selectTier,
    dismissTierMenu,
    sendFollowUp,
    answerChoice,
    changeChoice,
    resumableSession,
    resumeChatSession,
    dismissChatSession,
  }
}