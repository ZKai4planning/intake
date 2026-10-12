'use client'

import { useState, useCallback } from 'react'
import { getOpeningTip, getReply } from '@/lib/agent/agentResponses'
import type { AgentContext, AgentMessage, AgentThreadMap } from '@/types/agent'

/**
 * useInlineAgent
 * ────────────────
 * Manages the inline agent that lives inside the IntakeForm — one message
 * thread per question row, plus which row (if any) currently has its panel
 * open. Only one panel is open at a time so the form doesn't get cluttered.
 *
 * Opening a row's panel for the first time seeds it with a proactive
 * opening tip (getOpeningTip) so the agent feels like part of the form,
 * not an empty chat box waiting for input.
 */
export function useInlineAgent() {
  const [openRowId, setOpenRowId] = useState<string | null>(null)
  const [threads, setThreads] = useState<AgentThreadMap>({})
  const [isThinking, setIsThinking] = useState(false)

  const toggleRow = useCallback((context: AgentContext) => {
    setOpenRowId(prev => {
      const next = prev === context.rowId ? null : context.rowId
      return next
    })

    setThreads(prev => {
      if (prev[context.rowId]?.length) return prev
      const opening: AgentMessage = {
        id: `${context.rowId}-open`,
        role: 'agent',
        content: getOpeningTip(context),
        timestamp: Date.now(),
      }
      return { ...prev, [context.rowId]: [opening] }
    })
  }, [])

  const closePanel = useCallback(() => setOpenRowId(null), [])

  const sendMessage = useCallback((context: AgentContext, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const userMessage: AgentMessage = {
      id: `${context.rowId}-${Date.now()}-u`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    }

    setThreads(prev => ({
      ...prev,
      [context.rowId]: [...(prev[context.rowId] ?? []), userMessage],
    }))

    setIsThinking(true)

    // Mock latency so the reply doesn't feel instant/canned.
    // API swap point: replace with the real await fetch('/api/agent/ask', …)
    // call described in lib/agent/agentResponses.ts, then push its reply here.
    window.setTimeout(() => {
      const agentMessage: AgentMessage = {
        id: `${context.rowId}-${Date.now()}-a`,
        role: 'agent',
        content: getReply(context, trimmed),
        timestamp: Date.now(),
      }
      setThreads(prev => ({
        ...prev,
        [context.rowId]: [...(prev[context.rowId] ?? []), agentMessage],
      }))
      setIsThinking(false)
    }, 500)
  }, [])

  return {
    openRowId,
    threads,
    isThinking,
    toggleRow,
    closePanel,
    sendMessage,
  }
}
