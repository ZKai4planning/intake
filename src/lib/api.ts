/**
 * api.ts
 * ───────
 * Typed fetch wrapper for every auth endpoint.
 * All functions are async and return { data, error, code }.
 *
 * The backend now lives in this same app (src/app/api/auth/*, backed
 * by Supabase), so this always calls same-origin '/api' — no separate
 * server, no NEXT_PUBLIC_API_URL, no rewrites needed in next.config.js.
 */

const BASE = '/api'

// ── Generic fetch helper ──────────────────────────────────────────
// `code` is the backend's stable error code (e.g. 'user_not_found',
// 'user_exists' — see ApiError.ts / errorHandler.ts on the backend).
// It's distinct from `error`, which is the human-readable message —
// callers that need to branch on *why* a request failed (like the
// login page auto-detecting signup vs. login) should check `code`,
// not parse the message string.
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

// ── Auth endpoints ────────────────────────────────────────────────

import type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  UserProfile,
  UpdateMeRequest,
} from '@/types/auth'
import type { CartResponse, AddToCartRequest, CartItem } from '@/types/cart'
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderStatusResponse,
  PaymentsConfigResponse,
} from '@/types/payments'
import type { ClassifyRequest, ClassifyResponse, Goal } from '@/types/search'
import type { WorkspaceMeResponse } from '@/types/workspaceMe'
import type { AvailabilityResponse, BookConsultationRequest, BookConsultationResponse } from '@/types/consultant'

/**
 * POST /api/auth/send-otp
 * Sends a 6-digit OTP to the given email — the server decides whether
 * this is a login or a signup by checking if the account exists, and
 * returns which one it picked as `intent` in the response. Just pass
 * the email; no `intent` to send.
 */
export function sendOtp(body: SendOtpRequest) {
  return request<SendOtpResponse>('/auth/send-otp', {
    method: 'POST',
    body:   JSON.stringify(body),
  })
}

/**
 * POST /api/auth/verify-otp
 * Verifies the 6-digit code and returns a JWT + user object.
 */
export function verifyOtp(body: VerifyOtpRequest) {
  return request<VerifyOtpResponse>('/auth/verify-otp', {
    method: 'POST',
    body:   JSON.stringify(body),
  })
}

/**
 * POST /api/auth/forgot-password
 * Sends a password-reset OTP to the email.
 */
export function forgotPassword(body: ForgotPasswordRequest) {
  return request<ForgotPasswordResponse>('/auth/forgot-password', {
    method: 'POST',
    body:   JSON.stringify(body),
  })
}

/**
 * POST /api/auth/reset-password
 * Resets password using the OTP code received via email.
 */
export function resetPassword(body: ResetPasswordRequest) {
  return request<{ success: boolean }>('/auth/reset-password', {
    method: 'POST',
    body:   JSON.stringify(body),
  })
}

/**
 * POST /api/auth/logout
 * Invalidates the session server-side.
 */
export function logout() {
  return request<{ success: boolean }>('/auth/logout', { method: 'POST' })
}

// ── Profile ───────────────────────────────────────────────────────
// All three require the accessToken cookie set by verifyOtp — a
// logged-out call to any of these comes back as a 401.

/**
 * GET /api/auth/me
 * Fetches the current user's profile.
 */
export function getMe() {
  return request<UserProfile>('/auth/me')
}

/**
 * PATCH /api/auth/me
 * Updates whichever fields are passed — omitted fields are left as-is,
 * they aren't cleared.
 */
export function updateMe(patch: UpdateMeRequest) {
  return request<UserProfile>('/auth/me', {
    method: 'PATCH',
    body:   JSON.stringify(patch),
  })
}

/**
 * DELETE /api/auth/me
 * Permanently deletes the account and clears the session cookie.
 */
export function deleteMe() {
  return request<{ success: boolean }>('/auth/me', { method: 'DELETE' })
}

/**
 * POST /api/uploads/avatar
 * Uploads a resized/compressed base64 image (see resizeImageFile in
 * the profile page) to Cloudinary and persists the resulting URL to
 * the profile in one call — returns the updated profile, same shape
 * as getMe()/updateMe().
 */
export function uploadAvatar(imageDataUrl: string) {
  return request<UserProfile>('/uploads/avatar', {
    method: 'POST',
    body:   JSON.stringify({ image: imageDataUrl }),
  })
}

// ── Cart ─────────────────────────────────────────────────────────
// All require the accessToken cookie — a logged-out call comes back 401.
// Price/label are looked up server-side from the report's tier, never
// trusted from the client. Adding a report requires it to already
// exist in the `reports` table — see the note in cartService.ts;
// nothing in this app currently creates report rows yet.

/**
 * GET /api/cart
 */
export function getCart() {
  return request<CartResponse>('/cart')
}

/**
 * POST /api/cart
 */
export function addToCart(body: AddToCartRequest) {
  return request<{ item: CartItem }>('/cart', {
    method: 'POST',
    body:   JSON.stringify(body),
  })
}

/**
 * DELETE /api/cart/:reportId
 */
