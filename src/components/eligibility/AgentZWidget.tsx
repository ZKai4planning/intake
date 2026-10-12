'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, X, Send } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAgentZ } from './AgentZContext'

/**
 * AgentZWidget
 * ──────────────
 * The visible half of the mock agent — a floating launcher, bottom
 * right, with a small panel behind it. Labeled "Preview" throughout so
 * it never reads as a real live agent (see lib/agentZ.ts's header for
 * the swap point when it becomes one). Render this once, at the
 * eligibility wizard page level, inside <AgentZProvider>.
 */
export function AgentZWidget() {
  const { isOpen, messages, isTyping, openAgent, closeAgent, sendMessage } = useAgentZ()
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  function handleSend() {
    if (!draft.trim()) return
    sendMessage(draft)
    setDraft('')
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => (isOpen ? closeAgent() : openAgent({}))}
        className={cn(
          'fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all',
          'bg-gradient-to-br from-[#135BEC] to-[#00D4FF] text-white hover:scale-105',
          isOpen && 'scale-90 opacity-0 pointer-events-none'
        )}
        aria-label="Open Agent Z"
      >
        <Sparkles className="h-5 w-5" />
      </button>

      {/* Panel */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-40 flex w-[340px] flex-col overflow-hidden rounded-[16px] border border-white/[0.10] bg-[#0F1525] shadow-2xl transition-all duration-200',
          isOpen ? 'h-[440px] opacity-100' : 'pointer-events-none h-0 opacity-0'
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.08] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#135BEC] to-[#00D4FF] text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-[12.5px] font-semibold text-[#E8F0FF] leading-tight">Agent Z</p>
              <p className="text-[10.5px] text-[#5A6A8A] leading-tight">Preview — not a live agent yet</p>
            </div>
          </div>
          <button onClick={closeAgent} className="text-[#5A6A8A] hover:text-[#E8F0FF]" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {messages.length === 0 && !isTyping && (
            <p className="text-[12px] text-[#5A6A8A]">
              Ask about anything on this form — Agent Z picks up context from whatever field you were on.
            </p>
          )}
          {messages.map(m => (
            <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-[12px] px-3 py-2 text-[12.5px] leading-relaxed',
                  m.role === 'user' ? 'bg-[#135BEC] text-white' : 'bg-white/[0.05] text-[#A8B8D8]'
                )}
              >
                {m.fieldLabel && m.role === 'user' && (
                  <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-wide text-white/70">{m.fieldLabel}</p>
                )}
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-[12px] bg-white/[0.05] px-3 py-2.5">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5A6A8A]"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-white/[0.08] p-3">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask Agent Z…"
            className="flex-1 rounded-full border border-white/[0.12] bg-[#141C30] px-3.5 py-2 text-[12.5px] text-[#E8F0FF] placeholder:text-[#5A6A8A] outline-none focus:border-[#135BEC]"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#135BEC] text-white disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </>
  )
}
