import type { ActorId } from '@/types'
import type { ConstraintResult } from './constraints'
import type { PdfDocumentInput } from './pdf'
import { pickVariant, shuffleDeterministic, randomSeed } from './variantSeed'

export interface ReportRisk {
  icon: string
  title: string
  detail: string
  severity: 'high' | 'medium'
}

export interface ReportDocument {
  title: string
  detail?: string
}

export interface ReportContent {
  applicationType: { title: string; detail: string }
  alternative: { title: string; detail: string }
  risks: ReportRisk[]
  documents: ReportDocument[]
  nextSteps: string[]
  consultantRecommended: boolean
}

const ACTOR_NOUN: Record<ActorId, string> = {
  homeowner:  'The property',
  landlord:   'The property',
  developer:  'The site',
  builder:    'The property',
  consultant: "Your client's property",
  architect:  "Your client's project",
  business:   'The property',
}

/**
 * generateReport
 * ────────────────
 * Mock stand-in for the real paid planning-eligibility report. Builds on
 * the same constraint-check inputs as `generateSnapshot`, but with the
 * fuller detail a paid report promises: a firm application type, a named
 * alternative route, itemised risks, a document checklist and concrete
 * next steps.
 *
 * API swap point: once a real report-generation endpoint exists, replace
 * the body with a fetch call using the same inputs.
 */
export function generateReport(opts: {
  actorId: ActorId
  council: string
  constraints: ConstraintResult[]
  /**
   * Deterministic seed (e.g. the project/report id) used to vary
   * wording and ordering slightly per report — see lib/variantSeed.ts.
   * Two people checking the same address get the same facts, but not
   * byte-identical documents. Defaults to a fresh random seed.
   */
  seed?: string
}): ReportContent {
  const { actorId, council, constraints } = opts
  const seed = opts.seed ?? randomSeed()
  const noun = ACTOR_NOUN[actorId] ?? 'The property'
  const warnings = constraints.filter(c => c.status === 'warning')
  const hasConservationArea = warnings.some(w => w.label.toLowerCase().includes('conservation'))
  const hasArticle4 = warnings.some(w => w.label.toLowerCase().includes('article 4'))
  const hasFlood = warnings.some(w => w.label.toLowerCase().includes('flood'))

  const risks: ReportRisk[] = []

  if (hasConservationArea) {
    risks.push({
      icon: '⚠',
      severity: 'high',
      title: 'Conservation area — design scrutiny is certain',
      detail: `${council} requires matching or complementary materials. Flat-roof or heavily glazed designs are frequently resisted — a pitched or sympathetic roofline is strongly recommended.`,
    })
  }
  if (hasArticle4) {
    risks.push({
      icon: '⚠',
      severity: 'high',
      title: 'Article 4 direction — permitted development removed',
      detail: `An Article 4 direction applies here, so standard permitted development rights don't apply. Works that would normally be exempt are likely to require an application.`,
    })
  }
  if (hasFlood) {
    risks.push({
      icon: '⚠',
      severity: 'medium',
      title: 'Flood zone — additional assessment may be required',
      detail: `The site falls within a flood risk zone. Depending on the works, a flood risk assessment may be requested as part of the application.`,
    })
  }
  risks.push({
    icon: '⚠',
    severity: 'medium',
    title: 'Neighbour impact — worth reviewing early',
    detail: pickVariant(seed, 'neighbour-impact', [
      'Windows, overlooking or boundary proximity can prompt objections. Considering obscure glazing or repositioning openings now reduces the risk of delay later.',
      'Objections most often come from overlooking, windows or boundary proximity. Repositioning openings or using obscure glazing now cuts the risk of delay later.',
      'Boundary proximity, overlooking and window placement are the usual triggers for neighbour objections — worth addressing with obscure glazing or repositioned openings before submission.',
    ]),
  })

  return {
    applicationType: hasConservationArea || hasArticle4
      ? {
          title: 'Householder Planning Application likely required',
          detail: `${noun} sits within an area where permitted development rights are restricted${
            hasConservationArea ? ' by a conservation area designation' : ' by an Article 4 direction'
          }. An application is likely required regardless of the works' size.`,
        }
      : {
          title: 'Likely permitted development — Lawful Development Certificate optional',
          detail: `No constraint was found that removes permitted development rights for ${noun.toLowerCase()}. Most works of this type can proceed without a planning application, subject to size and height limits.`,
        },
    alternative: {
      title: 'Alternative: Lawful Development Certificate (LDC)',
      detail: pickVariant(seed, 'alternative-detail', [
        'If formal written confirmation is wanted before starting work, an LDC may be appropriate. A consultant can advise which route best suits the circumstances.',
        'An LDC may suit if formal written confirmation is wanted before work starts — a consultant can advise on the best route for your circumstances.',
        'Where formal written confirmation before starting is preferred, an LDC is worth considering; a consultant can confirm which route fits best here.',
      ]),
    },
    risks,
    documents: [
      { title: 'Location plan (1:1250)', detail: 'Ordnance Survey-based, red-line boundary shown' },
      { title: 'Site plan (1:500)', detail: 'Showing the works footprint' },
      { title: 'Existing & proposed floor plans', detail: 'All affected levels' },
      { title: 'Existing & proposed elevations', detail: 'All affected sides' },
      ...(hasConservationArea
        ? [{ title: 'Design & access statement', detail: "Required for conservation area applications — must explain how the design respects the area's character" }]
        : []),
    ],
    // Wording varies per report; the ORDER stays fixed — these steps are sequential, not interchangeable.
    nextSteps: [
      pickVariant(seed, 'step-consultant', [
        'Book a planning consultant to confirm the route and review the design',
        'Speak with a planning consultant to confirm the route and review the design',
        'Have a planning consultant confirm the route and review the design',
      ]),
      pickVariant(seed, 'step-drawings', [
        'Commission drawings once the design is agreed',
        'Once the design is agreed, commission drawings',
        'Get drawings commissioned once the design is settled',
      ]),
      pickVariant(seed, 'step-submit', [
        `Submit the application — ${council}'s typical determination period is 8 weeks`,
        `Submit the application; ${council} typically determines within 8 weeks`,
        `Submit the application — expect roughly 8 weeks for ${council} to determine it`,
      ]),
    ],
    consultantRecommended: hasConservationArea || hasArticle4,
  }
}

