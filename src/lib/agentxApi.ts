/**
 * agentxApi.ts
 * ─────────────
 * Typed fetch wrapper for the agentx portal (/api/agentx/*). Separate
 * from lib/api.ts (customer) and lib/adminApi.ts (admin) — three
 * independent auth domains sharing one Next.js app, each with its own
 * cookie and login.
 */

const BASE = '/api/agentx'

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; code: string | null }> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      credentials: 'include',
      ...options,
    })

    const json = await res.json().catch(() => ({}))

    if (!res.ok) {
      return { data: null, error: json?.message ?? json?.error ?? `Request failed (${res.status})`, code: json?.error ?? null }
    }
    return { data: json as T, error: null, code: null }
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Network error', code: null }
  }
}

// ── Types ────────────────────────────────────────────────────────

export interface AgentProfile {
  id: string; email: string; name: string; mustResetPassword: boolean
}

export interface AgentUserRow {
  id: string; name: string; email: string; role: string; mfaEnabled: boolean
  avatarUrl: string | null; actorId?: string; phone?: string; createdAt: string
}

export interface QuestionAnswer {
  rowId: string
  value: string | string[] | null
  flaggedForUpsell?: boolean
}

export interface AgentProject {
  id: string; userId: string; actorId: string; tier: string; title: string
  status: 'draft' | 'submitted'
  answeredCount: number; totalCount: number
  answers: Record<string, QuestionAnswer>
  createdAt: string; updatedAt: string; submittedAt?: string
  ownerEmail?: string; ownerName?: string
}

// ── Auth ─────────────────────────────────────────────────────────

export function agentLogin(email: string, password: string) {
  return request<{ success: boolean; agent: AgentProfile }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function agentLogout() {
  return request<{ success: boolean }>('/logout', { method: 'POST' })
}

export function getAgentMe() {
  return request<{ agent: AgentProfile }>('/me')
}

/** Sets a new password and clears mustResetPassword. Requires the current password (temp or otherwise) even though the agent is already authenticated via cookie. */
export function changeAgentPassword(currentPassword: string, newPassword: string) {
  return request<{ success: boolean; agent: AgentProfile }>('/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

// ── Users ────────────────────────────────────────────────────────

export function listAgentUsers(params: { search?: string; page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams()
  if (params.search) qs.set('search', params.search)
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))
  const query = qs.toString()
  return request<{ users: AgentUserRow[]; total: number }>(`/users${query ? `?${query}` : ''}`)
}

export function getAgentUserWithProjects(userId: string) {
  return request<{ user: AgentUserRow; projects: AgentProject[] }>(`/users/${encodeURIComponent(userId)}`)
}

// ── Projects (the eligibility form) ─────────────────────────────

export function listAgentProjectsForUser(userId: string) {
  return request<{ projects: AgentProject[] }>(`/projects?userId=${encodeURIComponent(userId)}`)
}

export interface SaveAgentDraftInput {
  userId:  string
  id:      string
  actorId: string
  tier:    string
  answers: Record<string, QuestionAnswer>
}

/** Autosave on behalf of a user — same endpoint handles both "create" (new id) and "update" (existing id). */
export function saveAgentDraft(input: SaveAgentDraftInput) {
  return request<{ project: AgentProject }>('/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getAgentProject(id: string) {
  return request<{ project: AgentProject }>(`/projects/${encodeURIComponent(id)}`)
}

export function deleteAgentProject(id: string) {
  return request<null>(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

/** Promotes a draft to submitted without needing the full answers payload again — same shortcut the customer-facing app uses. */
export function submitAgentProject(id: string) {
  return request<{ project: AgentProject }>(`/projects/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'submitted' }),
  })
}
