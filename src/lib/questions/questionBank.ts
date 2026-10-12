import type { QuestionRow } from '@/types/questions'

/**
 * QUESTION_BANK
 * ──────────────
 * Source: pasted Question_Module_Bank rows 001–017 (full/householder
 * application intake form). Each row's `minTier` determines which
 * workspace tiers see it:
 *
 *   simple       → homeowner                       (lightest subset)
 *   standard     → + landlord
 *   advanced     → + developer
 *   professional → + consultant / architect
 *   enterprise   → + business / agency              (bulk-oriented, different subset)
 *
 * Tiers are CUMULATIVE except 'enterprise', which uses its own bulk-mode
 * subset (see ENTERPRISE_BULK_FIELDS below) since a business doing
 * portfolio-wide checks doesn't fill in one property's tree survey by hand.
 *
 * "Don't know" / "Unsure" answers map to upsellTrigger — these are
 * surfaced as UpsellEvent prompts in the UI (handled by useQuestionFlow).
 */

export const QUESTION_BANK: QuestionRow[] = [
  {
    rowId: '001',
    field: 'Applicant details',
    inputType: 'text',
    guidance: 'Collect full applicant details and contact information.',
    minTier: 'simple',
    required: true,
  },
  {
    rowId: '002',
    field: 'Agent details (if any)',
    inputType: 'radio-text',
    options: [
      { value: 'yes', label: 'Yes — an agent is acting for me' },
      { value: 'no',  label: 'No' },
      { value: 'unsure', label: "Don't know", triggersUpsell: true },
    ],
    guidance: 'Ask if a planning agent is acting; if "Yes," capture the agent\u2019s name, address and contact.',
    upsellTrigger: '"Don\u2019t know" triggers upsell to agent services.',
    minTier: 'standard',
    required: false,
  },
  {
    rowId: '003',
    field: 'Property type & site address',
    inputType: 'dropdown-text',
    options: [
      { value: 'house', label: 'House' },
      { value: 'flat', label: 'Flat / maisonette' },
      { value: 'bungalow', label: 'Bungalow' },
      { value: 'commercial', label: 'Commercial', impliesActor: 'business' },
      { value: 'land', label: 'Land / site', impliesActor: 'developer' },
      { value: 'unsure', label: "Don't know", triggersUpsell: true },
    ],
    guidance: 'Identify the site address and property type.',
    upsellTrigger: '"Don\u2019t know" triggers upsell to site lookup or property reports.',
    minTier: 'simple',
    required: true,
  },
  {
    rowId: '004',
    field: 'Ownership status',
    inputType: 'radio-text',
    options: [
      { value: 'freehold', label: 'Freehold' },
      { value: 'leasehold', label: 'Leasehold' },
      { value: 'shared', label: 'Shared / agricultural tenancy', impliesActor: 'developer' },
      { value: 'unsure', label: "Don't know", triggersUpsell: true },
    ],
    guidance: 'Establish ownership and any shared or agricultural tenancies (links to Certificates A\u2013D).',
    upsellTrigger: '"Don\u2019t know" triggers upsell to land registry check assistance.',
    minTier: 'standard',
    required: false,
  },
  {
    rowId: '005',
    field: 'Conservation area / listed building',
    inputType: 'radio',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unsure', label: 'Unsure', triggersUpsell: true },
    ],
    guidance: 'Determine if the site is in a conservation area or near a listed building.',
    upsellTrigger: '"Unsure" triggers upsell to heritage impact assessment or consultation.',
    minTier: 'simple',
    required: true,
  },
  {
    rowId: '006',
    field: 'Description of proposed works',
    inputType: 'textarea',
    placeholder: 'Briefly describe the size, number of storeys, and position of the works…',
    guidance: 'Ask the user to summarise the proposal (size, number of storeys, position).',
    upsellTrigger: 'If very vague, prompt a consultation to refine scope.',
    minTier: 'simple',
    required: true,
  },
  {
    rowId: '007',
    field: 'Purpose & nature of development',
    inputType: 'dropdown-text',
    options: [
      { value: 'extension', label: 'Extension' },
      { value: 'loft', label: 'Loft conversion' },
      { value: 'newbuild', label: 'New build' },
      { value: 'changeofuse', label: 'Change of use', impliesActor: 'landlord' },
      { value: 'other', label: 'Other', triggersUpsell: true },
      { value: 'unsure', label: "Don't know", triggersUpsell: true },
    ],
    guidance: 'Capture the type and objective of the development.',
    upsellTrigger: '"Other" or "Don\u2019t know" triggers AI/consultant clarification.',
    minTier: 'simple',
    required: true,
  },
  {
    rowId: '008',
    field: 'Materials & dimensions',
    inputType: 'radio-text',
    options: [
      { value: 'match', label: 'Match existing materials' },
      { value: 'new', label: 'New / different materials' },
      { value: 'unsure', label: "Don't know", triggersUpsell: true },
    ],
    guidance: 'Ask for wall/roof materials, colours and approximate dimensions.',
    upsellTrigger: '"Don\u2019t know" triggers upsell to materials specification support.',
    minTier: 'simple',
    required: false,
  },
  {
    rowId: '009',
    field: 'Upload plans & drawings',
    inputType: 'file-upload',
    guidance: 'Allow users to upload required drawings and photos (location plan, site plan, existing/proposed elevations, photographs).',
    upsellTrigger: 'If no documents uploaded, flag and offer drawing services (CAD, surveys).',
    minTier: 'simple',
    required: false,
  },
  {
    rowId: '010',
    field: 'Access & parking',
    inputType: 'radio-text',
    options: [
      { value: 'yes', label: 'Yes — new/altered access' },
      { value: 'no', label: 'No change' },
      { value: 'unsure', label: 'Unsure', triggersUpsell: true },
    ],
    guidance: 'Identify any new or altered access and proposed parking changes.',
    upsellTrigger: '"Unsure" triggers upsell to highways advice.',
    minTier: 'standard',
    required: false,
  },
  {
    rowId: '011',
    field: 'Trees, hedges & landscaping',
    inputType: 'radio-file',
    options: [
      { value: 'yes', label: 'Yes — trees within falling distance' },
      { value: 'no', label: 'No' },
      { value: 'unsure', label: 'Unsure', triggersUpsell: true },
    ],
    guidance: 'Determine tree positions and species; request a plan showing trees within falling distance.',
    upsellTrigger: '"Unsure" or no upload triggers upsell to tree survey.',
    minTier: 'standard',
    required: false,
  },
  {
    rowId: '012',
    field: 'Environmental & flood risk',
    inputType: 'radio-file',
    options: [
      { value: 'yes', label: 'Yes — Flood Zone 2 or 3' },
      { value: 'no', label: 'No — Flood Zone 1' },
      { value: 'unsure', label: 'Unsure', triggersUpsell: true },
    ],
    guidance: 'Check whether the site is in Flood Zone 2 or 3; request any Flood Risk Assessment.',
    upsellTrigger: '"Unsure" triggers upsell to flood-risk and environmental reports.',
    minTier: 'standard',
    required: false,
  },
  {
    rowId: '013',
    field: 'Utilities & waste',
    inputType: 'radio-text',
    options: [
      { value: 'standard', label: 'Standard connection' },
      { value: 'renewable', label: 'Includes renewable energy installation' },
      { value: 'unsure', label: "Don't know", triggersUpsell: true },
    ],
    guidance: 'Ask about existing and proposed water, sewage, waste and any renewable energy installations.',
    upsellTrigger: '"Don\u2019t know" triggers upsell to infrastructure assessment.',
    minTier: 'advanced',
    required: false,
  },
  {
    rowId: '014',
    field: 'Pre-application advice & community consultation',
    inputType: 'radio-text',
    options: [
      { value: 'yes', label: 'Yes — I have a pre-app reference' },
      { value: 'no', label: 'No' },
      { value: 'unsure', label: 'Unsure', triggersUpsell: true },
    ],
    guidance: 'Record any pre-application reference number, date and officer name.',
    upsellTrigger: '"Unsure" triggers upsell to a pre-application advice session.',
    minTier: 'advanced',
    required: false,
  },
  {
    rowId: '015',
    field: 'Ownership certificates (A\u2013D)',
    inputType: 'dropdown',
    options: [
      { value: 'a', label: 'Certificate A' },
      { value: 'b', label: 'Certificate B' },
      { value: 'c', label: 'Certificate C' },
      { value: 'd', label: 'Certificate D' },
      { value: 'unsure', label: 'Unsure', triggersUpsell: true },
    ],
    guidance: 'Guide the user to the correct ownership certificate and notice requirements.',
    upsellTrigger: '"Unsure" triggers upsell — we can handle certificate notices for a fee.',
    minTier: 'advanced',
    required: false,
  },
  {
    rowId: '016',
    field: 'Additional consents & special cases',
    inputType: 'checkbox-group',
    options: [
      { value: 'listed', label: 'Listed building consent', triggersUpsell: true },
      { value: 'advertisement', label: 'Advertisement consent', triggersUpsell: true },
      { value: 'treeworks', label: 'Tree works consent', triggersUpsell: true },
      { value: 'demolition', label: 'Demolition', triggersUpsell: true },
      { value: 'conditions', label: 'Conditions variation', triggersUpsell: true },
      { value: 'nma', label: 'Non-material amendment', triggersUpsell: true },
      { value: 'unsure', label: 'Unsure which apply', triggersUpsell: true },
    ],
    guidance: 'Capture any other consents required, such as listed building consent or advertisement consent.',
    upsellTrigger: 'Checking any option may prompt an upsell to professional services; "Unsure" also triggers.',
    minTier: 'standard',
    required: false,
  },
  {
    rowId: '017',
    field: 'Declarations & signature',
    inputType: 'signature',
    guidance: 'Confirm accuracy, authority to act and agreement to terms.',
    minTier: 'simple',
    required: true,
  },
]

/**
 * getQuestionsForTier
 * ─────────────────────
 * Returns the cumulative subset of QUESTION_BANK visible to a given tier.
 * Tier order: simple < standard < advanced < professional
 * (enterprise uses its own bulk subset — see getEnterpriseFields)
 */
const TIER_ORDER: Record<string, number> = {
  simple: 0,
  standard: 1,
  advanced: 2,
  professional: 3,
  enterprise: 4,
}

export function getQuestionsForTier(tier: string): QuestionRow[] {
  if (tier === 'enterprise') return getEnterpriseFields()

  const tierLevel = TIER_ORDER[tier] ?? 0
  return QUESTION_BANK.filter(q => TIER_ORDER[q.minTier] <= tierLevel)
}

/**
 * Enterprise (business/agency) workspaces operate in bulk mode —
 * one CSV row per property rather than a long single-property form.
 * They only need identity + property + constraint flags; everything
 * else (materials, trees, flood, certificates) is either skipped or
 * resolved automatically by the bulk-check agent per address.
 */
function getEnterpriseFields(): QuestionRow[] {
  return QUESTION_BANK.filter(q =>
    ['001', '003', '005', '017'].includes(q.rowId)
  )
}
