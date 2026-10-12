
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Sparkles, User, ArrowLeft, Send, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getCart, cartTotal } from '@/lib/cart'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { useReportChatFlow, type FlowMessage } from '@/hooks/useReportChatFlow'
import { useVoiceInput } from '@/hooks/useVoiceInput'
import { SERVICES } from '@/lib/services'
import { getTierDef } from '@/lib/reportTiers'
import { ReportCard } from './ReportCard'
import { NumberedCard } from './NumberedCard'

import type { ActorId, GoalId } from '@/types'
import type { ChatQuestion, ReportTierId } from '@/types/reportTiers'
import { MicButton } from '../ui/MicButton'

interface ReportChatFlowProps {
  query: string
  goalId: GoalId | 'unsure' | null
  actorId: ActorId | null
  resumeReportId?: string
  resumeTargetTier?: ReportTierId
}

const NAVBAR_HEIGHT = 60

/**
 * ReportChatFlow
 * ─────────────────
 * Response animation (see useRevealPhase / bubble components below):
 *   user sends → assistant bubble mounts immediately → "..." thinking
 *   dots for 300–800ms → text streams in word-by-word → blinking
 *   cursor while streaming, disappears once the answer is fully shown.
 *   Structured bubbles (report cards, lead cards) skip the word-stream
 *   but keep the same thinking-dots delay before they appear.
 */
