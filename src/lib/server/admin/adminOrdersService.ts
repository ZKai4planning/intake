import { getSupabaseAdmin } from '../supabaseAdmin'
import { ApiError } from '../apiError'
import { decryptEmail } from '../emailCrypto'

export interface AdminOrderRow {
  id:                string
  userId:            string | null
  userName:          string | null
  userEmail:         string | null
  revolutOrderId:    string
  merchantOrderRef:  string
  amount:            number
  currency:          string
  status:            string
  description:       string | null
  reportId:          string | null
  projectId:         string | null
  createdAt:         string
  updatedAt:         string
  /** PENDING or FAILED — a checkout that started but never completed, worth following up on. */
  needsFollowUp:     boolean
}

interface DbOrder {
  id: string; user_id: string | null; revolut_order_id: string; merchant_order_ref: string
  amount: number; currency: string; status: string; description: string | null
  report_id: string | null; project_id: string | null; created_at: string; updated_at: string
  // Embedded via the users_1 FK — Supabase returns this as an object when the relationship is unambiguous, else an array; both are handled below.
  users?: { name: string | null; email: string | null } | { name: string | null; email: string | null }[] | null
}

function safeDecryptEmail(encrypted: string | null | undefined): string | null {
  if (!encrypted) return null
  try {
    return decryptEmail(encrypted)
  } catch {
    return '(unable to decrypt)'
  }
}

const INCOMPLETE_STATUSES = ['PENDING', 'FAILED']

function toAdminRow(row: DbOrder): AdminOrderRow {
  const owner = Array.isArray(row.users) ? row.users[0] : row.users
  return {
    id: row.id,
    userId: row.user_id,
    userName: owner?.name ?? null,
    userEmail: safeDecryptEmail(owner?.email),
    revolutOrderId: row.revolut_order_id,
    merchantOrderRef: row.merchant_order_ref,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    description: row.description,
    reportId: row.report_id,
    projectId: row.project_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    needsFollowUp: INCOMPLETE_STATUSES.includes(row.status),
  }
}

export interface ListOrdersParams {
  /** Exact Revolut status, e.g. 'COMPLETED'. Mutually exclusive with `status: 'incomplete'` below — pass one or the other. */
  status?: string
  /** Convenience filter: PENDING or FAILED orders — checkouts that started but never finished. */
  incompleteOnly?: boolean
  userId?: string
  page?:   number
  limit?:  number
}

/**
 * No manual status edits exposed here — order status is a reflection
 * of what Revolut says happened (via the webhook, or the polling
 * fallback in paymentsService.getOrderStatus), not something an admin
 * should be able to just declare true. If a payment genuinely needs
 * manual correction, that's a job for Revolut's own dashboard plus a
 * deliberate one-off DB fix, not a button here that could silently
 * mark something COMPLETED that was never actually paid.
 */
export async function listOrders(params: ListOrdersParams): Promise<{ orders: AdminOrderRow[]; total: number }> {
  const supabase = getSupabaseAdmin()
  const page = Math.max(params.page ?? 1, 1)
  const limit = Math.min(Math.max(params.limit ?? 25, 1), 100)
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('orders')
    .select('*, users(name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)
  if (params.incompleteOnly) query = query.in('status', INCOMPLETE_STATUSES)
  else if (params.status) query = query.eq('status', params.status.toUpperCase())
  if (params.userId) query = query.eq('user_id', params.userId)

  const { data, error, count } = await query
  if (error) throw new ApiError(500, 'Failed to load orders', 'orders_list_failed')
  return { orders: (data as DbOrder[]).map(toAdminRow), total: count ?? 0 }
}

export async function getOrder(id: string): Promise<AdminOrderRow> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('orders').select('*, users(name, email)').eq('id', id).maybeSingle()
  if (error) throw new ApiError(500, 'Failed to load order', 'order_lookup_failed')
  if (!data) throw ApiError.notFound('Order not found')
  return toAdminRow(data as DbOrder)
}
