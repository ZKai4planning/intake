'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Lock, Sparkles, User, ArrowLeft, Send } from 'lucide-react'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { generateAnswerRemote, type ChatAnswer as Answer } from '@/lib/chatAnswers'
import { SERVICES } from '@/lib/services'
import type { ActorId, GoalId } from '@/types'

interface ChatAnswerProps {
  query: string
  goalId: GoalId | 'unsure' | null
  actorId: ActorId | null
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  text?: string
  answer?: Answer
}

let messageSeq = 0
function nextId() {
  messageSeq += 1
  return `m${messageSeq}`
}

// Height of the fixed top Navbar (see components/layout/Navbar.tsx) —
// the chat panel is pinned to fill exactly the viewport below it.
const NAVBAR_HEIGHT = 60

/**
 * ChatAnswer
 * ────────────
 * The homepage search lands here. General questions get answered by
 * the funnel skill (see /api/chat/ask), no login required. Only once
 * someone asks how to actually *do* something does the answer prompt
 * a login — browsing what we offer never does.
 *
 * Layout unchanged from before: pinned chat-app shell between the
 * fixed Navbar and the bottom of the viewport. What's new is that
 * answers are now async (real LLM call), so there's a brief "typing"
 * state between the user's message and the assistant's reply — same
 * bouncing-dots pattern already used in AgentZWidget.tsx, for a
 * consistent feel across the app.
 */
export function ChatAnswer({ query, goalId, actorId }: ChatAnswerProps) {
  const goToApp = useAuthRedirect()
  const [followUp, setFollowUp] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const initialFetchedRef = useRef(false)

  const [messages, setMessages] = useState<Message[]>(() => [
    { id: nextId(), role: 'user', text: query || 'What can you help me with?' },
  ])

  // Fire the first assistant reply once, on mount.
  useEffect(() => {
    if (initialFetchedRef.current) return
    initialFetchedRef.current = true

    const initialText = query || 'What can you help me with?'
    setIsTyping(true)
    generateAnswerRemote(initialText, []).then(result => {
      setMessages(prev => [...prev, { id: nextId(), role: 'assistant', answer: result.answer }])
      setIsTyping(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll the message list (not the whole page) to the newest
  // message whenever the conversation changes.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  /** Builds the {role, content} history the API expects, oldest first. */
  function buildHistory(): { role: 'user' | 'assistant'; content: string }[] {
    return messages.map(m => ({
      role: m.role,
      content:
        m.role === 'user'
          ? m.text ?? ''
          : m.answer?.kind === 'services'
            ? 'Showed the services list.'
            : m.answer?.text ?? '',
    }))
  }

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = followUp.trim()
    if (!trimmed || isTyping) return

    const history = buildHistory()
    setMessages(prev => [...prev, { id: nextId(), role: 'user', text: trimmed }])
    setFollowUp('')
    setIsTyping(true)

    generateAnswerRemote(trimmed, history).then(result => {
      setMessages(prev => [...prev, { id: nextId(), role: 'assistant', answer: result.answer }])
      setIsTyping(false)
    })
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-0 flex flex-col bg-[#0A0E1A]"
      style={{ top: NAVBAR_HEIGHT }}
    >
      {/* ── Chat header — stays put, doesn't scroll away ─────────── */}
      <div className="shrink-0 border-b border-white/[0.06] px-5 sm:px-8 py-3">
        <div className="max-w-[760px] mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#5A6A8A] hover:text-[#E8F0FF] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to homepage
          </Link>
        </div>
      </div>

      {/* ── Message list — the only part that scrolls ────────────── */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-8 py-6">
        <div className="max-w-[760px] mx-auto space-y-6">
          {messages.map(message =>
            message.role === 'user' ? (
              <UserBubble key={message.id} text={message.text ?? ''} />
            ) : (
              <AssistantBubble key={message.id} answer={message.answer!} actorId={actorId} goToApp={goToApp} />
            )
          )}
          {isTyping && <ThinkingBubble />}
        </div>
      </div>

      {/* ── Composer — pinned to the bottom of the screen ────────── */}
      <div className="shrink-0 border-t border-white/[0.06] bg-[#0A0E1A] px-5 sm:px-8 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="max-w-[760px] mx-auto">
          <form onSubmit={handleFollowUpSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={followUp}
              onChange={e => setFollowUp(e.target.value)}
              placeholder="Ask a follow-up question…"
              className="flex-1 rounded-[12px] bg-[#0F1525] border border-white/[0.08] px-4 py-3 text-[14px] text-[#E8F0FF] placeholder:text-[#5A6A8A] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              type="submit"
              disabled={isTyping}
              className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#135BEC] text-white hover:bg-[#2A6BF0] disabled:opacity-50 disabled:hover:bg-[#135BEC] transition-colors"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-2 text-[11.5px] text-[#5A6A8A]">
            Ask anything — you'll only need to log in once you're ready to check a specific project or address.
          </p>
        </div>
      </div>
    </div>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#135BEC] text-white px-4 py-3 text-[14.5px] leading-relaxed">
        {text}
      </div>
      <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[#A8B8D8] mt-0.5">
        <User className="h-4 w-4" />
      </span>
    </div>
  )
}

/** Same avatar as AssistantBubble, same bouncing-dots pattern as AgentZWidget.tsx. */
function ThinkingBubble() {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 border border-blue-400/30 text-[#00D4FF] mt-0.5">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-[#0F1525] border border-white/[0.08] px-4 py-3.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5A6A8A]"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

function AssistantBubble({
  answer,
  actorId,
  goToApp,
}: {
  answer: Answer
  actorId: ActorId | null
  goToApp: (actorId: ActorId | null) => void
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 border border-blue-400/30 text-[#00D4FF] mt-0.5">
        <Sparkles className="h-4 w-4" />
      </span>

      <div className="max-w-[85%] w-full">
        {answer.kind === 'services' ? (
          <ServicesAnswer />
        ) : (
          <div className="rounded-2xl rounded-tl-sm bg-[#0F1525] border border-white/[0.08] px-4 py-3.5 text-[14.5px] leading-relaxed text-[#E8F0FF]">
            {answer.text}
            {answer.kind === 'howto' && answer.goal && (
              <p className="mt-2 text-[12.5px] text-[#5A6A8A]">
                Matched goal: <span className="text-[#A8B8D8]">{answer.goal.title}</span>
              </p>
            )}

            {answer.kind === 'howto' && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-blue-400/25 bg-blue-500/[0.06] px-3.5 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[#00D4FF]">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-[12.5px] text-[#A8B8D8]">
                    That's the free-text answer — the real, address-specific process is behind login.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => goToApp(actorId)}
                  className="shrink-0 rounded-full bg-[#135BEC] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors"
                >
                  Log in
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ServicesAnswer() {
  return (
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
  )
}