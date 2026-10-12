'use client'

import { cn } from '@/lib/cn'
import { QuestionField } from './QuestionField'
import { InlineAgentPanel } from './InlineAgentPanel'
import type { QuestionRow, QuestionAnswer } from '@/types/questions'
import type { AgentMessage } from '@/types/agent'

interface QuestionCardProps {
  question: QuestionRow
  answer: QuestionAnswer | undefined
  onChange: (value: string | string[] | File[] | null) => void
  isAgentOpen: boolean
  agentMessages: AgentMessage[]
  isAgentThinking: boolean
  onToggleAgent: () => void
  onSendToAgent: (text: string) => void
}

/**
 * QuestionCard
 * ─────────────
 * Composes QuestionField (unchanged) with the inline agent trigger + panel.
 * Deliberately wraps rather than modifies QuestionField, so every existing
 * input type keeps working exactly as before — the agent is bolted on at
 * the card level, anchored to whichever question it was opened from.
 */
export function QuestionCard({
  question, answer, onChange,
  isAgentOpen, agentMessages, isAgentThinking, onToggleAgent, onSendToAgent,
}: QuestionCardProps) {
  return (
    <div
      className={cn(
        'rounded-[14px] border p-4 sm:p-5 transition-colors',
        answer?.flaggedForUpsell
          ? 'border-[rgba(245,158,11,0.3)] bg-[rgba(245,158,11,0.03)]'
          : 'border-white/[0.08] bg-[#0F1525]'
      )}
    >
      <QuestionField
        question={question}
        value={answer?.value ?? null}
        onChange={onChange}
      />

      {/* ── Agent trigger ──────────────────────────────────── */}
      <button
        type="button"
        onClick={onToggleAgent}
        className={cn(
          'mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium transition-colors',
          isAgentOpen ? 'text-[#00D4FF]' : 'text-[#5A6A8A] hover:text-[#00D4FF]'
        )}
      >
        <span aria-hidden="true">✦</span>
        {isAgentOpen ? 'Hide agent' : 'Ask the agent about this'}
      </button>

      {isAgentOpen && (
        <InlineAgentPanel
          messages={agentMessages}
          isThinking={isAgentThinking}
          onSend={onSendToAgent}
        />
      )}
    </div>
  )
}
