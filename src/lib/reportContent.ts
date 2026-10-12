import type { ReportTierId, TierAnswers } from '@/types/reportTiers'
import { checkConstraints, councilFor, type ConstraintResult } from './constraints'
import { generateReport, type ReportRisk, type ReportDocument } from './report'
import { pickVariant, shuffleDeterministic, randomSeed } from './variantSeed'
import type { PlanningConstraint } from './planningData'

/**
 * reportContent.ts
 * ──────────────────
 * Builds the report shown inside the chat, at the depth promised by
 * each tier's outputSummary in reportTiers.ts:
 *
 *   RPT-001 → route + obvious constraints + what-to-check-next + caveat
 *   RPT-002 → + likely application/licence type + key risks + missing info
 *   RPT-003 → + full risk analysis + document checklist + complexity/package
 *
 * RPT-004/RPT-005 don't produce this shape at all — they're human/lead
 * driven (see LeadRequestContent below).
 *
 * API swap point: once a real report-generation endpoint exists per
 * tier, replace the bodies below with fetch calls using the same
 * (tier, answers) inputs and keep the same output shape.
 */

export interface TieredReportContent {
  tier: ReportTierId
  council: string
  postcode: string
  route: { title: string; detail: string }
  constraintsChecked: ConstraintResult[]
  confidenceCaveat: string
  whatToCheckNext: string[]
  /**
   * Only set when dataSource === 'live' — the postcodes.io coordinates
   * for this exact address. Used to render the real map page in the
   * PDF (see lib/staticMap.ts). There's nothing meaningful to centre a
   * map on for an 'estimate' report, so this is left undefined there
   * rather than guessed.
   */
  coordinates?: { latitude: number; longitude: number }
  /**
   * Where council + constraintsChecked came from. 'live' = a real-time
   * postcodes.io + planning.data.gov.uk lookup for this exact address.
   * 'estimate' = the live lookup couldn't complete (bad postcode, or the
   * services were unreachable) and this fell back to a general,
   * non-address-specific estimate — dataNote explains this to the reader.
   */
  dataSource: 'live' | 'estimate'
  dataNote?: string
  /**
   * Seed used to pick equivalent-but-differently-worded phrasing for
   * this specific report (see lib/variantSeed.ts). Persisted alongside
   * the rest of the content so re-rendering/downloading the SAME
   * report always reads identically — only different reports diverge.
   */
  variantSeed: string
  /** RPT-002+ only */
  likelyApplicationType?: string
  risks?: ReportRisk[]
  missingInfo?: string[]
  /** RPT-003 only */
  documents?: ReportDocument[]
  complexityLevel?: 'Low' | 'Medium' | 'High'
  recommendedPackage?: string
}

export interface LeadRequestContent {
  tier: ReportTierId
  summaryLine: string
}

function confidenceCaveatFor(tier: ReportTierId, hasWarnings: boolean, seed: string): string {
  if (tier === 'RPT-001') {
    const variants = hasWarnings
      ? [
          "This is a quick read based on what you've told us, not a full check — confidence is low-to-medium until the fuller eligibility review looks at your exact plans.",
          "Treat this as a first pass, not a final check: confidence sits low-to-medium here, and firms up once the fuller eligibility review has looked at your exact plans.",
          "Based only on what you've shared so far, confidence is low-to-medium — a fuller eligibility review against your exact plans would sharpen this.",
        ]
      : [
          "This is a quick, general read — confidence is medium. A full check against your exact plans would firm this up.",
          "Confidence sits at medium for this quick, general read — a full check against your exact plans would tighten it up further.",
          "Take this as a general first look, confidence medium; a full check against your exact plans would confirm it.",
        ]
    return pickVariant(seed, 'caveat-001', variants)
  }
  const variants = hasWarnings
    ? [
        'Confidence: medium. The risks below are worth resolving before committing to drawings or a submission date.',
        'Confidence sits at medium — it is worth resolving the risks below before committing to drawings or a submission date.',
        'Confidence: medium. Work through the risks below before locking in drawings or a submission date.',
      ]
    : [
        'Confidence: medium-high, based on the constraints checked for this address and the answers given so far.',
        'Confidence: medium-high — this reflects the constraints checked for this address and the answers given so far.',
        'Based on the constraints checked here and the answers given so far, confidence sits medium-high.',
      ]
  return pickVariant(seed, 'caveat-paid', variants)
}

function complexityFor(constraints: ConstraintResult[], answers: TierAnswers): 'Low' | 'Medium' | 'High' {
  const warnings = constraints.filter(c => c.status === 'warning').length
  const majorScale = answers.projectScale === 'major'
  if (majorScale || warnings >= 2) return 'High'
  if (warnings === 1) return 'Medium'
  return 'Low'
}

function packageFor(complexity: 'Low' | 'Medium' | 'High'): string {
  if (complexity === 'High') return 'Consultant-managed full application'
  if (complexity === 'Medium') return 'Consultant review + document preparation'
  return 'Self-serve application pack with document checklist'
}

/** Turns one live planning.data.gov.uk dataset check into a plain-English line, e.g. doc1's "Outside Green Belt." / "Within an Air Quality Management Area." */
function describeConstraint(c: PlanningConstraint): string {
  if (!c.present) return `No ${c.label.toLowerCase()} recorded at this location.`
  // c.detail is the specific named entity (e.g. "Redbridge AQMA",
  // "Little Ilford Conservation Area") — leading with it reads far
  // better than repeating the category label first, e.g.
  // "Located within Redbridge AQMA." instead of the awkward, redundant
  // "Air quality (AQMA) — Redbridge AQMA."
  if (c.detail) return `Located within ${c.detail}.`
  return `Within a mapped ${c.label.toLowerCase()} area.`
}

