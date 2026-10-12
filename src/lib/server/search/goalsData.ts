export type GoalId =
  | 'ext'
  | 'loft'
  | 'windows'
  | 'outbuilding'
  | 'unsure'
  | 'hmo'
  | 'land'
  | 'refusal'
  | 'managed'
  | 'b2b'

export interface Goal {
  id: GoalId
  emoji: string
  title: string
  subtitle: string
  flowId: string
  hgId: string
  href: string
  priority: 'high' | 'medium'
  userType: 'homeowner' | 'landlord' | 'developer' | 'professional' | 'all'
  displayAs: 'card' | 'strip'
}

export type ActorId = 'homeowner' | 'landlord' | 'developer' | 'consultant' | 'architect' | 'business' | 'builder'

/**
 * Single source of truth for the goal catalogue — kept in sync with the
 * frontend's src/lib/goals.ts (which becomes a fallback/skeleton once
 * this endpoint is live).
 */
export const GOALS: Goal[] = [
  { id: 'ext', emoji: '🏠', title: 'Build an extension', subtitle: 'Rear, side, wraparound', flowId: 'FA-01', hgId: 'HG-001', href: '/check/extension', priority: 'high', userType: 'homeowner', displayAs: 'card' },
  { id: 'loft', emoji: '🏗️', title: 'Convert loft or roof', subtitle: 'Dormer, mansard, rooflights', flowId: 'FA-01', hgId: 'HG-002', href: '/check/loft', priority: 'high', userType: 'homeowner', displayAs: 'card' },
  { id: 'windows', emoji: '🪟', title: 'Change windows or doors', subtitle: 'Frontage, cladding, materials', flowId: 'FA-01', hgId: 'HG-004', href: '/check/windows', priority: 'high', userType: 'homeowner', displayAs: 'card' },
  { id: 'outbuilding', emoji: '🌿', title: 'Build a garden room', subtitle: 'Office, garage, studio', flowId: 'FA-01', hgId: 'HG-005', href: '/check/outbuilding', priority: 'medium', userType: 'homeowner', displayAs: 'card' },
  { id: 'unsure', emoji: '🔍', title: 'Not sure — let me check', subtitle: "We'll figure it out", flowId: 'FA-03', hgId: 'HG-008', href: '/check/unsure', priority: 'high', userType: 'all', displayAs: 'card' },
  { id: 'hmo', emoji: '🏢', title: 'HMO or rental property licensing', subtitle: 'Licence check, C3 to C4, large HMO, safety docs', flowId: 'FA-02', hgId: 'HG-007', href: '/check/hmo', priority: 'high', userType: 'landlord', displayAs: 'strip' },
  { id: 'land', emoji: '📐', title: 'Check land or development potential', subtitle: 'Pre-purchase feasibility, constraints, outline planning', flowId: 'FA-04', hgId: 'HG-012', href: '/check/land', priority: 'high', userType: 'developer', displayAs: 'strip' },
  { id: 'refusal', emoji: '📋', title: 'My application was refused — I need options', subtitle: 'Appeal, redesign, resubmission, pre-application advice', flowId: 'FA-04', hgId: 'HG-011', href: '/check/refusal', priority: 'medium', userType: 'developer', displayAs: 'strip' },
  { id: 'managed', emoji: '⭐', title: 'Handle everything for me', subtitle: 'Fully managed — consultant-led from start to finish', flowId: 'FA-07', hgId: 'HG-014', href: '/check/managed', priority: 'high', userType: 'all', displayAs: 'strip' },
  { id: 'b2b', emoji: '💼', title: 'Business, consultant or architect access', subtitle: 'Repeat checks, subscriptions, workflow support, API', flowId: 'FA-06', hgId: 'HG-015', href: '/check/b2b', priority: 'high', userType: 'professional', displayAs: 'strip' },
]

export const CARD_GOALS = GOALS.filter(g => g.displayAs === 'card')
export const STRIP_GOALS = GOALS.filter(g => g.displayAs === 'strip')

/** Simple userType -> actor fallback, used only when free-text actor detection finds nothing explicit. */
export const GOAL_USERTYPE_TO_ACTOR: Partial<Record<Goal['userType'], ActorId>> = {
  homeowner: 'homeowner',
  landlord: 'landlord',
  developer: 'developer',
}

/**
 * Keyword -> GoalId map for the classifier. classifyQuery() matches
 * these on WHOLE WORDS ONLY (see textMatch.ts) and prefers the longest
 * match when more than one keyword hits — a plain substring check here
 * previously misfired on words like "parental" (contains "rental") or
 * "redevelop" (contains "develop").
 */
export const SEARCH_KEYWORDS: Record<string, GoalId> = {
  extension: 'ext', rear: 'ext', 'side extension': 'ext',
  loft: 'loft', dormer: 'loft', mansard: 'loft', attic: 'loft',
  window: 'windows', door: 'windows', frontage: 'windows', cladding: 'windows',
  'garden room': 'outbuilding', 'garden office': 'outbuilding',
  outbuilding: 'outbuilding', shed: 'outbuilding', garage: 'outbuilding',
  hmo: 'hmo', rental: 'hmo', licence: 'hmo', tenant: 'hmo',
  land: 'land', develop: 'land', potential: 'land', site: 'land',
  refused: 'refusal', appeal: 'refusal', rejection: 'refusal',
  everything: 'managed', managed: 'managed',
  business: 'b2b', consultant: 'b2b', architect: 'b2b',
  'planning permission': 'unsure', 'do i need': 'unsure', 'not sure': 'unsure',
}
