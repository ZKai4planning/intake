import { getSupabaseAdmin } from '../supabaseAdmin'
import { ApiError } from '../apiError'
import { decryptEmail } from '../emailCrypto'

export interface AdminCartItemRow {
  userId:    string
  userName:  string | null
  userEmail: string | null
  reportId:  string
  tier:      string
  label:     string
  priceGBP:  number
  addedAt:   string
}

interface DbCartItem {
  user_id: string; report_id: string; tier: string; label: string; price_gbp: number; added_at: string
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

function toAdminRow(row: DbCartItem): AdminCartItemRow {
  const owner = Array.isArray(row.users) ? row.users[0] : row.users
  return {
    userId: row.user_id,
    userName: owner?.name ?? null,
    userEmail: safeDecryptEmail(owner?.email),
    reportId: row.report_id,
    tier: row.tier,
    label: row.label,
    priceGBP: row.price_gbp,
    addedAt: row.added_at,
  }
}

export interface ListCartItemsParams {
  page?:  number
  limit?: number
}

/**
 * Read-only by design — there's no legitimate admin reason to edit
 * someone's cart contents directly; this exists purely for visibility.
 * Every row here is, by definition, an incomplete checkout journey —
 * something was added to a cart and never turned into an order — so
 * this whole table doubles as the abandoned-cart follow-up list.
 */
export async function listCartItems(params: ListCartItemsParams): Promise<{ items: AdminCartItemRow[]; total: number }> {
  const supabase = getSupabaseAdmin()
  const page = Math.max(params.page ?? 1, 1)
  const limit = Math.min(Math.max(params.limit ?? 25, 1), 100)
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('cart_items')
    .select('*, users(name, email)', { count: 'exact' })
    .order('added_at', { ascending: false })
    .range(from, to)
  if (error) throw new ApiError(500, 'Failed to load cart items', 'cart_items_list_failed')
  return { items: (data as DbCartItem[]).map(toAdminRow), total: count ?? 0 }
}
