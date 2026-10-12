import type { CategoryId } from './projectTypes'

/**
 * Types for the guided project-intake chat (/start).
 *
 * Everything the person tells us is held in one IntakeDraft so it can be
 * (a) resumed after a refresh, (b) shown back to them on the review card,
 * and (c) carried through login/OTP into a dashboard draft project.
 */

export type IntakeStepId = 'details' | 'property' | 'planning' | 'more' | 'review'

export type IntakeRoleId =
  | 'homeowner'
  | 'buyer'
  | 'landlord'
  | 'architect'
  | 'consultant'
  | 'builder'
  | 'agent'
  | 'other'

export interface IntakeDetails {
  fullName: string
  email: string
  /** Optional. Stored exactly as typed (trimmed). */
  mobile: string
  role: IntakeRoleId
}

export interface IntakeProperty {
  /** Address id from the planning engine (UPRN or osm:way:123) — or "manual". */
  addressId: string
  /** Engine application id — needed to load street view / aerial images. */
  applicationId: string
  fullAddress: string
  line1: string
  town: string
  postcode: string
  lat?: number
  lng?: number
  uprn?: string | null
  propertyType?: string
  council?: string
  /** Short "what we found" lines, e.g. "Site area: 120 m²". */
  facts: { label: string; value: string }[]
  /** Labels of planning constraints found at the address, e.g. "Conservation area". */
  constraintFlags: string[]
  streetViewAvailable: boolean
  streetViewAttribution?: string | null
  aerialAttribution?: string | null
  manual?: boolean
  /** True when served from built-in demo data rather than the live engine. */
  demo?: boolean
  /** Person has pressed "Yes, that's my property". */
  confirmed: boolean
}

export interface IntakePlanning {
  categoryId: CategoryId | null
  /** Free text — required when categoryId === 'unsure'. */
  describe: string
  /** "Already know the planning route?" — defaults to 'no' (we decide for them). */
  routeKnown: 'yes' | 'no'
}

export interface IntakeMore {
  subtypeId: string | null
  /** question id → answer. See projectTypes.ts for the value formats. */
  answers: Record<string, string>
}

export interface IntakeDraft {
  v: 1
  savedAt: string
  step: IntakeStepId
  details: IntakeDetails
  property: IntakeProperty | null
  planning: IntakePlanning
  more: IntakeMore
  /**
   * Set once the draft has been turned into a dashboard project after
   * login — stops a refresh of the hand-off page creating a duplicate.
   */
  claimedDraftId?: string
}
