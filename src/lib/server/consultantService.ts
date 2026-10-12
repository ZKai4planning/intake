import { getSupabaseAdmin } from './supabaseAdmin'
import { ApiError } from './apiError'
import { decryptEmail } from './emailCrypto'
import { sendConsultantBookingConfirmedEmail } from './email/emailService'
import { TIME_SLOTS, CALLBACK_SLOT_LABEL, CONSULTATION_PRICE_GBP } from './consultantTypes'
import type { AvailabilityDay, Booking, BookConsultationRequest, TimeSlotId } from './consultantTypes'

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function isWeekend(d: Date): boolean {
  const day = d.getUTCDay()
  return day === 0 || day === 6
}

function slotLabel(slotId: TimeSlotId): string {
  return TIME_SLOTS.find(s => s.id === slotId)!.label
}

/**
 * Next `days` business days, each with the 2 real bookable slots
 * (morning/afternoon — "Either / flexible" isn't a real capacity-limited
 * slot, so it isn't part of this calendar; the frontend can still offer
 * it as an always-available option). Single-consultant v1: a slot is
 * unavailable once ANY confirmed consultation exists for that date+slot.
 */
export async function getAvailability(days = 14): Promise<AvailabilityDay[]> {
  const start = new Date()
  const dates: Date[] = []
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()))
  while (dates.length < days) {
    if (!isWeekend(cursor)) dates.push(new Date(cursor))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  const isoDates = dates.map(toIsoDate)

  const supabase = getSupabaseAdmin()
  const { data: booked, error } = await supabase
    .from('bookings')
    .select('date, time_slot')
    .in('date', isoDates)
    .eq('type', 'consultation')
    .eq('status', 'confirmed')
  if (error) throw new ApiError(500, 'Failed to load availability', 'availability_lookup_failed')

  const bookedSet = new Set((booked ?? []).map(b => `${b.date}|${b.time_slot}`))

  return dates.map(d => {
    const iso = toIsoDate(d)
    return {
      date: iso,
      weekday: d.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' }),
      slots: TIME_SLOTS.map(s => ({
        slotId: s.id,
        label: s.label,
        available: !bookedSet.has(`${iso}|${s.label}`),
      })),
    }
  })
}

interface DbBooking {
  id:         string
  project_id: string | null
  type:       string
  date:       string | null
  time_slot:  string
  notes:      string | null
  price_gbp:  number
  status:     string
  booked_at:  string
}

function toApiBooking(row: DbBooking): Booking {
  return {
    id: row.id,
    projectId: row.project_id ?? undefined,
    type: row.type as Booking['type'],
    date: row.date ?? undefined,
    timeSlot: row.time_slot,
    notes: row.notes ?? undefined,
    priceGBP: row.price_gbp,
    status: row.status as Booking['status'],
    bookedAt: row.booked_at,
  }
}

export async function bookConsultation(userId: string, input: BookConsultationRequest): Promise<Booking> {
  const supabase = getSupabaseAdmin()
  const isConsultation = input.type === 'consultation'

  let date: string | null = null
  let timeSlot: string
  let priceGBP: number

  if (isConsultation) {
    if (!input.date || !input.timeSlotId) {
      throw ApiError.badRequest('date and timeSlotId are required for a consultation booking')
    }
    date = input.date
    timeSlot = slotLabel(input.timeSlotId)
    priceGBP = CONSULTATION_PRICE_GBP

    // Re-check availability at booking time (not just whatever the
    // frontend last saw) to avoid a race between two people booking
    // the same slot.
    const { data: clash, error: clashError } = await supabase
      .from('bookings')
      .select('id')
      .eq('date', date)
      .eq('time_slot', timeSlot)
      .eq('type', 'consultation')
      .eq('status', 'confirmed')
      .maybeSingle()
    if (clashError) throw new ApiError(500, 'Failed to check slot availability', 'availability_check_failed')
    if (clash) throw ApiError.badRequest('That slot was just booked — please pick another.', 'slot_unavailable')
  } else {
    timeSlot = CALLBACK_SLOT_LABEL
    priceGBP = 0
  }

  if (input.projectId) {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', input.projectId)
      .maybeSingle()
    if (projectError) throw new ApiError(500, 'Failed to look up that project', 'project_lookup_failed')
    if (!project) throw ApiError.notFound('Project not found')
    if (project.user_id !== userId) throw ApiError.forbidden('This project belongs to a different account')
  }

  const { data: row, error: insertError } = await supabase
    .from('bookings')
    .insert({
      user_id: userId,
      project_id: input.projectId ?? null,
      type: input.type,
      date,
      time_slot: timeSlot,
      notes: input.notes ?? null,
      price_gbp: priceGBP,
      status: 'confirmed',
    })
    .select('*')
    .single()
  if (insertError || !row) throw new ApiError(500, 'Failed to create your booking', 'booking_create_failed')

  const booking = toApiBooking(row as DbBooking)

  // Backward-compat: keep writing the same snapshot shape the existing
  // frontend page already reads off the project (Project.consultantBooking),
  // so nothing there needs to change to pick this up.
  if (input.projectId) {
    const { error: snapshotError } = await supabase
      .from('projects')
      .update({
        consultant_booking: {
          date: date ?? '',
          time: timeSlot,
          notes: input.notes,
          bookedAt: booking.bookedAt,
        },
      })
      .eq('id', input.projectId)
    if (snapshotError) {
      console.warn('[consultant] Booking created but failed to write project snapshot', { projectId: input.projectId })
    }
  }

  const { data: user } = await supabase.from('users').select('email, name').eq('id', userId).maybeSingle()
  if (user) {
    sendConsultantBookingConfirmedEmail(decryptEmail(user.email), user.name, {
      isCallback: !isConsultation,
      date: date ?? undefined,
      timeLabel: isConsultation ? timeSlot : undefined,
    }).catch(() => {})
  }

  return booking
}
