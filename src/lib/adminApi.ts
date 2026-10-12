/**
 * adminApi.ts
 * ────────────
 * Typed fetch wrapper for the admin portal (/api/admin/*). Kept
 * entirely separate from lib/api.ts on purpose — the admin portal has
 * its own cookie (adminAccessToken) and its own login, so mixing it
 * into the customer-facing api.ts would blur what's actually two
 * independent auth domains sharing one Next.js app.
 */

const BASE = '/api/admin'

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
      return {
        data:  null,
        error: json?.message ?? json?.error ?? `Request failed (${res.status})`,
        code:  json?.error ?? null,
      }
    }

    return { data: json as T, error: null, code: null }
  } catch (err) {
    return {
      data:  null,
      error: err instanceof Error ? err.message : 'Network error',
      code:  null,
    }
  }
}

// ── Types ────────────────────────────────────────────────────────

export interface AdminProfile {
  id:    string
  email: string
  name:  string
}

export interface AdminUserRow {
  id: string; name: string; email: string; role: string; mfaEnabled: boolean
  avatarUrl: string | null; actorId?: string; phone?: string; createdAt: string
}

export interface AdminOrderRow {
  id: string; userId: string | null; userName: string | null; userEmail: string | null
  revolutOrderId: string; merchantOrderRef: string
  amount: number; currency: string; status: string; description: string | null
  reportId: string | null; projectId: string | null; createdAt: string; updatedAt: string
  needsFollowUp: boolean
}

export interface AdminBookingRow {
  id: string; userId: string; projectId: string | null; type: string; date: string | null
  timeSlot: string; notes: string | null; priceGBP: number; status: string; bookedAt: string
}

export interface AdminReportRow {
  id: string; userId: string | null; tier: string; ownerName: string | null; ownerEmail: string | null
  unlockedAt: string | null; createdAt: string; needsFollowUp: boolean
}

export interface AdminReportDetail extends AdminReportRow {
  answers: unknown
  content: unknown
}

export interface AdminCartItemRow {
  userId: string; userName: string | null; userEmail: string | null
  reportId: string; tier: string; label: string; priceGBP: number; addedAt: string
}

export interface AdminDashboardStats {
  usersCount: number; ordersCount: number; completedOrdersCount: number; totalRevenueGBP: number
  bookingsCount: number; confirmedBookingsCount: number; reportsCount: number; cartItemsCount: number
  incompleteOrdersCount: number; reportsNeedingFollowUpCount: number
}

export interface AdminAgentRow {
  id: string; name: string; email: string; mustResetPassword: boolean; createdAt: string
}

type PagedUsers    = { users: AdminUserRow[]; total: number }
type PagedOrders   = { orders: AdminOrderRow[]; total: number }
type PagedBookings = { bookings: AdminBookingRow[]; total: number }
type PagedReports  = { reports: AdminReportRow[]; total: number }
type PagedCartItems = { items: AdminCartItemRow[]; total: number }

// ── Auth ─────────────────────────────────────────────────────────

export function adminLogin(email: string, password: string) {
  return request<{ success: boolean; admin: AdminProfile }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function adminLogout() {
  return request<{ success: boolean }>('/logout', { method: 'POST' })
}

export function getAdminMe() {
  return request<{ admin: AdminProfile }>('/me')
}

// ── Dashboard ────────────────────────────────────────────────────

export function getAdminDashboardStats() {
  return request<AdminDashboardStats>('/dashboard')
}

// ── Users ────────────────────────────────────────────────────────

export function listAdminUsers(params: { search?: string; page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams()
  if (params.search) qs.set('search', params.search)
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))
  const query = qs.toString()
  return request<PagedUsers>(`/users${query ? `?${query}` : ''}`)
}

export function getAdminUser(id: string) {
  return request<{ user: AdminUserRow }>(`/users/${encodeURIComponent(id)}`)
}

export function updateAdminUser(id: string, patch: { name?: string; role?: string; phone?: string }) {
  return request<{ user: AdminUserRow }>(`/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function deleteAdminUser(id: string) {
  return request<null>(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// ── Orders ───────────────────────────────────────────────────────

export function listAdminOrders(params: { status?: string | 'INCOMPLETE'; userId?: string; page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams()
  if (params.status) qs.set('status', params.status)
  if (params.userId) qs.set('userId', params.userId)
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))
  const query = qs.toString()
  return request<PagedOrders>(`/orders${query ? `?${query}` : ''}`)
}

export function getAdminOrder(id: string) {
  return request<{ order: AdminOrderRow }>(`/orders/${encodeURIComponent(id)}`)
}

// ── Bookings ─────────────────────────────────────────────────────

export function listAdminBookings(params: { status?: string; page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams()
  if (params.status) qs.set('status', params.status)
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))
  const query = qs.toString()
  return request<PagedBookings>(`/bookings${query ? `?${query}` : ''}`)
}

export function updateAdminBookingStatus(id: string, status: 'confirmed' | 'cancelled' | 'completed') {
  return request<{ booking: AdminBookingRow }>(`/bookings/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

// ── Reports ──────────────────────────────────────────────────────

export function listAdminReports(params: { tier?: string; userId?: string; status?: 'incomplete'; page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams()
  if (params.tier) qs.set('tier', params.tier)
  if (params.userId) qs.set('userId', params.userId)
  if (params.status) qs.set('status', params.status)
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))
  const query = qs.toString()
  return request<PagedReports>(`/reports${query ? `?${query}` : ''}`)
}

export function getAdminReport(id: string) {
  return request<{ report: AdminReportDetail }>(`/reports/${encodeURIComponent(id)}`)
}

// ── Cart ─────────────────────────────────────────────────────────

export function listAdminCartItems(params: { page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.limit) qs.set('limit', String(params.limit))
  const query = qs.toString()
  return request<PagedCartItems>(`/cart-items${query ? `?${query}` : ''}`)
}

// ── Agents (agentx accounts) ────────────────────────────────────────

export function listAdminAgents() {
  return request<{ agents: AdminAgentRow[] }>('/agents')
}

export function createAdminAgent(input: { name: string; email: string }) {
  return request<{ agent: AdminAgentRow }>('/agents', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function resendAdminAgentInvite(id: string) {
  return request<{ agent: AdminAgentRow }>(`/agents/${encodeURIComponent(id)}/resend-invite`, {
    method: 'POST',
  })
}

export function deleteAdminAgent(id: string) {
  return request<{ success: boolean }>(`/agents/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
