import type { ReportTierId, TierAnswers } from '@/types/reportTiers'
import type { TieredReportContent } from './reportContent'
import type { PdfDocumentInput } from './pdf'
import { getTierDef } from './reportTiers'
import { readAuthSession, isLoggedIn as hasSession } from './authSession'
import { renderStaticMap } from './staticMap'
import { createReportRemote, listMyReportsRemote, claimReportsRemote, unlockReportRemote } from '@/lib/api'

/**
 * reportStorage.ts
 * ──────────────────
 * Reports generate for free, no login required. Downloading (or seeing
 * it again in "My reports" after this browser tab closes) is what's
 * behind registration — so a report generated mid-chat is kept here,
 * client-side, as an instant-read cache, backed by a real /api/reports
 * (see reportsService.ts). Every write also fires a best-effort sync to
 * the server (works anonymously too — reportsService.createReport just
 * stores user_id null until claimed), and listMyReports() lazily pulls
 * the server's copy in the background, so admin/DB reflect reality
 * without any caller here having to become async.
 */

const STORAGE_KEY = 'pending_reports'

export interface PendingReport {
  id: string
  tier: ReportTierId
  answers: TierAnswers
  content: TieredReportContent
  createdAt: string
  /** Set once claimed (see claimPendingReports) — who this report belongs to. */
  ownerEmail?: string
  ownerName?: string
  /**
   * Set once a paid tier (RPT-002/003) has actually been paid for via
   * checkout (see the checkout page's fromReport handling). Until
   * then, isPaidTier(tier) alone would incorrectly show a purchased
   * report as still locked — this is the actual purchase signal.
   */
  unlockedAt?: string
}

function readAll(): PendingReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PendingReport[]) : []
  } catch {
    return []
  }
}

function writeAll(reports: PendingReport[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
    window.dispatchEvent(new CustomEvent('reports:changed'))
  } catch {
    // ignore quota/availability errors — download gate still works,
    // it just won't survive a refresh
  }
}

