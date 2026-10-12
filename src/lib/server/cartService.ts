import { getSupabaseAdmin } from './supabaseAdmin'
import { ApiError } from './apiError'
import { priceForTier, type ReportTierId } from './reportTierCatalogue'

export interface CartItem {
  reportId: string
  tier:     ReportTierId
  label:    string
  priceGBP: number
  addedAt:  string
}

interface DbCartItem {
  report_id: string
  tier:      string
  label:     string
  price_gbp: number
  added_at:  string
}

function toApiItem(row: DbCartItem): CartItem {
  return {
    reportId: row.report_id,
    tier:     row.tier as ReportTierId,
    label:    row.label,
    priceGBP: row.price_gbp,
    addedAt:  row.added_at,
  }
}

export async function getCart(userId: string): Promise<CartItem[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('cart_items')
    .select('report_id, tier, label, price_gbp, added_at')
    .eq('user_id', userId)
    .order('added_at', { ascending: true })

  if (error) throw new ApiError(500, 'Failed to load your cart', 'cart_lookup_failed')
  return (data as DbCartItem[]).map(toApiItem)
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceGBP, 0)
}

/**
 * Price and label are looked up server-side from the report's tier —
 * never trust a client-supplied price. Requires the report to already
 * exist (see the note on the `reports` table in
 * cart_payments_schema.sql — nothing currently inserts report rows,
 * since the report-generation module hasn't been ported yet).
 */
export async function addToCart(userId: string, reportId: string): Promise<CartItem> {
  const supabase = getSupabaseAdmin()

  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('id, user_id, tier')
    .eq('id', reportId)
    .maybeSingle()
  if (reportError) throw new ApiError(500, 'Failed to look up that report', 'report_lookup_failed')
  if (!report) throw ApiError.notFound('Report not found')
  if (report.user_id && report.user_id !== userId) {
    throw ApiError.forbidden('This report belongs to a different account')
  }

  const { name, priceGBP } = priceForTier(report.tier as ReportTierId)

  const { data: row, error: upsertError } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: userId, report_id: reportId, tier: report.tier, label: name, price_gbp: priceGBP },
      { onConflict: 'user_id,report_id' }
    )
    .select('report_id, tier, label, price_gbp, added_at')
    .single()
  if (upsertError || !row) throw new ApiError(500, 'Failed to add that to your cart', 'cart_add_failed')

  return toApiItem(row as DbCartItem)
}

export async function removeFromCart(userId: string, reportId: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId).eq('report_id', reportId)
  if (error) throw new ApiError(500, 'Failed to remove that from your cart', 'cart_remove_failed')
}
