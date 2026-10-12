import type { ActorId } from '@/types'
import type { IntakeRoleId, IntakeStepId } from './types'

/**
 * Show the Welcome card with its own "Start my project" button?
 *
 * The person has already pressed "Get started" on the homepage to get
 * here, so by default the welcome card is just the opening chat message
 * and the "Your details" card follows automatically. Flip this to true
 * to match the reference design exactly (extra click before details).
 */
export const WELCOME_NEEDS_CLICK = false

export interface IntakeRole {
  id: IntakeRoleId
  label: string
  /** Workspace the account is created in if this is a new sign-up. */
  actorId: ActorId
}

/** "I am a:" options on the Your details card (order matches the design). */
export const INTAKE_ROLES: IntakeRole[] = [
  { id: 'homeowner', label: 'Homeowner', actorId: 'homeowner' },
  { id: 'buyer', label: 'Prospective buyer', actorId: 'homeowner' },
  { id: 'landlord', label: 'Landlord', actorId: 'landlord' },
  { id: 'architect', label: 'Architect / designer', actorId: 'architect' },
  { id: 'consultant', label: 'Planning consultant', actorId: 'consultant' },
  { id: 'builder', label: 'Builder / contractor', actorId: 'builder' },
  { id: 'agent', label: 'Agent acting for owner', actorId: 'consultant' },
  { id: 'other', label: 'Other', actorId: 'homeowner' },
]

export function getRole(id: IntakeRoleId): IntakeRole {
  return INTAKE_ROLES.find(r => r.id === id) ?? INTAKE_ROLES[0]
}

/** Order of the chat's interactive cards. */
export const INTAKE_STEPS: IntakeStepId[] = ['details', 'property', 'planning', 'more', 'review']

/**
 * Progress bar across the top (labels follow the design). The first five
 * map to chat cards; the rest are what unlocks once the email is verified.
 */
export const STEPPER_ITEMS: { id: IntakeStepId | null; label: string; sublabel?: string }[] = [
  { id: 'details', label: 'Customer' },
  { id: 'property', label: 'Property', sublabel: 'Intelligence' },
  { id: 'planning', label: 'Project Intent' },
  { id: 'more', label: 'Questionnaire' },
  { id: 'review', label: 'Verify email' },
  { id: null, label: 'Project Intelligence' },
  { id: null, label: 'Planning Route' },
  { id: null, label: 'Requirements' },
]

export const INTAKE_RETURN_TO = '/dashboard/new/intent?intake=1'
