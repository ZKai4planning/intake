/**
 * Shapes returned by /api/property/* — shared by the Next.js route
 * handlers (server) and the intake chat (client).
 *
 * These are deliberately small and flat: the route handlers translate the
 * planning engine's richer payloads into this, so the UI never depends on
 * engine internals (and keeps working if the engine is swapped).
 */

export interface AddressSuggestion {
  /** Engine address id (UPRN or osm:way:123). */
  id: string
  fullAddress: string
  postcode: string
  propertyType?: string
  uprn?: string | null
  lat?: number
  lng?: number
}

export interface SearchResponse {
  type: 'none' | 'postcode' | 'postcode_partial' | 'address' | 'unavailable'
  /** Addresses to pick from (type: postcode | address). */
  addresses: AddressSuggestion[]
  /** Postcode completions (type: postcode_partial). */
  postcodes: string[]
  /** Friendly note to show under the box, e.g. when the upstream is slow. */
  message?: string
  /** True when answered from built-in demo data (no engine configured). */
  demo: boolean
}

export interface ManualAddress {
  line1: string
  line2?: string
  town?: string
  postcode: string
}

export type ConfirmRequest = { id: string } | { manual: ManualAddress }

export interface ConfirmResponse {
  /** Engine application id — used to load /api/property/media. */
  applicationId: string
  address: {
    id: string
    uprn: string | null
    fullAddress: string
    line1: string
    town: string
    postcode: string
    lat?: number
    lng?: number
  }
  propertyType?: string
  council?: string
  facts: { label: string; value: string }[]
  constraintFlags: string[]
  streetViewAvailable: boolean
  streetViewAttribution: string | null
  aerialAttribution: string | null
  warnings: string[]
  manual: boolean
  demo: boolean
}

export type MediaKind = 'street-view' | 'aerial'