export function removeFromCart(reportId: string) {
  return request<null>(`/cart/${encodeURIComponent(reportId)}`, { method: 'DELETE' })
}

// ── Payments (Revolut) ──────────────────────────────────────────
// create-order/create-embedded-order work logged-out too (guest
// checkout) — the accessToken cookie just also ties the order to an
// account if present.

/**
 * POST /api/payments/create-order
 * Hosted-checkout redirect flow — use `data.checkoutUrl`.
 */
export function createOrder(body: CreateOrderRequest) {
  return request<CreateOrderResponse>('/payments/create-order', {
    method: 'POST',
    body:   JSON.stringify(body),
  })
}

/**
 * POST /api/payments/create-embedded-order
 * Same order creation, but for the embedded Revolut widget — use `data.publicId` (token).
 */
export function createEmbeddedOrder(body: CreateOrderRequest) {
  return request<CreateOrderResponse>('/payments/create-embedded-order', {
    method: 'POST',
    body:   JSON.stringify(body),
  })
}

/**
 * GET /api/payments/order/:orderId
 * Polling backup for a missed/delayed webhook — re-checks live status with Revolut.
 */
export function getOrderStatus(orderId: string) {
  return request<OrderStatusResponse>(`/payments/order/${encodeURIComponent(orderId)}`)
}

/**
 * GET /api/payments/config
 * Public — currency/merchant name/sandbox-vs-prod for the checkout widget.
 */
export function getPaymentsConfig() {
  return request<PaymentsConfigResponse>('/payments/config')
}

// ── Search ───────────────────────────────────────────────────────
// Both public — no auth needed. Stateless: pure text classification,
// no database involved.

/**
 * POST /api/search/classify
 * Classifies free-text search into a goal + (optionally) an actor.
 */
export function classifySearch(body: ClassifyRequest) {
  return request<ClassifyResponse>('/search/classify', {
    method: 'POST',
    body:   JSON.stringify(body),
  })
}

/**
 * GET /api/goals
 * The full goal catalogue shown on the homepage.
 */
export function getGoals() {
  return request<Goal[]>('/goals')
}

// ── Workspace ────────────────────────────────────────────────────

/**
 * GET /api/workspace/me
 * Session + usage stats (projects/reports/bookings counts, total
 * spent) for dashboard widgets — richer than getMe(), which only
 * returns the profile itself.
 */
export function getWorkspaceMe() {
  return request<WorkspaceMeResponse>('/workspace/me')
}

// ── Consultant ───────────────────────────────────────────────────

/**
 * GET /api/consultant/availability
 * Public — no auth needed to view slots, only to book one.
 */
export function getConsultantAvailability(days?: number) {
  const query = days ? `?days=${days}` : ''
  return request<AvailabilityResponse>(`/consultant/availability${query}`)
}

/**
 * POST /api/consultant/book
 */
export function bookConsultation(body: BookConsultationRequest) {
  return request<BookConsultationResponse>('/consultant/book', {
    method: 'POST',
    body:   JSON.stringify(body),
  })
}

// ── Projects ─────────────────────────────────────────────────────
// Backend counterpart to lib/projects.ts's localStorage store. All
// require the accessToken cookie — a logged-out call comes back 401.
// The Project shape itself is still owned/validated client-side (see
// projectsService.ts's `data` blob note), so these are typed loosely.

/** GET /api/projects — every project belonging to the current user. */
export function listProjectsRemote() {
  return request<{ projects: Record<string, unknown>[] }>('/projects')
}

/** POST /api/projects — full upsert, keyed on the project's own id. */
export function upsertProjectRemote(project: Record<string, unknown>) {
  return request<{ project: Record<string, unknown> }>('/projects', {
    method: 'POST',
    body:   JSON.stringify(project),
  })
}

/** DELETE /api/projects/:id */
export function deleteProjectRemote(id: string) {
  return request<{ success: boolean }>(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

// ── Reports ──────────────────────────────────────────────────────
// Backend counterpart to lib/reportStorage.ts's localStorage store.
// Creation and single-report lookup work logged-out too (reports
// generate for free, no login required) — listing/claiming require
// the accessToken cookie.

/** POST /api/reports — works anonymously; auto-tied to the account if logged in. */
export function createReportRemote(body: { id: string; tier: string; answers: unknown; content: unknown }) {
  return request<{ report: Record<string, unknown> }>('/reports', {
    method: 'POST',
    body:   JSON.stringify(body),
  })
}

/** GET /api/reports — reports belonging to the current user. */
export function listMyReportsRemote() {
  return request<{ reports: Record<string, unknown>[] }>('/reports')
}

/** POST /api/reports/claim — attaches any of these (still-unclaimed) ids to the current account. */
export function claimReportsRemote(ids: string[]) {
  return request<{ reports: Record<string, unknown>[] }>('/reports/claim', {
    method: 'POST',
    body:   JSON.stringify({ ids }),
  })
}

/** PATCH /api/reports/:id — marks it unlocked after the (mock) checkout succeeds. */
export function unlockReportRemote(id: string) {
  return request<{ report: Record<string, unknown> }>(`/reports/${encodeURIComponent(id)}`, { method: 'PATCH' })
}
