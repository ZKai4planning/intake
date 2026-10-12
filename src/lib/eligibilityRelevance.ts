/**
 * eligibilityRelevance.ts
 * ──────────────────────────
 * "If someone picked subservice X, which eligibility sections
 * actually apply to them" — same spirit as lib/goalActorMap.ts's
 * goal→actor lookup, just for services/features → form sections.
 *
 * Only the two currently-active services (see lib/services.ts) have
 * real feature entries below — a sign advert consent and a full new
 * -build application shouldn't ask the same 40 questions. Anything
 * not in this map (inactive services, or arriving with no feature
 * context at all) falls back to "show every section", same as
 * before this existed — so this is additive, never a trap that
 * hides a section nobody meant to hide.
 *
 * Add a new row here when a new feature/subservice needs filtering;
 * nothing else has to change (each step file already calls
 * isSectionVisible() everywhere it has an optional section).
 */

/** Sections that are ALWAYS shown regardless of feature — core identity, safety-net, and sign-off sections. */
const ALWAYS_VISIBLE_SECTIONS = new Set([
  'Applicant Details',
  'Pre-Application Check',
  'Property & Ownership',
  'Heritage & Listing',
  'Description of Works',
  'Plans, Drawings & Photographs',
  'Additional Consents Required',
  'Review & Declarations',
  'Digital Signature',
])

/**
 * Everything else is OPTIONAL — hidden unless the selected feature's
 * row below lists it. Keeping this as an explicit set (rather than
 * "anything not always-visible") means a typo in a step file's
 * SectionHeading text fails safe (shows up as always-visible) instead
 * of silently disappearing.
 */
const OPTIONAL_SECTIONS = new Set([
  'Current Layout',
  'Dimensions',
  'Current Materials Used',
  'Trees, Hedges & Landscaping',
  'Flood & Environmental Risk',
  'Access & Parking',
  'Proposed HMO Use',
  'Current Use Status',
  'Safety & Compliance',
  'Utilities & Waste',
])

const BUILDING_WORK_SECTIONS = ['Current Layout', 'Dimensions', 'Current Materials Used']
const SITE_IMPACT_SECTIONS = ['Trees, Hedges & Landscaping', 'Access & Parking', 'Flood & Environmental Risk']

/** feature title (from lib/services.ts) → which OPTIONAL_SECTIONS apply. */
const FEATURE_SECTION_MAP: Record<string, string[]> = {
  // ── service-01: Residential ──────────────────────────────────────
  'Non Material Amendment': ['Dimensions', 'Current Materials Used'],
  'Advertisement Consent': [],
  'Works to Trees (TPO & Conservation)': ['Trees, Hedges & Landscaping'],
  'Lawful Development Certificate (LDC)': [...BUILDING_WORK_SECTIONS],
  'Certificate of Lawfulness (Listed Building)': ['Dimensions'],
  'Permission in Principle (PiP)': [...SITE_IMPACT_SECTIONS],
  'Householder Planning Consent': [...BUILDING_WORK_SECTIONS, ...SITE_IMPACT_SECTIONS],
  'Prior Approval': [...BUILDING_WORK_SECTIONS, 'Trees, Hedges & Landscaping', 'Flood & Environmental Risk'],
  'Approval / Discharge of Conditions': ['Dimensions'],
  'Full Planning Consent': [...BUILDING_WORK_SECTIONS, ...SITE_IMPACT_SECTIONS, 'Utilities & Waste'],
  'Outline Planning Consent': [...SITE_IMPACT_SECTIONS, 'Utilities & Waste'],
  'Reserved Matters Application': [...BUILDING_WORK_SECTIONS, 'Access & Parking', 'Utilities & Waste'],

  // ── service-07: Property Licensing ───────────────────────────────
  'HMO Licensing': ['Proposed HMO Use', 'Current Use Status', 'Safety & Compliance'],
  'Selective Licensing': ['Current Use Status', 'Safety & Compliance'],
  'Additional Licensing': ['Proposed HMO Use', 'Current Use Status', 'Safety & Compliance'],
  'Licence Renewal & Compliance': ['Safety & Compliance'],
  'Documentation & Registration Support': ['Safety & Compliance'],
  'Legal Compliance Review': ['Safety & Compliance', 'Current Use Status'],
}

/**
 * Returns the set of optional sections relevant to a feature, or
 * `null` to mean "no filtering — show everything" (unmapped feature,
 * or no feature context at all).
 */
export function relevantSectionsForFeature(featureTitle: string | undefined | null): Set<string> | null {
  if (!featureTitle) return null
  const optional = FEATURE_SECTION_MAP[featureTitle]
  if (!optional) return null
  return new Set(optional)
}

/** Whether `section` should render, given a (possibly null = unfiltered) relevant-sections set. */
export function isSectionRelevant(section: string, relevant: Set<string> | null): boolean {
  if (relevant === null) return true
  if (!OPTIONAL_SECTIONS.has(section)) return true // always-visible or unrecognized → fail safe to visible
  return relevant.has(section)
}

export { ALWAYS_VISIBLE_SECTIONS, OPTIONAL_SECTIONS }
