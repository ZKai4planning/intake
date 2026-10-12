'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { ensureConversation, appendMessage, generateAgentReply, type AgentMessage } from '@/lib/agentZ'

interface AgentZContextValue {
  isOpen: boolean
  messages: AgentMessage[]
  isTyping: boolean
  /** Opens the panel and, if given, sends a contextual opening message as if the person asked it. */
  openAgent: (opts: { fieldLabel?: string; openingMessage?: string }) => void
  closeAgent: () => void
  sendMessage: (text: string) => void
}

const AgentZContext = createContext<AgentZContextValue | null>(null)

/**
 * AgentZProvider
 * ─────────────────
 * Wraps the eligibility wizard so any field (AgentActionButton, a
 * consultTrigger note, a missing-upload prompt) can open the same
 * floating conversation via useAgentZ(), regardless of how deep it's
 * nested. One conversation per project, persisted — see lib/agentZ.ts.
 */
export function AgentZProvider({ projectId, children }: { projectId: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    setMessages(ensureConversation(projectId).messages)
  }, [projectId])

  const askAndReply = useCallback(
    async (userText: string, fieldLabel?: string) => {
      const afterUser = appendMessage(projectId, { role: 'user', text: userText, fieldLabel })
      setMessages(afterUser.messages)
      setIsTyping(true)
      try {
        const reply = await generateAgentReply({ fieldLabel, userMessage: userText })
        const afterReply = appendMessage(projectId, { role: 'agent', text: reply, fieldLabel })
        setMessages(afterReply.messages)
      } finally {
        setIsTyping(false)
      }
    },
    [projectId]
  )

  const openAgent: AgentZContextValue['openAgent'] = useCallback(
    ({ fieldLabel, openingMessage }) => {
      setIsOpen(true)
      if (openingMessage) void askAndReply(openingMessage, fieldLabel)
    },
    [askAndReply]
  )

  const closeAgent = useCallback(() => setIsOpen(false), [])

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return
      void askAndReply(text.trim())
    },
    [askAndReply]
  )

  return (
    <AgentZContext.Provider value={{ isOpen, messages, isTyping, openAgent, closeAgent, sendMessage }}>
      {children}
    </AgentZContext.Provider>
  )
}

export function useAgentZ(): AgentZContextValue {
  const ctx = useContext(AgentZContext)
  if (!ctx) {
    throw new Error('useAgentZ must be used within <AgentZProvider>')
  }
  return ctx
}
