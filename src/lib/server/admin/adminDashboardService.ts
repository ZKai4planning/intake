import { getSupabaseAdmin } from '../supabaseAdmin'
import { ApiError } from '../apiError'

export interface AdminDashboardStats {
  usersCount:          number
  ordersCount:         number
  completedOrdersCount: number
  totalRevenueGBP:     number // GBP-only, same reasoning as workspaceService's totalSpentGBP
  bookingsCount:       number
  confirmedBookingsCount: number
  reportsCount:        number
  cartItemsCount:      number
  /** PENDING/FAILED orders — checkouts that started but never finished. */
  incompleteOrdersCount: number
  /** Paid-tier reports (RPT-002/003) generated but never unlocked — stalled at the paywall. */
  reportsNeedingFollowUpCount: number
}

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = getSupabaseAdmin()

  const [users, orders, completedOrders, incompleteOrders, bookings, confirmedBookings, reports, cartItems, unlockedReportRows] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('amount, currency').eq('status', 'COMPLETED'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['PENDING', 'FAILED']),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
    supabase.from('reports').select('id', { count: 'exact', head: true }),
    supabase.from('cart_items').select('id', { count: 'exact', head: true }),
    // Only paid tiers (RPT-002/003) can be "unlocked" at all — free/consultant tiers never set unlocked_at,
    // so restricting to those two tier ids is what makes this a genuine stalled-checkout count rather than
    // counting every free report ever generated.
    supabase.from('reports').select('id', { count: 'exact', head: true }).is('unlocked_at', null).in('tier', ['RPT-002', 'RPT-003']),
  ])

  for (const [label, res] of Object.entries({ users, orders, incompleteOrders, bookings, confirmedBookings, reports, cartItems, unlockedReportRows })) {
    if (res.error) throw new ApiError(500, `Failed to load dashboard stats (${label})`, 'dashboard_stats_failed')
  }
  if (completedOrders.error) throw new ApiError(500, 'Failed to load dashboard stats (revenue)', 'dashboard_stats_failed')

  const revenueRows = (completedOrders.data ?? []) as { amount: number; currency: string }[]
  const totalRevenueGBP = revenueRows.filter(o => o.currency === 'GBP').reduce((sum, o) => sum + o.amount, 0) / 100

  return {
    usersCount: users.count ?? 0,
    ordersCount: orders.count ?? 0,
    completedOrdersCount: revenueRows.length,
    totalRevenueGBP,
    bookingsCount: bookings.count ?? 0,
    confirmedBookingsCount: confirmedBookings.count ?? 0,
    reportsCount: reports.count ?? 0,
    cartItemsCount: cartItems.count ?? 0,
    incompleteOrdersCount: incompleteOrders.count ?? 0,
    reportsNeedingFollowUpCount: unlockedReportRows.count ?? 0,
  }
}
