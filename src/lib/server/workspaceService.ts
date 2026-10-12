import { getSupabaseAdmin } from './supabaseAdmin'
import { ApiError } from './apiError'
import { decryptEmail } from './emailCrypto'

export interface WorkspaceSession {
  email:       string
  name:        string
  accessToken: string
  mfaEnabled:  boolean
  role:        string
  actorId?:    string
  phone?:      string
}

export interface WorkspaceUsage {
  projectsCount:           number
  submittedProjectsCount:  number
  reportsCount:            number
  consultantBookingsCount: number
  totalSpentGBP:           number
}

export interface WorkspaceMeResponse {
  session: WorkspaceSession
  usage:   WorkspaceUsage
}

/**
 * The actual value-add of this endpoint over plain GET /api/auth/me —
 * usage stats for dashboard widgets. `accessToken` is echoed back as
 * given (this endpoint doesn't mint a new one, it's just needed to
 * fill WorkspaceSession.accessToken for frontend parity with
 * useWorkspace's SessionData).
 *
 * NOTE on response shape: send the object directly, NOT wrapped in
 * `{ data: ... }` — the frontend's getWorkspaceMe() types this
 * response straight as WorkspaceMeResponse and reads `.session`/
 * `.usage` off it directly. This was a real bug in the backend this
 * was ported from (documented in its workspace.routes.ts) — wrapping
 * the payload meant `data.session` was always undefined and crashed
 * every dashboard page. Fixed by construction here: the route handler
 * just does `NextResponse.json(result)`, no wrapper.
 */
export async function getWorkspaceMe(userId: string, accessToken: string): Promise<WorkspaceMeResponse> {
  const supabase = getSupabaseAdmin()

  const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', userId).maybeSingle()
  if (userError) throw new ApiError(500, 'Failed to look up your account', 'user_lookup_failed')
  if (!user) throw ApiError.notFound('User not found')

  const [projectsCountRes, submittedProjectsCountRes, reportsCountRes, bookingsCountRes, ordersRes] = await Promise.all([
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'submitted'),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'confirmed'),
    supabase.from('orders').select('amount, currency').eq('user_id', userId).eq('status', 'COMPLETED'),
  ])

  // Sums minor units of GBP orders only — a multi-currency total would
  // need actual FX conversion, which isn't something to fake here.
  const completedOrders = (ordersRes.data ?? []) as { amount: number; currency: string }[]
  const totalSpentGBP = completedOrders
    .filter(o => o.currency === 'GBP')
    .reduce((sum, o) => sum + o.amount, 0) / 100

  return {
    session: {
      email:       decryptEmail(user.email),
      name:        user.name,
      accessToken,
      mfaEnabled:  user.mfa_enabled,
      role:        user.role,
      actorId:     user.actor_id ?? undefined,
      phone:       user.phone ?? undefined,
    },
    usage: {
      projectsCount:           projectsCountRes.count ?? 0,
      submittedProjectsCount:  submittedProjectsCountRes.count ?? 0,
      reportsCount:            reportsCountRes.count ?? 0,
      consultantBookingsCount: bookingsCountRes.count ?? 0,
      totalSpentGBP,
    },
  }
}
