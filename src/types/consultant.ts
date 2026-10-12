export type TimeSlotId = 'morning' | 'afternoon'

export interface AvailabilitySlot {
  slotId:    TimeSlotId
  label:     string
  available: boolean
}

export interface AvailabilityDay {
  date:    string // ISO date, YYYY-MM-DD
  weekday: string
  slots:   AvailabilitySlot[]
}

export interface AvailabilityResponse {
  availability: AvailabilityDay[]
}

export type BookConsultationRequest =
  | {
      type:        'consultation'
      projectId?:  string
      date:        string // YYYY-MM-DD
      timeSlotId:  TimeSlotId
      notes?:      string
    }
  | {
      type:       'callback'
      projectId?: string
      notes?:     string
    }

export interface Booking {
  id:         string
  projectId?: string
  type:       'consultation' | 'callback'
  date?:      string
  timeSlot:   string
  notes?:     string
  priceGBP:   number
  status:     'confirmed' | 'cancelled' | 'completed'
  bookedAt:   string
}

export interface BookConsultationResponse {
  booking: Booking
}
