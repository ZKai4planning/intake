'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import type { AgentMessage } from '@/types/agent'

interface InlineAgentPanelProps {
  messages: AgentMessage[]
  isThinking: boolean
  onSend: (text: string) => void
}

/**
 * InlineAgentPanel
 * ──────────────────
 * Renders directly under a question's input — same card, same border,
 * no modal/overlay. This is the "agent is part of the form, not a
 * separate chat" requirement: it opens and closes inline, and every
 * message it holds is already scoped to that one question.
 */
export function InlineAgentPanel({ messages, isThinking, onSend }: InlineAgentPanelProps) {
  const [draft, setDraft] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    onSend(draft)
    setDraft('')
  }

  return (
    <div
      className={cn(
        'mt-3 rounded-[10px] border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.04)]',
        'animate-[fadeIn_0.15s_ease-out]'
      )}
    >
      {/* ── Thread ─────────────────────────────────────────── */}
      <div className="max-h-[220px] overflow-y-auto px-3.5 pt-3.5 space-y-2.5">
        {messages.map(m => (
          <AgentBubble key={m.id} message={m} />
        ))}
        {isThinking && <ThinkingBubble />}
      </div>

      {/* ── Composer ───────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3.5 py-3">
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Ask about this question…"
          className={cn(
            'flex-1 rounded-[8px] px-3 py-2 text-[13px]',
            'bg-[#0A0E1A] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
            'border border-white/[0.10] outline-none transition-all',
            'focus:border-[#00D4FF] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.12)]'
          )}
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className={cn(
            'shrink-0 px-3 py-2 rounded-[8px] text-[12.5px] font-semibold transition-colors',
            draft.trim()
              ? 'bg-[#00D4FF] text-[#050A12] hover:bg-[#33DFFF]'
              : 'bg-white/[0.06] text-[#5A6A8A] cursor-not-allowed'
          )}
        >
          Ask
        </button>
      </form>
    </div>
  )
}

function AgentBubble({ message }: { message: AgentMessage }) {
  const isAgent = message.role === 'agent'
  return (
    <div className={cn('flex', isAgent ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[85%] px-3 py-2 rounded-[10px] text-[12.5px] leading-relaxed',
          isAgent
            ? 'bg-[#0F1525] text-[#A8B8D8] border border-white/[0.08]'
            : 'bg-[rgba(19,91,236,0.1)] text-[#E8F0FF] border border-[rgba(19,91,236,0.2)]'
        )}
      >
        {isAgent && (
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#00D4FF] mb-1">
            ✦ Agent
          </span>
        )}
        {message.content}
      </div>
    </div>
  )
}

function ThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="px-3 py-2.5 rounded-[10px] bg-[#0F1525] border border-white/[0.08] flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#5A6A8A] animate-bounce"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  )
}
