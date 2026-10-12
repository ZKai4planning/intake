'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { DashboardShell } from '@/components/dashboard/Dashboardshell'
import { useWorkspace } from '@/hooks/Useworkspace'
import { getProject, type Project } from '@/lib/projects'
import { generateReport, buildProjectReportPdfInput, buildAreaSnapshotImagePages } from '@/lib/report'
import { downloadPdfDocument } from '@/lib/pdf'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'

/**
 * /dashboard/projects/[id]
 * ──────────────────────────
 * Read-only detail view for a single submitted project — the "what
 * happens next" screen that was missing after a consultation booking.
 * Reachable by clicking a submitted row in the Active Projects widget.
 *
 * Shows a status timeline (submitted → address checked → report
 * purchased → consultation booked), a "next steps" callout for
 * whichever stage isn't done yet, and every update recorded against
 * the project so far. Drafts don't land here — they still resume
 * straight into the intake form at /dashboard/new/[id].
 */
export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { isLoading, session, workspace, firstName } = useWorkspace()
  const { show } = useToast()
  const id = params.id

  const [project, setProject] = useState<Project | null | undefined>(undefined)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    setProject(getProject(id))
    function refresh() { setProject(getProject(id)) }
    window.addEventListener('projects:changed', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('projects:changed', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [id])

  if (isLoading || project === undefined) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#5A6A8A]">
          <Spinner />
          Loading project…
        </div>
      </div>
    )
  }

  if (!session || !workspace) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
        <div className="text-center max-w-[360px]">
          <p className="font-display text-2xl text-[#E8F0FF] mb-2">No active session</p>
          <p className="text-[13px] text-[#5A6A8A] mb-6">Please log in to view this project.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-sm font-semibold hover:bg-[#2A6BF0] transition-colors"
          >
            Go to login →
          </button>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <DashboardShell workspace={workspace} firstName={firstName} email={session.email}>
        <div className="text-center py-20">
          <p className="text-[14px] text-[#E8F0FF] font-medium mb-1.5">Project not found</p>
          <p className="text-[12.5px] text-[#5A6A8A] mb-5">
            It may have been deleted, or the link is out of date.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[12.5px] px-4 py-2.5 rounded-[8px] bg-[#135BEC] text-white font-semibold hover:bg-[#2A6BF0] transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </DashboardShell>
    )
  }

  // A draft has no next-step detail to show yet — send it back into the form.
  if (project.status === 'draft') {
    if (typeof window !== 'undefined') router.replace(`/dashboard/new/${project.id}`)
    return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
  }

  const hasAddress = Boolean(project.address && project.constraints)
  const hasPurchase = Boolean(project.purchase)
  const hasBooking = Boolean(project.consultantBooking)

  const addressHref = `/dashboard/new/${project.id}/address`
  const checkoutHref = `/dashboard/new/${project.id}/checkout`
  const reportHref = `/dashboard/new/${project.id}/report`
  const consultantHref = `/dashboard/new/${project.id}/consultant`

  const steps: TimelineStep[] = [
    {
      label: 'Application submitted',
      detail: `${capitalize(project.tier)} application · ${project.answeredCount} of ${project.totalCount} questions answered`,
      done: true,
      date: project.submittedAt ?? project.createdAt,
    },
    {
      label: 'Property & planning checks',
      detail: hasAddress
        ? `${project.address!.line1}, ${project.address!.city} (${project.address!.postcode})`
        : 'Add your property address to run a planning constraint check.',
      done: hasAddress,
      cta: { label: hasAddress ? 'Edit address →' : 'Add address →', href: addressHref },
    },
    {
      label: 'Eligibility report',
      detail: hasPurchase
        ? `Purchased · £${project.purchase!.total.toFixed(2)}`
        : 'Buy the full eligibility report for a firm application type and document checklist.',
      done: hasPurchase,
      date: project.purchase?.paidAt,
      cta: !hasAddress
        ? { label: 'Add address first →', href: addressHref }
        : hasPurchase
          ? { label: 'View report →', href: reportHref }
          : { label: 'Get eligibility report →', href: checkoutHref },
    },
    {
      label: 'Consultation booked',
      detail: hasBooking
        ? bookingSummary(project)
        : 'Book a 60-minute call with a planning consultant to confirm next steps.',
      done: hasBooking,
      date: project.consultantBooking?.bookedAt,
      cta: !hasAddress
        ? { label: 'Add address first →', href: addressHref }
        : { label: hasBooking ? 'Manage booking →' : 'Book a consultation →', href: consultantHref },
    },
  ]

  const nextStep = steps.find(s => !s.done)

  const updates = buildUpdates(project).sort((a, b) => b.date.localeCompare(a.date))

  async function handleDownload() {
    if (!project) return
    setDownloading(true)
    try {
      const ref = `RPT-${project.id.slice(-6).toUpperCase()}`
      const generatedOn = new Date(project.submittedAt ?? project.updatedAt).toLocaleString()

      if (project.address && project.constraints) {
        const report = generateReport({
          actorId: project.actorId,
          council: project.address.council,
          constraints: project.constraints,
        })
        const coordinates = typeof project.address.latitude === 'number' && typeof project.address.longitude === 'number'
          ? { latitude: project.address.latitude, longitude: project.address.longitude }
          : undefined
        await downloadPdfDocument(
          `planning-report-${project.id}.pdf`,
          buildProjectReportPdfInput({
            projectId: project.id,
            addressLine: project.address.line1,
            city: project.address.city,
            postcode: project.address.postcode,
            report,
            constraintsChecked: project.constraints,
            dataSource: project.address.dataSource,
            dataNote: project.address.dataNote,
            imagePages: await buildAreaSnapshotImagePages(coordinates),
          })
        )
      } else {
        await downloadPdfDocument(`report-summary-${project.id}.pdf`, {
          title: project.title,
          subtitle: `Ref: ${ref} · Generated ${generatedOn}`,
          sections: [{
            heading: 'Application summary',
            paragraphs: [
              `${capitalize(project.tier)} application, submitted ${formatDate(project.submittedAt ?? project.updatedAt)}.`,
              `${project.answeredCount} of ${project.totalCount} questions answered.`,
            ],
          }],
          footer: `AI4Planning — ${ref}`,
        })
      }
      show('Report downloaded.', 'success')
    } catch {
      show("Couldn't generate the PDF — please try again.", 'error')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <DashboardShell workspace={workspace} firstName={firstName} email={session.email}>
      <button
        onClick={() => router.push('/dashboard')}
        className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
      >
        ← Back to dashboard
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
        <div className="min-w-0">
          <h1 className="font-display text-[24px] sm:text-[28px] font-normal text-[#E8F0FF] tracking-tight truncate">
            {project.title}
          </h1>
          <p className="text-[13px] text-[#A8B8D8] mt-1">
            {capitalize(project.tier)} application · Ref RPT-{project.id.slice(-6).toUpperCase()} · submitted {formatDate(project.submittedAt ?? project.createdAt)}
          </p>
        </div>
        <span className="shrink-0 text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-[rgba(19,91,236,0.1)] text-[#135BEC]">
          {hasBooking ? 'Consultation booked' : 'Submitted'}
        </span>
      </div>

      {/* ── Next step callout ─────────────────────────────────── */}
      {nextStep ? (
        <div className="rounded-[14px] border border-[#00D4FF]/30 bg-[rgba(0,212,255,0.06)] p-4 mb-6 flex items-start gap-3.5">
          <span className="text-[#00D4FF] shrink-0 mt-0.5" aria-hidden="true">ℹ</span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#E8F0FF]">Next step: {nextStep.label}</p>
            <p className="text-[12.5px] text-[#A8B8D8] mt-0.5 leading-relaxed">{nextStep.detail}</p>
          </div>
          {nextStep.cta && (
            <button
              onClick={() => router.push(nextStep.cta!.href)}
              className="shrink-0 text-[12px] font-semibold px-3.5 py-2 rounded-[8px] bg-[#135BEC] text-white hover:bg-[#2A6BF0] transition-colors whitespace-nowrap"
            >
              {nextStep.cta.label}
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-[14px] border border-[#135BEC]/30 bg-[rgba(19,91,236,0.06)] p-4 mb-6 flex items-start gap-3.5">
          <span className="text-[#135BEC] shrink-0 mt-0.5" aria-hidden="true">✓</span>
          <div>
            <p className="text-[13px] font-semibold text-[#E8F0FF]">You&rsquo;re all set</p>
            <p className="text-[12.5px] text-[#A8B8D8] mt-0.5 leading-relaxed">
              Every step is complete — your consultant has your report and will be in touch ahead of the call.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
        {/* ── Timeline ─────────────────────────────────────────── */}
        <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5">
          <h2 className="text-[13.5px] font-semibold text-[#E8F0FF] mb-4">Status</h2>
          <ol className="space-y-0">
            {steps.map((step, i) => (
              <li key={step.label} className="relative pl-7 pb-6 last:pb-0">
                {i !== steps.length - 1 && (
                  <span
                    className={cn(
                      'absolute left-[9px] top-[18px] bottom-0 w-px',
                      step.done ? 'bg-[#135BEC]/40' : 'bg-white/[0.08]'
                    )}
                  />
                )}
                <span
                  className={cn(
                    'absolute left-0 top-0.5 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center text-[10px]',
                    step.done
                      ? 'bg-[#135BEC] border-[#135BEC] text-white'
                      : nextStep === step
                        ? 'border-[#00D4FF] text-[#00D4FF]'
                        : 'border-white/[0.15] text-transparent'
                  )}
                >
                  {step.done ? '✓' : ''}
                </span>
                <p className={cn('text-[13px] font-medium', step.done ? 'text-[#E8F0FF]' : 'text-[#A8B8D8]')}>
                  {step.label}
                </p>
                <p className="text-[12px] text-[#5A6A8A] mt-0.5 leading-relaxed">{step.detail}</p>
                {step.date && (
                  <p className="text-[11px] text-[#5A6A8A]/80 mt-1">{formatDate(step.date)}</p>
                )}
                {step.cta && (
                  <button
                    type="button"
                    onClick={() => router.push(step.cta!.href)}
                    className={cn(
                      'mt-2 text-[12px] font-semibold px-3 py-1.5 rounded-[8px] transition-colors',
                      step.done
                        ? 'text-[#A8B8D8] border border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF]'
                        : 'bg-[#135BEC] text-white hover:bg-[#2A6BF0]'
                    )}
                  >
                    {step.cta.label}
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* ── Side column: booking + report + updates ─────────── */}
        <div className="space-y-4">
          {hasBooking && (
            <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5">
              <h2 className="text-[13.5px] font-semibold text-[#E8F0FF] mb-3">Consultation</h2>
              <p className="text-[12.5px] text-[#A8B8D8] leading-relaxed">
                {project.consultantBooking!.date
                  ? `${formatDate(project.consultantBooking!.date)} · ${project.consultantBooking!.time}`
                  : project.consultantBooking!.time}
              </p>
              {project.consultantBooking!.notes && (
                <p className="text-[12px] text-[#5A6A8A] mt-2 leading-relaxed">
                  &ldquo;{project.consultantBooking!.notes}&rdquo;
                </p>
              )}
              <p className="text-[11px] text-[#5A6A8A]/80 mt-2">
                Booked {formatDate(project.consultantBooking!.bookedAt)} · confirmation &amp; video link sent by email
              </p>
              <button
                type="button"
                onClick={() => router.push(consultantHref)}
                className="mt-3 text-[12px] font-medium px-3.5 py-2 rounded-[8px] border border-white/[0.12] text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors"
              >
                Change booking →
              </button>
            </div>
          )}

          {(hasAddress || hasPurchase) && (
            <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5">
              <h2 className="text-[13.5px] font-semibold text-[#E8F0FF] mb-3">Report</h2>
              <p className="text-[12.5px] text-[#A8B8D8] mb-3 leading-relaxed">
                {hasPurchase
                  ? 'Your eligibility report is ready to download.'
                  : 'A summary of your submission is available to download.'}
              </p>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className={cn(
                  'text-[12px] font-medium px-3.5 py-2 rounded-[8px] border transition-colors',
                  downloading
                    ? 'text-[#5A6A8A] border-white/[0.08] cursor-not-allowed'
                    : 'text-[#A8B8D8] border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF]'
                )}
              >
                {downloading ? 'Preparing…' : 'Download PDF'}
              </button>
            </div>
          )}

          <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5">
            <h2 className="text-[13.5px] font-semibold text-[#E8F0FF] mb-3">Updates</h2>
            {updates.length === 0 ? (
              <p className="text-[12px] text-[#5A6A8A]">No updates yet.</p>
            ) : (
              <ul className="space-y-3">
                {updates.map(u => (
                  <li key={u.label} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#135BEC] mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12.5px] text-[#E8F0FF]">{u.label}</p>
                      <p className="text-[11px] text-[#5A6A8A]">{formatDate(u.date)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

interface TimelineStep {
  label: string
  detail: string
  done: boolean
  date?: string
  cta?: { label: string; href: string }
}

interface UpdateEntry {
  label: string
  date: string
}

function buildUpdates(project: Project): UpdateEntry[] {
  const updates: UpdateEntry[] = [{ label: 'Application created', date: project.createdAt }]
  if (project.submittedAt) updates.push({ label: 'Application submitted', date: project.submittedAt })
  if (project.address) updates.push({ label: `Address added · ${project.address.postcode}`, date: project.updatedAt })
  if (project.purchase) updates.push({ label: `Eligibility report purchased · £${project.purchase.total.toFixed(2)}`, date: project.purchase.paidAt })
  if (project.consultantBooking) updates.push({ label: 'Consultation booked', date: project.consultantBooking.bookedAt })
  return updates
}

function bookingSummary(project: Project): string {
  const b = project.consultantBooking!
  return b.date ? `${formatDate(b.date)} · ${b.time}` : b.time
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}