/** Stable, human-readable reference for a generated report — used in the watermark, footer and UI. */
export function reportReference(id: string): string {
  return `RPT-${id.slice(-6).toUpperCase()}`
}

/**
 * Renders the "snapshot of the area" map page for the PDF, centred on
 * the property's real coordinates (see lib/staticMap.ts). Returns
 * undefined when no coordinates are available (e.g. dataSource was
 * 'estimate' and no live lookup succeeded) — callers should just omit
 * imagePages in that case rather than show a blank/wrong map.
 */
export async function buildAreaSnapshotImagePages(
  coordinates?: { latitude: number; longitude: number }
): Promise<PdfDocumentInput['imagePages']> {
  if (!coordinates) return undefined
  const { renderStaticMap } = await import('./staticMap')
  const map = await renderStaticMap({ center: coordinates })
  return [
    {
      heading: 'Snapshot of the area',
      description: 'Centred on the property, for reference alongside the constraint check above.',
      dataUrl: map.dataUrl,
      widthPx: map.widthPx,
      heightPx: map.heightPx,
      caption: '© OpenStreetMap contributors',
    },
  ]
}

/**
 * buildProjectReportPdfInput
 * ─────────────────────────────
 * Shared PDF shape for the project-based (paid) eligibility report,
 * used by both /dashboard/reports and /dashboard/new/[draftId]/report
 * so download output — including the watermark — stays consistent
 * wherever the report can be downloaded from.
 */
export function buildProjectReportPdfInput(opts: {
  projectId: string
  addressLine: string
  city: string
  postcode: string
  report: ReportContent
  /** Every constraint checked for this address (not just the ones that became risks) — shown as its own section so the reader can see the full picture, not just the warnings. */
  constraintsChecked?: ConstraintResult[]
  /** See ProjectAddress.dataSource — 'live' shows a one-line provenance note, 'estimate' shows the fuller caveat from dataNote. */
  dataSource?: 'live' | 'estimate'
  dataNote?: string
  /** Rendered map of the property (see lib/staticMap.ts) — adds a dedicated page when supplied. */
  imagePages?: PdfDocumentInput['imagePages']
  ownerName?: string
  ownerEmail?: string
}): PdfDocumentInput {
  const { projectId, addressLine, city, postcode, report, constraintsChecked, dataSource, dataNote, imagePages, ownerName, ownerEmail } = opts
  const ref = reportReference(projectId)
  const generatedAt = new Date().toLocaleString()

  const sections: PdfDocumentInput['sections'] = [
    {
      heading: 'Likely application type',
      paragraphs: [
        report.applicationType.title,
        report.applicationType.detail,
        report.alternative.title,
        report.alternative.detail,
      ],
    },
  ]

  if (constraintsChecked?.length) {
    sections.push({
      heading: 'Constraints checked at this address',
      paragraphs: [
        dataSource === 'live'
          ? `Checked live against postcodes.io and planning.data.gov.uk for ${postcode}.`
          : dataNote ?? 'General estimate — not a live check of this exact address.',
      ],
      items: constraintsChecked.map(c => ({
        label: c.label,
        detail: c.detail ?? (c.status === 'warning' ? 'Present at this location.' : 'Not recorded at this location.'),
        status: c.status,
      })),
    })
  }

  sections.push(
    {
      heading: 'Key risks for this property',
      bullets: report.risks.map(r => `${r.title}: ${r.detail}`),
    },
    {
      heading: 'Documents you will need',
      bullets: report.documents.map(d => `${d.title}${d.detail ? ` — ${d.detail}` : ''}`),
    },
    {
      heading: 'Recommended next steps',
      bullets: report.nextSteps,
    }
  )

  return {
    title: 'Planning eligibility report',
    subtitle: `${addressLine}, ${city} (${postcode}) · Ref: ${ref} · Generated ${generatedAt}`,
    note: dataSource === 'estimate' ? dataNote : undefined,
    sections,
    imagePages,
    footer: `AI4Planning — Planning eligibility report — ${ref}${ownerEmail ? ` — Prepared for ${ownerEmail}` : ''}`,
    watermark: ownerName || ownerEmail
      ? `AI4PLANNING · ${ownerName ?? ''}${ownerName && ownerEmail ? ' · ' : ''}${ownerEmail ?? ''} · ${ref} · NOT FOR REDISTRIBUTION`
      : undefined,
  }
}