export function savePendingReport(input: {
  tier: ReportTierId
  answers: TierAnswers
  content: TieredReportContent
}): string {
  const id = `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const record: PendingReport = { id, createdAt: new Date().toISOString(), ...input }
  writeAll([...readAll(), record])
  // Fire-and-forget — works logged-out too (server ties it to the
  // account automatically if the accessToken cookie is present).
  void createReportRemote({ id, tier: input.tier, answers: input.answers, content: input.content })
  return id
}

export function getPendingReport(id: string): PendingReport | null {
  return readAll().find(r => r.id === id) ?? null
}

export function isLoggedIn(): boolean {
  return hasSession()
}

let hydrated = false

/** Pulls the server's copy of "my reports" in the background and merges it into the local cache — self-heals a cleared cache/new device. Safe to call repeatedly; only hits the network once per page load. */
function ensureHydrated(): void {
  if (hydrated) return
  const session = readAuthSession()
  if (!session) return
  hydrated = true

  listMyReportsRemote().then(({ data }) => {
    if (!data) return
    const local = readAll()
    const byId = new Map(local.map(r => [r.id, r]))
    for (const remote of data.reports) {
      byId.set(remote.id as string, remote as unknown as PendingReport)
    }
    writeAll(Array.from(byId.values()))
  }).catch(() => {
    // offline/network error — local cache still works, just try again next load
  })
}

/**
 * Called once, right after a successful login/signup (e.g. in the auth
 * success handler or on dashboard mount) — and defensively by
 * listMyReports() below. Stamps any reports generated anonymously in
 * this browser with the now-logged-in owner's name/email, so the
 * report — and every PDF downloaded from it — is tied to an account
 * rather than floating around as an anonymous, freely-copyable file.
 */
export function claimPendingReports(): PendingReport[] {
  const session = readAuthSession()
  const reports = readAll()
  if (!session) return reports

  let changed = false
  const unclaimedIds: string[] = []
  const claimed = reports.map(r => {
    if (r.ownerEmail) return r
    changed = true
    unclaimedIds.push(r.id)
    return { ...r, ownerEmail: session.email, ownerName: session.name }
  })

  if (changed) {
    writeAll(claimed)
    void claimReportsRemote(unclaimedIds)
  }
  return claimed
}

/** Reports belonging to the current session — auto-claims any unclaimed ones first. */
export function listMyReports(): PendingReport[] {
  const session = readAuthSession()
  if (!session) return []
  ensureHydrated()
  return claimPendingReports()
    .filter(r => r.ownerEmail?.toLowerCase() === session.email.toLowerCase())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Short, human-readable reference shown in the UI and baked into the watermark. */
export function reportSerial(report: PendingReport): string {
  return `RPT-${report.id.replace(/^rpt_/, '').slice(-8).toUpperCase()}`
}

/**
 * Whether a paid tier's full content should be shown unlocked.
 * isPaidTier(tier) alone only says the tier IS a paid product — this
 * is the actual "did they pay" signal, set by markReportUnlocked once
 * checkout succeeds.
 */
export function isReportUnlocked(id: string): boolean {
  return !!getPendingReport(id)?.unlockedAt
}

/** Called once checkout succeeds for a report that came from the chat funnel's paywall (see the checkout page's fromReport handling). */
export function markReportUnlocked(id: string): void {
  const all = readAll()
  const idx = all.findIndex(r => r.id === id)
  if (idx < 0) return
  const next = [...all]
  next[idx] = { ...next[idx], unlockedAt: new Date().toISOString() }
  writeAll(next)
  void unlockReportRemote(id)
}

/**
 * Whether the CURRENT session is allowed to download this report.
 * Re-check this at the moment of download, not just on page mount —
 * a session can expire or switch accounts while a tab stays open.
 */
export function canDownloadReport(report: PendingReport): boolean {
  const session = readAuthSession()
  if (!session) return false
  if (!report.ownerEmail) return true // not yet claimed — claim on the way to download
  return report.ownerEmail.toLowerCase() === session.email.toLowerCase()
}

export function reportToTextFile(report: PendingReport): string {
  const { content } = report
  const lines: string[] = []
  lines.push(`${report.tier} — Planning report`)
  lines.push(`Generated: ${new Date(report.createdAt).toLocaleString()}`)
  lines.push(`Council: ${content.council}`)
  lines.push(`Data source: ${content.dataSource === 'live' ? 'Live planning.data.gov.uk check' : 'General estimate'}`)
  lines.push('')
  lines.push(content.route.title)
  lines.push(content.route.detail)
  if (content.dataNote) lines.push(content.dataNote)
  lines.push('')
  lines.push('Constraints checked:')
  content.constraintsChecked.forEach(c => lines.push(`- ${c.detail ?? `${c.label} (${c.status})`}`))
  lines.push('')
  if (content.likelyApplicationType) {
    lines.push(`Likely application type: ${content.likelyApplicationType}`)
    lines.push('')
  }
  if (content.risks?.length) {
    lines.push('Risks:')
    content.risks.forEach(r => lines.push(`- ${r.title}: ${r.detail}`))
    lines.push('')
  }
  if (content.documents?.length) {
    lines.push('Documents likely needed:')
    content.documents.forEach(d => lines.push(`- ${d.title}${d.detail ? ` (${d.detail})` : ''}`))
    lines.push('')
  }
  if (content.complexityLevel) {
    lines.push(`Complexity: ${content.complexityLevel}`)
    lines.push(`Recommended package: ${content.recommendedPackage ?? ''}`)
    lines.push('')
  }
  lines.push('What to check next:')
  content.whatToCheckNext.forEach(step => lines.push(`- ${step}`))
  lines.push('')
  lines.push(content.confidenceCaveat)
  return lines.join('\n')
}

/**
 * Same content as reportToTextFile, shaped for downloadPdfDocument —
 * this is what the download button actually uses now, matching the
 * PDF the dashboard's own snapshot/report screens produce, instead of
 * a plain .txt file.
 *
 * Async because building the "Snapshot of your area" map page
 * (see lib/staticMap.ts) requires fetching + compositing tile images —
 * both current callers (ReportDownloadGate, reportStorage's own
 * export path) already await downloadPdfDocument(...), so this just
 * needs to be awaited one step earlier.
 */
export async function reportToPdfInput(report: PendingReport): Promise<PdfDocumentInput> {
  const { content } = report
  const tierDef = getTierDef(report.tier)

  const sections: PdfDocumentInput['sections'] = [
    {
      heading: 'Likely planning route',
      paragraphs: content.dataNote
        ? [content.route.title, content.route.detail, content.dataNote]
        : [content.route.title, content.route.detail],
    },
    {
      heading: 'Constraint status (RAG)',
      items: content.constraintsChecked.map(c => ({
        label: c.label,
        detail: c.detail ?? (c.status === 'warning' ? `${c.label} recorded at this location.` : `No ${c.label.toLowerCase()} recorded at this location.`),
        status: c.status === 'warning' ? 'warning' : 'clear',
      })),
    },
  ]

  if (content.likelyApplicationType) {
    sections.push({
      heading: 'Likely application type',
      paragraphs: [content.likelyApplicationType],
    })
  }

  if (content.risks?.length) {
    sections.push({
      heading: 'Risks',
      bullets: content.risks.map(r => `${r.title}: ${r.detail}`),
    })
  }

  if (content.missingInfo?.length) {
    sections.push({ heading: 'Missing information', bullets: content.missingInfo })
  }

  if (content.documents?.length) {
    sections.push({
      heading: "Documents you'll likely need",
      bullets: content.documents.map(d => (d.detail ? `${d.title} — ${d.detail}` : d.title)),
    })
  }

  if (content.complexityLevel) {
    sections.push({
      heading: 'Complexity & recommended package',
      paragraphs: [`${content.complexityLevel} complexity — ${content.recommendedPackage ?? ''}`],
    })
  }

  sections.push({ heading: 'What to check next', bullets: content.whatToCheckNext })

  const serial = reportSerial(report)
  const owner = readAuthSession()
  const ownerLabel = owner ? `${owner.name} (${owner.email})` : undefined
  const dataSourceLabel = content.dataSource === 'live' ? 'Live planning.data.gov.uk check' : 'General estimate'

  const coordsLine = content.coordinates
    ? `${content.coordinates.latitude.toFixed(6)}, ${content.coordinates.longitude.toFixed(6)} · `
    : ''

  // Real map, only when we actually have coordinates to centre it on —
  // an 'estimate' report has nothing genuine to plot, so it gets no
  // map page at all rather than a fake/generic one.
  let imagePages: PdfDocumentInput['imagePages']
  if (content.coordinates) {
    try {
      const map = await renderStaticMap({ center: content.coordinates })
      imagePages = [
        {
          heading: 'Snapshot of your area',
          description: `Live map centred on ${content.postcode}. Map tiles © OpenStreetMap contributors.`,
          dataUrl: map.dataUrl,
          widthPx: map.widthPx,
          heightPx: map.heightPx,
          caption: 'Map data © OpenStreetMap contributors',
        },
      ]
    } catch {
      // Map tiles failed to load (offline, tile server down, etc.) —
      // skip the page rather than blocking the whole PDF download.
    }
  }

  return {
    title: `${tierDef.name} — Planning report`,
    subtitle: [
      `${coordsLine}${content.postcode} · ${content.council}`,
      `Report ref: ${serial} · Generated: ${new Date(report.createdAt).toLocaleString()} · ${dataSourceLabel}`,
    ],
    note: content.confidenceCaveat,
    sections,
    imagePages,
    footer: `AI4Planning · Not a substitute for formal pre-application advice. Verify independently before any planning decision or transaction. Data: planning.data.gov.uk, postcodes.io, OpenStreetMap. Ref: ${serial}${owner ? ` · Prepared for ${owner.email}` : ''}`,
    watermark: owner
      ? `AI4PLANNING · ${ownerLabel} · ${serial} · NOT FOR REDISTRIBUTION`
      : `AI4PLANNING · ${serial} · UNCLAIMED PREVIEW`,
  }
}