/**
 * Ported from the frontend's consultant booking page (dashboard/new/
 * [draftId]/consultant/page.tsx) — same 3 time slots, same £99 price,
 * same free-callback option. That page currently just PATCHes the
 * project's `consultantBooking` field directly; this module adds a
 * real availability calendar behind it and a first-class Booking
 * record, while still writing that same project-level snapshot so the
 * existing page keeps working unchanged.
 */

export const TIME_SLOTS = [
  { id: 'morning', label: 'Morning (9am – 12pm)' },
  { id: 'afternoon', label: 'Afternoon (12pm – 5pm)' },
] as const

export type TimeSlotId = (typeof TIME_SLOTS)[number]['id']
export const FLEXIBLE_SLOT_LABEL = 'Either — flexible'
export const CALLBACK_SLOT_LABEL = 'Callback — flexible'

export const CONSULTATION_PRICE_GBP = 99

export interface AvailabilitySlot {
  slotId:    TimeSlotId
  label:     string
  available: boolean
}
export interface AvailabilityDay {
  date:    string // ISO date, YYYY-MM-DD
  weekday: string // e.g. 'Monday'
  slots:   AvailabilitySlot[]
}

export interface BookConsultationRequest {
  projectId?:  string
  type:        'consultation' | 'callback'
  /** Required for type: 'consultation'. Ignored for 'callback'. */
  date?:       string
  /** Required for type: 'consultation' — must be an available slot on `date`. Ignored for 'callback'. */
  timeSlotId?: TimeSlotId
  notes?:      string
}

export interface Booking {
  id:        string
  projectId?: string
  type:      'consultation' | 'callback'
  date?:     string
  timeSlot:  string
  notes?:    string
  priceGBP:  number
  status:    'confirmed' | 'cancelled' | 'completed'
  bookedAt:  string
}
