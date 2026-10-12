import { getSupabaseAdmin } from '../supabaseAdmin'
import { ApiError } from '../apiError'

export interface AdminBookingRow {
  id:        string
  userId:    string
  projectId: string | null
  type:      string
  date:      string | null
  timeSlot:  string
  notes:     string | null
  priceGBP:  number
  status:    string
  bookedAt:  string
}

interface DbBooking {
  id: string; user_id: string; project_id: string | null; type: string; date: string | null
  time_slot: string; notes: string | null; price_gbp: number; status: string; booked_at: string
}

function toAdminRow(row: DbBooking): AdminBookingRow {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    type: row.type,
    date: row.date,
    timeSlot: row.time_slot,
    notes: row.notes,
    priceGBP: row.price_gbp,
    status: row.status,
    bookedAt: row.booked_at,
  }
}

export interface ListBookingsParams {
  status?: string
  page?:   number
  limit?:  number
}

export async function listBookings(params: ListBookingsParams): Promise<{ bookings: AdminBookingRow[]; total: number }> {
  const supabase = getSupabaseAdmin()
  const page = Math.max(params.page ?? 1, 1)
  const limit = Math.min(Math.max(params.limit ?? 25, 1), 100)
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase.from('bookings').select('*', { count: 'exact' }).order('booked_at', { ascending: false }).range(from, to)
  if (params.status) query = query.eq('status', params.status)

  const { data, error, count } = await query
  if (error) throw new ApiError(500, 'Failed to load bookings', 'bookings_list_failed')
  return { bookings: (data as DbBooking[]).map(toAdminRow), total: count ?? 0 }
}

/** The one field admins legitimately need to change by hand — marking a consultation done, or cancelling one (frees the slot back up in getAvailability, since that only counts status='confirmed'). */
export async function updateBookingStatus(id: string, status: 'confirmed' | 'cancelled' | 'completed'): Promise<AdminBookingRow> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select('*').maybeSingle()
  if (error) throw new ApiError(500, 'Failed to update booking', 'booking_update_failed')
  if (!data) throw ApiError.notFound('Booking not found')
  return toAdminRow(data as DbBooking)
}
