import type { ChatQuestion } from '@/types/reportTiers'

/**
 * questionSlots.ts
 * ──────────────────
 * The canonical, fixed schema behind the report chat's questions —
 * every `id` here is a key that reportContent.ts (generateTieredReport)
 * and reportTiers.ts (missingInfo, complexity scoring, upsell triggers)
 * read directly off `TierAnswers`. This list, and every option `value`
 * in it, must stay stable — it's the contract the rest of the app is
 * built on.
 *
 * What's NOT fixed anymore is the WORDING. `prompt`/`shortLabel`/
 * `placeholder`/option `label` below are only the FALLBACK copy, used
 * verbatim if the LLM tailoring call in /api/chat/questions fails or
 * GROQ_API_KEY isn't set. In the normal path, /api/chat/questions
 * sends this schema (id, inputType, required, hint, canonical option
 * values) to the LLM and gets back the same slots reordered, phrased
 * for the actor/goal in play, and with irrelevant non-required slots
 * dropped — see lib/questionSkill.ts for the rules it follows.
 *
 * Previously this lived inline in reportTiers.ts as CHAT_QUESTION_BANK
 * and was asked identically to every actor. Pulled out here so it's
 * the shared source for both the fallback bank (reportTiers.ts) and
 * the LLM prompt payload (app/api/chat/questions/route.ts).
 */
