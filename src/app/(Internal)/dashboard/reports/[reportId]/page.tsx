'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, FileText } from 'lucide-react'

import { useWorkspace } from '@/hooks/Useworkspace'
import { DashboardShell } from '@/components/dashboard/Dashboardshell'
import { ReportCard } from '@/components/home/ReportCard'
import { getPendingReport, claimPendingReports, type PendingReport } from '@/lib/reportStorage'
import { getTierDef } from '@/lib/reportTiers'

/**
 * /dashboard/reports/[reportId]
 * ─────────────────────────────────
 * Dedicated landing page for a single free/tiered chat report — the
 * free-tier counterpart to /dashboard/new/[draftId]/report, which is
 * where a PAID project report lands once checkout succeeds. Logging
 * in from the chat funnel's download gate (see ReportDownloadGate)
 * returns here so the person lands directly on the report they just
 * generated and can download it right away, instead of being routed
 * into the intake/application flow.
 *
 * Claims the report to the current session on arrival — same as
 * listMyReports() does for the reports list — in case this is the
 * very first dashboard page hit right after verifying.
 */
export default function SingleReportPage() {
  const params = useParams<{ reportId: string }>()
  const router = useRouter()
  const { isLoading, session, workspace, firstName } = useWorkspace()

  const [report, setReport] = useState<PendingReport | null | undefined>(undefined)

  useEffect(() => {
    claimPendingReports()
    setReport(getPendingReport(params.reportId))
  }, [params.reportId])

  if (isLoading || report === undefined) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <p className="text-[13px] text-[#5A6A8A]">Loading your report…</p>
      </div>
    )
  }

  if (!session || !workspace) {
    const returnTo = `/dashboard/reports/${params.reportId}`
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
        <div className="text-center max-w-[360px]">
          <p className="font-display text-2xl text-[#E8F0FF] mb-2">No active session</p>
          <p className="text-[13px] text-[#5A6A8A] mb-6">Please log in to view this report.</p>
          <button
            onClick={() =>
              router.push(`/login?report=${params.reportId}&returnTo=${encodeURIComponent(returnTo)}`)
            }
            className="px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-sm font-semibold hover:bg-[#2A6BF0] transition-colors"
          >
            Go to login →
          </button>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <DashboardShell workspace={workspace} firstName={firstName} email={session.email}>
        <div className="rounded-[14px] border border-dashed border-white/[0.12] bg-[#0F1525] px-6 py-16 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-[#00D4FF] mb-4">
            <FileText className="h-5 w-5" />
          </span>
          <p className="text-[15px] font-semibold text-[#E8F0FF] mb-1.5">Report not found</p>
          <p className="text-[13px] text-[#5A6A8A] max-w-[380px] mb-6">
            This report isn't in this browser, or it belongs to a different account.
          </p>
          <button
            onClick={() => router.push('/dashboard/reports')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] transition-colors"
          >
            Back to reports
          </button>
        </div>
      </DashboardShell>
    )
  }

  const tierDef = getTierDef(report.tier)

  return (
    <DashboardShell workspace={workspace} firstName={firstName} email={session.email}>
      <button
        onClick={() => router.push('/dashboard/reports')}
        className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to reports
      </button>

      <div className="mb-6">
        <h1 className="font-display text-[26px] sm:text-[30px] font-normal text-[#E8F0FF] tracking-tight">
          {tierDef.name}
        </h1>
        <p className="text-[13.5px] text-[#A8B8D8] mt-1">
          Generated {new Date(report.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="max-w-[560px]">
        <ReportCard reportId={report.id} tier={report.tier} content={report.content} />
      </div>
    </DashboardShell>
  )
}