interface LiveData {
  council: string
  constraints: ConstraintResult[]
  coordinates: { latitude: number; longitude: number }
}

/**
 * Calls the server-side proxy in front of postcodes.io + planning.data.gov.uk
 * (see /api/planning-check + lib/planningData.ts). Returns null — never
 * throws — on any failure, so the caller can fall back to the mock
 * cleanly instead of surfacing a raw fetch error mid-chat.
 */
async function fetchLiveData(postcode: string): Promise<LiveData | null> {
  try {
    const res = await fetch(`/api/planning-check?postcode=${encodeURIComponent(postcode)}`)
    if (!res.ok) return null
    const json = await res.json()
    const coords = json?.location?.coordinates
    if (!json?.location?.council || !Array.isArray(json?.constraints) || typeof coords?.latitude !== 'number') return null

    const constraints: ConstraintResult[] = json.constraints.map((c: PlanningConstraint) => ({
      label: c.label,
      status: c.status,
      detail: describeConstraint(c),
    }))

    return { council: json.location.council, constraints, coordinates: coords }
  } catch {
    return null
  }
}

export async function generateTieredReport(opts: {
  tier: ReportTierId
  answers: TierAnswers
  /** See TieredReportContent.variantSeed — defaults to a fresh random seed if omitted. */
  seed?: string
}): Promise<TieredReportContent> {
  const { tier, answers } = opts
  const seed = opts.seed ?? randomSeed()
  const rawPostcode = answers.postcode?.trim()
  const postcode = rawPostcode || 'the address provided'

  const live = rawPostcode ? await fetchLiveData(rawPostcode) : null
  const dataSource: 'live' | 'estimate' = live ? 'live' : 'estimate'
  const council = live?.council ?? councilFor(postcode)
  const constraints = live?.constraints ?? checkConstraints(postcode)
  const dataNote = live
    ? undefined
    : rawPostcode
    ? "We couldn't reach live planning data for this postcode just now, so the constraints below are a general estimate, not a check of this exact address — verify independently before relying on this."
    : 'No postcode was given, so the constraints below are a general estimate, not a check of a specific address.'

  const warnings = constraints.filter(c => c.status === 'warning')
  const hasWarnings = warnings.length > 0

  const route = hasWarnings
    ? {
        title: 'Planning application likely required',
        detail: `One or more constraints were found for ${postcode} that are likely to remove standard permitted development rights. ${warnings
          .map(w => w.label)
          .join(', ')}.`,
      }
    : {
        title: 'Likely permitted development',
        detail: `No constraint was found for ${postcode} that would remove permitted development rights for this type of work, subject to size and height limits.`,
      }

  const base: TieredReportContent = {
    tier,
    council,
    postcode,
    coordinates: live?.coordinates,
    route,
    constraintsChecked: constraints,
    confidenceCaveat: confidenceCaveatFor(tier, hasWarnings, seed),
    dataSource,
    dataNote,
    variantSeed: seed,
    whatToCheckNext: shuffleDeterministic(seed, 'checklist-001', [
      'Confirm your exact dimensions against permitted development size/height limits',
      'Check building regulations separately — these apply regardless of the planning route',
      hasWarnings
        ? "Review the specific constraint(s) above against your exact plans"
        : 'Consider a Lawful Development Certificate if you want written confirmation before starting',
    ]),
  }

  if (tier === 'RPT-001') return base

  // RPT-002 — likely application/licence type, key risks, missing info, next steps
  const full = generateReport({ actorId: 'homeowner', council, constraints, seed })
  const missingInfo: string[] = []
  if (answers.ownership === 'unsure') missingInfo.push('Confirmed ownership / leasehold status')
  if (answers.heritageAwareness === 'unsure') missingInfo.push('Confirmed conservation area / listed status')
  if (answers.access === 'unsure') missingInfo.push('Whether access or parking will change')
  if (answers.neighbourImpact === 'unsure') missingInfo.push('Impact on neighbouring boundaries')
  if (missingInfo.length === 0) missingInfo.push('Nothing critical missing — you can move straight to next steps')

  const rpt002: TieredReportContent = {
    ...base,
    likelyApplicationType: full.applicationType.title,
    risks: full.risks.slice(0, hasWarnings ? full.risks.length : 1),
    missingInfo,
    whatToCheckNext: [
      ...base.whatToCheckNext,
      'Resolve the missing information above before committing to a design',
    ],
  }

  if (tier === 'RPT-002') return rpt002

  // RPT-003 — deeper risk analysis, route options, document checklist,
  // complexity level, recommended package
  const complexity = complexityFor(constraints, answers)
  return {
    ...rpt002,
    risks: full.risks,
    documents: full.documents,
    complexityLevel: complexity,
    recommendedPackage: packageFor(complexity),
    whatToCheckNext: [
      ...rpt002.whatToCheckNext,
      `Recommended package: ${packageFor(complexity)}`,
    ],
  }
}

export function generateLeadSummary(tier: ReportTierId, answers: TierAnswers): LeadRequestContent {
  const works = answers.worksDescription || 'this project'
  return {
    tier,
    summaryLine:
      tier === 'RPT-004'
        ? `A consultant will review everything gathered so far on "${works}" and confirm the best route.`
        : `We'll put together a scoped proposal — stages, deliverables, quote and timeline — for "${works}".`,
  }
}