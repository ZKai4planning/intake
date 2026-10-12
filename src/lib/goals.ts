
import type { Goal, GoalId } from '@/types'

/**
 * Single source of truth for homepage goal catalogue.
 * Maps directly to workbook: Homepage_Goal_Catalogue (HG-001 to HG-020)
 *
 * When API is ready, this can be fetched from /api/goals
 * and these values become the fallback/skeleton.
 */
export const GOALS: Goal[] = [
  // ── Homeowner cards (high priority, display as card) ──────────────
  {
    id: 'ext',
    emoji: '🏠',
    title: 'Build an extension',
    subtitle: 'Rear, side, wraparound',
    flowId: 'FA-01',
    hgId: 'HG-001',
    href: '/check/extension',
    priority: 'high',
    userType: 'homeowner',
    displayAs: 'card',
  },
  {
    id: 'loft',
    emoji: '🏗️',
    title: 'Convert loft or roof',
    subtitle: 'Dormer, mansard, rooflights',
    flowId: 'FA-01',
    hgId: 'HG-002',
    href: '/check/loft',
    priority: 'high',
    userType: 'homeowner',
    displayAs: 'card',
  },
  {
    id: 'windows',
    emoji: '🪟',
    title: 'Change windows or doors',
    subtitle: 'Frontage, cladding, materials',
    flowId: 'FA-01',
    hgId: 'HG-004',
    href: '/check/windows',
    priority: 'high',
    userType: 'homeowner',
    displayAs: 'card',
  },
  {
    id: 'outbuilding',
    emoji: '🌿',
    title: 'Build a garden room',
    subtitle: 'Office, garage, studio',
    flowId: 'FA-01',
    hgId: 'HG-005',
    href: '/check/outbuilding',
    priority: 'medium',
    userType: 'homeowner',
    displayAs: 'card',
  },
  {
    id: 'unsure',
    emoji: '🔍',
    title: 'Not sure — let me check',
    subtitle: "We'll figure it out",
    flowId: 'FA-03',
    hgId: 'HG-008',
    href: '/check/unsure',
    priority: 'high',
    userType: 'all',
    displayAs: 'card',
  },

  // ── Landlord / developer / professional strips ─────────────────────
  {
    id: 'hmo',
    emoji: '🏢',
    title: 'HMO or rental property licensing',
    subtitle: 'Licence check, C3 to C4, large HMO, safety docs',
    flowId: 'FA-02',
    hgId: 'HG-007',
    href: '/check/hmo',
    priority: 'high',
    userType: 'landlord',
    displayAs: 'strip',
  },
  {
    id: 'land',
    emoji: '📐',
    title: 'Check land or development potential',
    subtitle: 'Pre-purchase feasibility, constraints, outline planning',
    flowId: 'FA-04',
    hgId: 'HG-012',
    href: '/check/land',
    priority: 'high',
    userType: 'developer',
    displayAs: 'strip',
  },
  {
    id: 'refusal',
    emoji: '📋',
    title: 'My application was refused — I need options',
    subtitle: 'Appeal, redesign, resubmission, pre-application advice',
    flowId: 'FA-04',
    hgId: 'HG-011',
    href: '/check/refusal',
    priority: 'medium',
    userType: 'developer',
    displayAs: 'strip',
  },
  {
    id: 'managed',
    emoji: '⭐',
    title: 'Handle everything for me',
    subtitle: 'Fully managed — consultant-led from start to finish',
    flowId: 'FA-07',
    hgId: 'HG-014',
    href: '/check/managed',
    priority: 'high',
    userType: 'all',
    displayAs: 'strip',
  },
  {
    id: 'b2b',
    emoji: '💼',
    title: 'Business, consultant or architect access',
    subtitle: 'Repeat checks, subscriptions, workflow support, API',
    flowId: 'FA-06',
    hgId: 'HG-015',
    href: '/check/b2b',
    priority: 'high',
    userType: 'professional',
    displayAs: 'strip',
  },
]

export const CARD_GOALS  = GOALS.filter(g => g.displayAs === 'card')
export const STRIP_GOALS = GOALS.filter(g => g.displayAs === 'strip')

/**
 * Maps a goal's userType to the actor id its card/strip CTA should carry
 * into login/signup. 'professional' and 'all' goals don't imply a single
 * persona, so they resolve to null — the person picks on the search bar
 * or during login instead.
 */
export const GOAL_USERTYPE_TO_ACTOR: Partial<Record<Goal['userType'], import('@/types').ActorId>> = {
  homeowner: 'homeowner',
  landlord:  'landlord',
  developer: 'developer',
}

/**
 * Keyword → GoalId map for the AI-powered search classifier.
 * When /api/search is live, this is the client-side fallback.
 */
export const SEARCH_KEYWORDS: Record<string, GoalId> = {
  extension: 'ext',    rear: 'ext',      'side extension': 'ext',
  loft: 'loft',        dormer: 'loft',   mansard: 'loft',   attic: 'loft',
  window: 'windows',   door: 'windows',  frontage: 'windows', cladding: 'windows',
  'garden room': 'outbuilding', 'garden office': 'outbuilding',
  outbuilding: 'outbuilding',   shed: 'outbuilding', garage: 'outbuilding',
  hmo: 'hmo',          rental: 'hmo',    licence: 'hmo',    tenant: 'hmo',
  land: 'land',        develop: 'land',  potential: 'land', site: 'land',
  refused: 'refusal',  appeal: 'refusal', rejection: 'refusal',
  everything: 'managed', managed: 'managed',
  business: 'b2b',     consultant: 'b2b', architect: 'b2b',
  'planning permission': 'unsure', 'do i need': 'unsure', 'not sure': 'unsure',
}