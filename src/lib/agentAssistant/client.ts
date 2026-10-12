// import type { AgentAssistantSurface } from './actions'

// export interface PendingConfirmation {
//   tool: string
//   args: Record<string, string>
//   summary: string
// }

// export interface AgentAssistantReply {
//   reply: string
//   action?: { id: string; params: Record<string, string> }
//   pendingConfirmation?: PendingConfirmation
// }

// export interface AgentAssistantExecuteResult {
//   resultSummary: string
//   navigateTo?: string
// }

// async function callJson<T>(url: string, body: unknown): Promise<{ data: T | null; error: string | null }> {
//   try {
//     const res = await fetch(url, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(body),
//     })
//     const json = await res.json().catch(() => ({}))
//     if (!res.ok) return { data: null, error: json?.error ?? 'Something went wrong — please try again.' }
//     return { data: json as T, error: null }
//   } catch {
//     return { data: null, error: 'Could not reach the assistant — check your connection and try again.' }
//   }
// }

// /** Sends a message; the model may reply with plain text, a page to open (`action`), or a proposed mutation awaiting explicit confirmation (`pendingConfirmation`). */
// export function askAgentAssistant(input: {
//   query: string
//   history: { role: 'user' | 'assistant'; content: string }[]
//   surface: AgentAssistantSurface
//   context?: Record<string, string>
// }) {
//   return callJson<AgentAssistantReply>('/api/agent-assistant/ask', input)
// }

// /** Only called after the person explicitly clicks Confirm on a pendingConfirmation — this is the one call that actually performs the mutation. */
// export function executeAgentAssistantAction(input: {
//   surface: AgentAssistantSurface
//   tool: string
//   args: Record<string, string>
// }) {
//   return callJson<AgentAssistantExecuteResult>('/api/agent-assistant/execute', input)
// }


import type { AgentAssistantSurface } from './actions'

export interface PendingConfirmation {
  tool: string
  args: Record<string, string>
  summary: string
}

export interface AgentAssistantReply {
  reply: string
  action?: { id: string; params: Record<string, string> }
  pendingConfirmation?: PendingConfirmation
}

export interface AgentAssistantExecuteResult {
  resultSummary: string
  navigateTo?: string
}

async function callJson<T>(url: string, body: unknown): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Every other client wrapper in this app (api.ts, adminApi.ts,
      // agentxApi.ts) sets this explicitly rather than relying on the
      // fetch spec's same-origin default — without it, the httpOnly
      // accessToken/adminToken/agentToken cookie doesn't reliably reach
      // this route in every deployment setup, and requireAuth()/
      // requireAdminAuth()/requireAgentAuth() fail with "No access
      // token provided" even though the person is genuinely logged in.
      credentials: 'include',
      body: JSON.stringify(body),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return { data: null, error: json?.error ?? 'Something went wrong — please try again.' }
    return { data: json as T, error: null }
  } catch {
    return { data: null, error: 'Could not reach the assistant — check your connection and try again.' }
  }
}

/** Sends a message; the model may reply with plain text, a page to open (`action`), or a proposed mutation awaiting explicit confirmation (`pendingConfirmation`). */
export function askAgentAssistant(input: {
  query: string
  history: { role: 'user' | 'assistant'; content: string }[]
  surface: AgentAssistantSurface
  context?: Record<string, string>
}) {
  return callJson<AgentAssistantReply>('/api/agent-assistant/ask', input)
}

/** Only called after the person explicitly clicks Confirm on a pendingConfirmation — this is the one call that actually performs the mutation. */
export function executeAgentAssistantAction(input: {
  surface: AgentAssistantSurface
  tool: string
  args: Record<string, string>
}) {
  return callJson<AgentAssistantExecuteResult>('/api/agent-assistant/execute', input)
}