export const QUESTION_SLOTS: ChatQuestion[] = [
  // ── RPT-001 — Quick Planning Snapshot (free, 3–8 questions) ──────
  {
    id: 'propertyType',
    tier: 'RPT-001',
    shortLabel: 'Property type',
    prompt: 'What type of property is it?',
    inputType: 'options',
    required: true,
    hint: 'Drives which permitted-development rules apply — flats/commercial/land have very different rights to a house.',
    options: [
      { value: 'house', label: 'House' },
      { value: 'flat', label: 'Flat / maisonette' },
      { value: 'bungalow', label: 'Bungalow' },
      { value: 'commercial', label: 'Commercial', impliesActor: 'business' },
      { value: 'land', label: 'Land / site', impliesActor: 'developer' },
    ],
  },
  {
    id: 'postcode',
    tier: 'RPT-001',
    shortLabel: 'Postcode',
    prompt: "What's the postcode or address of the property?",
    inputType: 'text',
    placeholder: 'e.g. SW1A 1AA',
    required: true,
    hint: 'Used to look up the real council, constraints and coordinates for the report. Usually already known from the chat — only ask if genuinely still missing.',
  },
  {
    id: 'ownership',
    tier: 'RPT-001',
    shortLabel: 'Ownership',
    prompt: 'Do you own the property outright, or is it leasehold?',
    inputType: 'options',
    required: true,
    hint: "Leasehold usually means extra consents beyond planning permission. For a developer/consultant/architect this is often 'acting on behalf of' rather than personal ownership — phrase accordingly.",
    options: [
      { value: 'freehold', label: 'Freehold' },
      { value: 'leasehold', label: 'Leasehold' },
      { value: 'unsure', label: "Don't know", triggersUpsell: true },
    ],
  },
  {
    id: 'heritageAwareness',
    tier: 'RPT-001',
    shortLabel: 'Conservation / listed status',
    prompt: 'As far as you know, is the property in a conservation area or listed?',
    inputType: 'options',
    required: true,
    hint: 'A gut-check before the real lookup_council/constraints check runs — just what the person already believes, not a formal check.',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unsure', label: "Don't know", triggersUpsell: true },
    ],
  },

  // ── RPT-002 — Planning Eligibility Report (delta) ────────────────
  {
    id: 'agentActing',
    tier: 'RPT-002',
    shortLabel: 'Agent acting',
    prompt: 'Is a planning agent already acting for you on this?',
    inputType: 'options',
    hint: "Irrelevant to ask a consultant/architect/agent actor — THEY typically are the agent. Skip for those actors unless they've indicated they're checking on behalf of someone else who already has separate representation.",
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unsure', label: "Don't know", triggersUpsell: true },
    ],
  },
  {
    id: 'worksPurpose',
    tier: 'RPT-002',
    shortLabel: 'Purpose of works',
    prompt: "What's the main purpose of the works?",
    inputType: 'options',
    hint: 'Core intent classification, relevant to every actor type.',
    options: [
      { value: 'extension', label: 'Extension' },
      { value: 'loft', label: 'Loft conversion' },
      { value: 'newbuild', label: 'New build' },
      { value: 'changeofuse', label: 'Change of use', impliesActor: 'landlord' },
      { value: 'other', label: 'Other', triggersUpsell: true },
    ],
  },
  {
    id: 'materials',
    tier: 'RPT-002',
    shortLabel: 'Materials',
    prompt: 'Will materials match the existing building, or be different?',
    inputType: 'options',
    hint: 'Mainly matters for conservation-area/listed cases and single-property works. Low relevance for a developer/land-focused site check — safe to skip for that actor unless heritage status is already a known concern.',
    options: [
      { value: 'match', label: 'Match existing materials' },
      { value: 'new', label: 'New / different materials' },
      { value: 'unsure', label: "Don't know", triggersUpsell: true },
    ],
  },
  {
    id: 'access',
    tier: 'RPT-002',
    shortLabel: 'Access changes',
    prompt: 'Any new or altered access, driveway or parking involved?',
    inputType: 'options',
    hint: 'Relevant to every actor — access/parking changes affect both householder PD rights and site viability.',
    options: [
      { value: 'yes', label: 'Yes — new/altered access' },
      { value: 'no', label: 'No change' },
      { value: 'unsure', label: 'Unsure', triggersUpsell: true },
    ],
  },
  {
    id: 'neighbourImpact',
    tier: 'RPT-002',
    shortLabel: 'Neighbour impact',
    prompt: 'Could the works overlook, or sit close to, a neighbouring boundary?',
    inputType: 'options',
    hint: "For a landlord this often reads better framed around the tenant's/neighbouring unit's boundary rather than 'your' neighbour.",
    options: [
      { value: 'yes', label: 'Yes, likely' },
      { value: 'no', label: 'No, unlikely' },
      { value: 'unsure', label: "Don't know", triggersUpsell: true },
    ],
  },
  {
    id: 'planningHistory',
    tier: 'RPT-002',
    shortLabel: 'Planning history',
    prompt: 'Has this property had a previous planning application or refusal?',
    inputType: 'options',
    hint: 'Relevant to every actor — prior history changes the likely route regardless of who is asking.',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unsure', label: "Don't know", triggersUpsell: true },
    ],
  },
  {
    id: 'timeline',
    tier: 'RPT-002',
    shortLabel: 'Timeline',
    prompt: "What's your ideal timeline to start work?",
    inputType: 'options',
    hint: 'Relevant to every actor.',
    options: [
      { value: 'asap', label: 'As soon as possible' },
      { value: '3-6m', label: '3–6 months' },
      { value: '6m+', label: '6+ months / just exploring' },
    ],
  },

  // ── RPT-003 — Planning Potential / Risk Report (delta) ───────────
  {
    id: 'drawingsAvailable',
    tier: 'RPT-003',
    shortLabel: 'Drawings / plans',
    prompt: 'Do you have any drawings, plans or photos of the property already?',
    inputType: 'options',
    hint: 'A consultant/architect actor may already have these produced for a client — phrase as "does the client have" rather than "do you have" if that fits the conversation so far.',
    options: [
      { value: 'yes', label: 'Yes, I can upload some' },
      { value: 'no', label: 'Not yet', triggersUpsell: true },
    ],
  },
  {
    id: 'projectScale',
    tier: 'RPT-003',
    shortLabel: 'Project scale',
    prompt: 'How would you describe the scale of the project?',
    inputType: 'options',
    hint: 'Directly drives the risk/complexity score in the report — always relevant, never skip.',
    options: [
      { value: 'minor', label: 'Minor — single element (windows, small extension)' },
      { value: 'moderate', label: 'Moderate — extension, loft, outbuilding' },
      { value: 'major', label: 'Major — new build, large-scale, multi-unit', triggersUpsell: true },
    ],
  },
  {
    id: 'budget',
    tier: 'RPT-003',
    shortLabel: 'Budget',
    prompt: "What's the approximate budget for the project?",
    inputType: 'options',
    hint: 'For a developer/business actor this often reads better as a project/build cost bracket rather than a personal "budget".',
    options: [
      { value: 'under25k', label: 'Under £25k' },
      { value: '25-100k', label: '£25k–£100k' },
      { value: '100k+', label: '£100k+' },
      { value: 'unsure', label: "Don't know yet", triggersUpsell: true },
    ],
  },
]