export function ReportChatFlow({ query, goalId, actorId, resumeReportId, resumeTargetTier }: ReportChatFlowProps) {
  const goToApp = useAuthRedirect()
  const [followUp, setFollowUp] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [cartValue, setCartValue] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { isListening, supported: voiceSupported, toggle: toggleVoice } = useVoiceInput({
    value: followUp,
    onChange: setFollowUp,
  })

  useEffect(() => {
    function refreshCart() {
      setCartCount(getCart().length)
      setCartValue(cartTotal())
    }
    refreshCart()
    window.addEventListener('cart:changed', refreshCart)
    return () => window.removeEventListener('cart:changed', refreshCart)
  }, [])

  const {
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
  } = useReportChatFlow(
    query,
    goalId,
    actorId,
    resumeReportId && resumeTargetTier ? { reportId: resumeReportId, targetTier: resumeTargetTier } : undefined
  )

  // scrollIntoView on a sentinel at the end of the list, rather than
  // scrollTo(scrollHeight) — scrollHeight can be stale the instant a
  // message is pushed (the reveal-phase bubble hasn't grown to full
  // size yet), which left new questions landing short of the bottom.
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Bubbles call this as they stream so the viewport keeps tracking the
  // growing bubble instead of only jumping once at the very end.
  const handleStreamProgress = () => {
    scrollToBottom()
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = followUp.trim()
    if (!trimmed) return

    if (activeQuestion && activeQuestion.inputType === 'text') {
      answerActiveQuestion(trimmed, trimmed)
    } else {
      sendFollowUp(trimmed)
    }
    setFollowUp('')
  }

  const pendingChoice = messages.find(m => m.kind === 'assistant-choice' && m.resolvedLabel === undefined) ?? null

  const composerDisabled = (!!activeQuestion && activeQuestion.inputType === 'options') || !!pendingChoice

  return (
    <div className="fixed inset-x-0 bottom-0 z-0 flex flex-col bg-[#0A0E1A]" style={{ top: NAVBAR_HEIGHT }}>
      <div className="shrink-0 px-5 sm:px-8 py-3">
        <div className="max-w-[760px] mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#5A6A8A] hover:text-[#E8F0FF] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to homepage
          </Link>
          {cartCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/25 bg-blue-500/[0.08] px-3 py-1.5 text-[12px] font-medium text-[#A8B8D8]">
              <ShoppingCart className="h-3.5 w-3.5 text-[#00D4FF]" />
              {cartCount} {cartCount === 1 ? 'report' : 'reports'} in cart · £{cartValue}
            </span>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-8 py-6">
        <div className="max-w-[760px] mx-auto space-y-6">
          {resumableSession && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-400/25 bg-blue-500/[0.06] px-4 py-3">
              <p className="text-[12.5px] text-[#A8B8D8]">Continue your previous conversation?</p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={dismissChatSession}
                  className="text-[12px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors px-2 py-1"
                >
                  Start fresh
                </button>
                <button
                  type="button"
                  onClick={resumeChatSession}
                  className="rounded-full bg-[#135BEC] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors"
                >
                  Resume
                </button>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <MessageRow
              key={message.id}
              message={message}
              precedingQuestionLabel={
                message.kind === 'user-answer' ? getPrecedingQuestionLabel(messages, index) : undefined
              }
              actorId={actorId}
              goToApp={goToApp}
              onStartReport={startReportFlow}
              hasStartedReport={hasStartedReport}
              onProgress={handleStreamProgress}
              activeQuestionId={activeQuestion?.id}
              onAnswerQuestion={answerActiveQuestion}
              onSelectTier={selectTier}
              onDismissTierMenu={dismissTierMenu}
              onAnswerChoice={answerChoice}
              onChangeChoice={changeChoice}
            />
          ))}
          <div ref={bottomRef} aria-hidden className="h-px" />
        </div>
      </div>

      <div className="shrink-0 px-5 sm:px-8 pt-2 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="max-w-[760px] mx-auto">
          <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-1 rounded-[14px] bg-[#0F1525] border border-white/[0.08] pl-4 pr-2 focus-within:ring-2 focus-within:ring-blue-500/40">
              <input
                type="text"
                value={followUp}
                onChange={e => setFollowUp(e.target.value)}
                disabled={composerDisabled}
                placeholder={
                  isListening
                    ? 'Listening…'
                    : composerDisabled
                    ? 'Pick an option above, or skip to type your own…'
                    : activeQuestion
                    ? activeQuestion.placeholder ?? 'Type your answer…'
                    : 'Ask a follow-up question…'
                }
                className={cn(
                  'flex-1 min-w-0 bg-transparent py-3 text-[14px] text-[#E8F0FF] placeholder:text-[#5A6A8A] focus:outline-none disabled:opacity-50',
                  isListening && 'placeholder:text-[#00D4FF]'
                )}
              />
              <MicButton
                isListening={isListening}
                supported={voiceSupported}
                onClick={toggleVoice}
                className={composerDisabled ? 'opacity-40 pointer-events-none' : undefined}
              />
            </div>
            <button
              type="submit"
              disabled={composerDisabled}
              className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#135BEC] text-white hover:bg-[#2A6BF0] transition-colors disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-2 text-[11.5px] text-[#5A6A8A]">
            {inReportFlow
              ? "Answer above — your report builds as you go, free, no login needed."
              : "Ask anything — reports build right here in chat, free. Login's only needed to download one."}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * A `user-answer` bubble doesn't carry its own question text, but in
 * every flow that produces one (answerActiveQuestion, skipActiveQuestion)
 * the hook pushes it immediately after the `assistant-question` message
 * it's answering — nothing else lands in between. So the label is just
 * whatever question directly precedes it, if any (tier-menu picks and
 * "No thanks" dismissals have no preceding question, so they render
 * with no label, same as before).
 */
function getPrecedingQuestionLabel(messages: FlowMessage[], index: number): string | undefined {
  const prev = messages[index - 1]
  if (prev && prev.kind === 'assistant-question') return prev.question.shortLabel
  return undefined
}

function MessageRow({
  message,
  precedingQuestionLabel,
  actorId,
  goToApp,
  onStartReport,
  hasStartedReport,
  onProgress,
  activeQuestionId,
  onAnswerQuestion,
  onSelectTier,
  onDismissTierMenu,
  onAnswerChoice,
  onChangeChoice,
}: {
  message: FlowMessage
  precedingQuestionLabel?: string
  actorId: ActorId | null
  goToApp: (actorId: ActorId | null) => void
  onStartReport: () => void
  hasStartedReport: boolean
  onProgress?: () => void
  activeQuestionId?: string
  onAnswerQuestion: (value: string, label: string) => void
  onSelectTier: (tier: ReportTierId) => void
  onDismissTierMenu: () => void
  onAnswerChoice: (messageId: string, optionLabel: string) => void
  onChangeChoice: (messageId: string) => void
}) {
  switch (message.kind) {
    case 'user-text':
      return <UserBubble text={message.text} />
    case 'user-answer':
      return <UserBubble text={message.label} questionLabel={precedingQuestionLabel} />
    case 'assistant-text':
      return <AssistantTextBubble text={message.text} onProgress={onProgress} />
    case 'assistant-answer':
      return (
        <AssistantAnswerBubble
          answer={message.answer}
          sourceTag={message.sourceTag}
          actorId={actorId}
          goToApp={goToApp}
          onStartReport={onStartReport}
          hasStartedReport={hasStartedReport}
          onProgress={onProgress}
        />
      )
    case 'assistant-choice':
      return (
        <AssistantRevealShell onProgress={onProgress}>
          <ChoiceBubble message={message} onAnswer={onAnswerChoice} onChange={onChangeChoice} />
        </AssistantRevealShell>
      )
    case 'partner-handoff':
      return (
        <AssistantRevealShell onProgress={onProgress}>
          <PartnerHandoffCard
            reason={message.reason}
            specialism={message.specialism}
            actorId={actorId}
            goToApp={goToApp}
          />
        </AssistantRevealShell>
      )
    case 'assistant-question':
      return (
        <AssistantRevealShell onProgress={onProgress}>
          <QuestionBubble
            question={message.question}
            stepIndex={message.stepIndex}
            stepTotal={message.stepTotal}
            resolvedValue={message.resolvedValue}
            resolvedLabel={message.resolvedLabel}
            active={message.question.id === activeQuestionId}
            onAnswer={onAnswerQuestion}
          />
        </AssistantRevealShell>
      )
    case 'tier-menu':
      return (
        <AssistantRevealShell onProgress={onProgress}>
          <TierMenuBubble
            options={message.options}
            resolved={message.resolved}
            onSelect={onSelectTier}
            onDismiss={onDismissTierMenu}
          />
        </AssistantRevealShell>
      )
    case 'report':
      return (
        <AssistantRevealShell onProgress={onProgress}>
          <ReportCard reportId={message.reportId} tier={message.tier} content={message.content} hideUpgrade compact />
        </AssistantRevealShell>
      )
    case 'report-loading':
      return (
        <AssistantShell>
          <div className="inline-flex items-center gap-2.5 rounded-2xl rounded-tl-sm bg-[#0F1525] border border-white/[0.08] px-4 py-3.5 text-[13.5px] text-[#A8B8D8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D4FF] animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D4FF] animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D4FF] animate-bounce" />
            Checking live planning data for this address…
          </div>
        </AssistantShell>
      )
    case 'question-loading':
      return (
        <AssistantShell>
          <div className="inline-flex items-center gap-2.5 rounded-2xl rounded-tl-sm bg-[#0F1525] border border-white/[0.08] px-4 py-3.5 text-[13.5px] text-[#A8B8D8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D4FF] animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D4FF] animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D4FF] animate-bounce" />
            Tailoring the next few questions…
          </div>
        </AssistantShell>
      )
    case 'lead':
      return <LeadCard tier={message.tier} summaryLine={message.content.summaryLine} onProgress={onProgress} />
    default:
      return null
  }
}

/**
 * useRevealPhase
 * ────────────────
 * Shared animation driver for every assistant bubble: thinking dots for
 * a random 300–800ms, then either a word-by-word stream (when `fullText`
 * is given) or an immediate reveal (when it's null, for structured
 * content like report/lead cards), then "done".
 */
type Phase = 'thinking' | 'streaming' | 'done'

function useRevealPhase(fullText: string | null, onProgress?: () => void) {
  const [phase, setPhase] = useState<Phase>('thinking')
  const [wordCount, setWordCount] = useState(0)
  const words = useRef(fullText ? fullText.split(' ') : []).current

  useEffect(() => {
    const thinkMs = 300 + Math.random() * 500
    const thinkTimer = setTimeout(() => setPhase('streaming'), thinkMs)
    return () => clearTimeout(thinkTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (phase !== 'streaming') return

    if (!fullText) {
      setPhase('done')
      return
    }

    if (wordCount >= words.length) {
      setPhase('done')
      return
    }

    const stepMs = 28 + Math.random() * 35
    const stepTimer = setTimeout(() => {
      setWordCount(c => c + 1)
      onProgress?.()
    }, stepMs)

    return () => clearTimeout(stepTimer)
  }, [phase, wordCount, words.length, fullText, onProgress])

  useEffect(() => {
    if (phase === 'done') onProgress?.()
  }, [phase, onProgress])

  return { phase, text: words.slice(0, wordCount).join(' ') }
}

function ThinkingBubble() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-[#0F1525] border border-white/[0.08] px-4 py-3.5">
      <span className="h-1.5 w-1.5 rounded-full bg-[#5A6A8A] animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[#5A6A8A] animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[#5A6A8A] animate-bounce" />
    </div>
  )
}

function BlinkingCursor() {
  return (
    <span
      aria-hidden
      className="inline-block w-[2px] h-[14px] bg-[#00D4FF] ml-0.5 -mb-0.5 animate-pulse"
    />
  )
}

function AssistantShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 border border-blue-400/30 text-[#00D4FF] mt-0.5">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="max-w-[85%] w-full">{children}</div>
    </div>
  )
}

/** Thinking-dots delay wrapper for structured (non-text) assistant content. */
function AssistantRevealShell({ children, onProgress }: { children: React.ReactNode; onProgress?: () => void }) {
  const { phase } = useRevealPhase(null, onProgress)
  return <AssistantShell>{phase === 'thinking' ? <ThinkingBubble /> : children}</AssistantShell>
}

function UserBubble({ text, questionLabel }: { text: string; questionLabel?: string }) {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="max-w-[80%] flex flex-col items-end gap-1">
        {questionLabel && (
          <span className="pr-1 text-[11px] font-medium text-[#5A6A8A] uppercase tracking-wide">
            {questionLabel}
          </span>
        )}
        <div className="rounded-2xl rounded-tr-sm bg-[#135BEC] text-white px-4 py-3 text-[14.5px] leading-relaxed">
          {text}
        </div>
      </div>
      <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[#A8B8D8] mt-0.5">
        <User className="h-4 w-4" />
      </span>
    </div>
  )
}

function AssistantTextBubble({ text, onProgress }: { text: string; onProgress?: () => void }) {
  const { phase, text: streamed } = useRevealPhase(text, onProgress)
  return (
    <AssistantShell>
      {phase === 'thinking' ? (
        <ThinkingBubble />
      ) : (
        <div className="rounded-2xl rounded-tl-sm bg-[#0F1525] border border-white/[0.08] px-4 py-3.5 text-[14.5px] leading-relaxed text-[#E8F0FF]">
          {streamed}
          {phase === 'streaming' && <BlinkingCursor />}
        </div>
      )}
    </AssistantShell>
  )
}

function AssistantAnswerBubble({
  answer,
  sourceTag,
  actorId,
  goToApp,
  onStartReport,
  hasStartedReport,
  onProgress,
}: {
  answer: import('@/lib/chatAnswers').ChatAnswer
  sourceTag?: string
  actorId: ActorId | null
  goToApp: (actorId: ActorId | null) => void
  onStartReport: () => void
  hasStartedReport: boolean
  onProgress?: () => void
}) {
  const isServices = answer.kind === 'services'
  const { phase, text: streamed } = useRevealPhase(isServices ? null : answer.text, onProgress)

  if (phase === 'thinking') {
    return (
      <AssistantShell>
        <ThinkingBubble />
      </AssistantShell>
    )
  }

  if (isServices) {
    return (
      <AssistantShell>
        <div className="rounded-2xl rounded-tl-sm bg-[#0F1525] border border-white/[0.08] p-4">
          <p className="text-[14.5px] leading-relaxed text-[#E8F0FF] mb-4">
            Here's what we help with — pick whichever's closest to your situation:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SERVICES.map(service => (
              <Link
                key={service.id}
                href="/#services"
                className={`rounded-xl border px-3.5 py-3 transition-colors ${
                  service.status === 'active'
                    ? 'border-white/[0.08] bg-white/[0.03] hover:border-blue-400/50 hover:bg-white/[0.06]'
                    : 'border-white/[0.05] bg-white/[0.015] opacity-60 cursor-not-allowed pointer-events-none'
                }`}
              >
                <p className="text-[11px] font-bold text-blue-400 mb-1">{service.label}</p>
                <p className="text-[13px] font-semibold text-[#E8F0FF]">{service.subtitle}</p>
                {service.status !== 'active' && (
                  <p className="mt-1 text-[10.5px] font-medium text-amber-300/80">Coming soon</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </AssistantShell>
    )
  }

  return (
    <AssistantShell>
      <div className="rounded-2xl rounded-tl-sm bg-[#0F1525] border border-white/[0.08] px-4 py-3.5 text-[14.5px] leading-relaxed text-[#E8F0FF]">
        {streamed}
        {phase === 'streaming' && <BlinkingCursor />}

        {phase === 'done' && sourceTag && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[10.5px] font-medium text-emerald-300/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {sourceTag}
          </p>
        )}

        {phase === 'done' && answer.kind === 'howto' && answer.goal && (
          <p className="mt-2 text-[12.5px] text-[#5A6A8A]">
            Matched goal: <span className="text-[#A8B8D8]">{answer.goal.title}</span>
          </p>
        )}

        {phase === 'done' && answer.kind === 'howto' && (
          <div
            className={`mt-4 flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 ${
              hasStartedReport
                ? 'border-white/[0.08] bg-white/[0.02]'
                : 'border-blue-400/25 bg-blue-500/[0.06]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  hasStartedReport ? 'bg-white/[0.06] text-[#5A6A8A]' : 'bg-blue-500/20 text-[#00D4FF]'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <p className="text-[12.5px] text-[#A8B8D8]">
                {hasStartedReport
                  ? 'Report started below ↓'
                  : 'Want the real, address-specific read? Build a free report right here.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onStartReport}
              disabled={hasStartedReport}
              className="shrink-0 rounded-full bg-[#135BEC] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors disabled:opacity-40 disabled:pointer-events-none disabled:hover:bg-[#135BEC]"
            >
              {hasStartedReport ? 'Started' : 'Start free report'}
            </button>
          </div>
        )}
      </div>
    </AssistantShell>
  )
}

function ChoiceBubble({
  message,
  onAnswer,
  onChange,
}: {
  message: Extract<FlowMessage, { kind: 'assistant-choice' }>
  onAnswer: (messageId: string, optionLabel: string) => void
  onChange: (messageId: string) => void
}) {
  const active = message.resolvedLabel === undefined

  // Same collapse-once-answered pattern as QuestionBubble: once the
  // person's picked an option, the full tappable list is redundant
  // with the user-answer bubble the hook pushes right after — just
  // show what was asked and what they picked, with a way back in if
  // they tapped the wrong one.
  if (!active) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#0F1525] overflow-hidden">
        <div className="px-4 py-3">
          <p className="text-[13.5px] font-medium text-[#E8F0FF] leading-snug">{message.prompt}</p>
        </div>
        <div className="flex items-center justify-between px-4 pb-3">
          <p className="text-[12px] text-[#5A6A8A]">{message.resolvedLabel}</p>
          <button
            type="button"
            onClick={() => onChange(message.id)}
            className="text-[11px] font-medium text-[#00D4FF] hover:text-[#7FE0FF] transition-colors"
          >
            Change
          </button>
        </div>
      </div>
    )
  }

  return (
    <NumberedCard
      title={message.prompt}
      active={active}
      items={message.options.map(opt => ({
        key: opt,
        label: opt,
        onSelect: () => onAnswer(message.id, opt),
      }))}
      onCustom={value => onAnswer(message.id, value)}
    />
  )
}

/**
 * Renders a suggest_partner_handoff turn — a genuine "this needs a
 * qualified professional" moment, distinct from a regular answer bubble
 * so it doesn't read as just more chat text. CTA routes through the
 * same useAuthRedirect (goToApp) every other conversion point on this
 * page uses: logged in → dashboard, otherwise → login carrying the
 * actor, where partner matching picks up from there.
 */
function PartnerHandoffCard({
  reason,
  specialism,
  actorId,
  goToApp,
}: {
  reason: string
  specialism: string
  actorId: ActorId | null
  goToApp: (actorId: ActorId | null) => void
}) {
  return (
    <div className="rounded-2xl rounded-tl-sm border border-purple-400/25 bg-purple-500/[0.06] px-4 py-3.5">
      <div className="flex items-start gap-2.5 mb-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-300">
          <User className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-purple-300 mb-1">
            Worth a {specialism.toLowerCase()}
          </p>
          <p className="text-[13.5px] leading-relaxed text-[#E8F0FF]">{reason}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => goToApp(actorId)}
        className="w-full rounded-full bg-purple-500 px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-purple-400 transition-colors"
      >
        Connect me with a {specialism.toLowerCase()}
      </button>
    </div>
  )
}

function QuestionBubble({
  question,
  stepIndex,
  stepTotal,
  resolvedValue,
  resolvedLabel,
  active,
  onAnswer,
}: {
  question: ChatQuestion
  stepIndex: number
  stepTotal: number
  resolvedValue?: string
  resolvedLabel?: string
  active: boolean
  onAnswer: (value: string, label: string) => void
}) {
  const stepLabel = `${stepIndex} of ${stepTotal}`

  // Once answered, don't keep re-rendering the full options list (all
  // rows, numbers, step counter) in the chat history — that's already
  // captured by the separate user-answer bubble the hook pushes right
  // after. Collapse it to the same compact "question + answer" summary
  // used by text-input questions below.
  if (!active && resolvedLabel !== undefined) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#0F1525] overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="text-[13.5px] font-medium text-[#E8F0FF] leading-snug">{question.prompt}</p>
          <span className="shrink-0 text-[11.5px] text-[#5A6A8A]">{stepLabel}</span>
        </div>
        <p className="px-4 pb-3 text-[12px] text-[#5A6A8A]">{resolvedLabel}</p>
      </div>
    )
  }

  if (question.inputType === 'options' && question.options) {
    return (
      <NumberedCard
        title={question.prompt}
        stepLabel={stepLabel}
        active={active}
        selectedKey={resolvedValue}
        items={question.options.map(opt => ({
          key: opt.value,
          label: opt.label,
          onSelect: () => onAnswer(opt.value, opt.label),
        }))}
        onCustom={value => onAnswer(value, value)}
      />
    )
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0F1525] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="text-[13.5px] font-medium text-[#E8F0FF] leading-snug">{question.prompt}</p>
        <span className="shrink-0 text-[11.5px] text-[#5A6A8A]">{stepLabel}</span>
      </div>
      <p className="px-4 pb-3 text-[12px] text-[#5A6A8A]">Type your answer in the box below ↓</p>
    </div>
  )
}

function TierMenuBubble({
  options,
  resolved,
  onSelect,
  onDismiss,
}: {
  options: ReportTierId[]
  resolved?: ReportTierId | 'skip'
  onSelect: (tier: ReportTierId) => void
  onDismiss: () => void
}) {
  return (
    <NumberedCard
      title="Want to go further? Choose a report"
      active={!resolved}
      selectedKey={typeof resolved === 'string' && resolved !== 'skip' ? resolved : undefined}
      items={options.map(tierId => {
        const tierDef = getTierDef(tierId)
        return {
          key: tierId,
          label: `${tierDef.name} — ${tierDef.priceLabel}`,
          sublabel: tierDef.outputSummary,
          detail: `You'll need to provide: ${tierDef.inputsSummary}.`,
          onSelect: () => onSelect(tierId),
        }
      })}
      onSkip={onDismiss}
    />
  )
}

function LeadCard({
  tier,
  summaryLine,
  onProgress,
}: {
  tier: ReportTierId
  summaryLine: string
  onProgress?: () => void
}) {
  const tierDef = getTierDef(tier)
  return (
    <AssistantRevealShell onProgress={onProgress}>
      <div className="rounded-2xl rounded-tl-sm border border-blue-400/25 bg-blue-500/[0.06] p-4">
        <p className="text-[11px] font-bold text-[#00D4FF] uppercase tracking-wide mb-1">{tierDef.badge}</p>
        <p className="text-[14.5px] font-semibold text-[#E8F0FF] leading-relaxed">{tierDef.name}</p>
        <p className="mt-1.5 text-[13px] text-[#A8B8D8] leading-relaxed">{summaryLine}</p>
        <p className="mt-2 text-[12.5px] text-[#A8B8D8]">
          This step needs a person, not just AI — leave your details and a consultant will pick it up from here.
        </p>
        <div className="mt-3 flex gap-2">
          <Link
            href="/signup"
            className="rounded-full bg-[#135BEC] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors"
          >
            Register &amp; continue
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-white/[0.12] px-4 py-2 text-[12.5px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF] hover:border-white/20 transition-colors"
          >
            Talk to us instead
          </Link>
        </div>
      </div>
    </AssistantRevealShell>
  )
}