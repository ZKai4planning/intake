/**
 * agent.ts
 * ─────────
 * The inline AI agent lives INSIDE the IntakeForm, anchored to whichever
 * question card it's opened from — never a separate chat window/modal.
 * Each question row gets its own message thread, keyed by rowId, so
 * "ask the agent" always has the right context (the field, its guidance,
 * and whatever the user has answered so far).
 */

export interface AgentMessage {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: number
}

/** Context handed to the response engine so replies stay anchored to the row. */
export interface AgentContext {
  rowId: string
  field: string
  guidance: string
  currentValue: string | string[] | File[] | null
}

/** Per-row message threads, keyed by QuestionRow.rowId. */
export type AgentThreadMap = Record<string, AgentMessage[]>
