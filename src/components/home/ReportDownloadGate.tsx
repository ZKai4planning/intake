'use client'

import { useEffect, useState } from 'react'
import { Lock, Download, ShieldAlert } from 'lucide-react'
import { getPendingReport, isLoggedIn, reportToPdfInput, claimPendingReports, canDownloadReport } from '@/lib/reportStorage'
import { downloadPdfDocument } from '@/lib/pdf'
import { useToast } from '@/components/ui/Toast'

interface ReportDownloadGateProps {
  reportId: string
}

type GateState = 'checking' | 'unauthenticated' | 'wrong-account' | 'ready'

/**
 * ReportDownloadGate
 * ─────────────────────
 * Every tiered report generates for free, no login. This is the one
 * gate: downloading (and having it saved to "My reports") needs an
 * account. There's no separate signup step — the person goes straight
 * to /login (email OTP creates the account on first use), carrying
 * ?report=<id> and a returnTo of /dashboard/reports/<id> — the
 * dedicated single-report page (app/(Internal)/dashboard/reports/
 * [reportId]/page.tsx) — so they land straight on the report they
 * generated and can download it, instead of being dropped into the
 * intake/application flow. claimPendingReports() picks up the
 * anonymous report on arrival — see lib/reportStorage.ts.
 *
 * Ownership is re-checked at the moment of download (not just cached
 * from mount) so a report generated under one account can't be
 * downloaded from a different, currently-logged-in session — and the
 * PDF itself carries a watermark tying the file to whoever downloaded
 * it, so a copy that does leak is traceable.
 */
export function ReportDownloadGate({ reportId }: ReportDownloadGateProps) {
  const [state, setState] = useState<GateState>('checking')
  const [isDownloading, setIsDownloading] = useState(false)
  const { show } = useToast()

  useEffect(() => {
    if (!isLoggedIn()) {
      setState('unauthenticated')
      return
    }
    const report = getPendingReport(reportId)
    if (report && !canDownloadReport(report)) {
      setState('wrong-account')
      return
    }
    setState('ready')
  }, [reportId])

  if (state === 'ready') {
    return (
      <button
        type="button"
        disabled={isDownloading}
        onClick={async () => {
          // Re-verify fresh — don't trust the state set on mount.
          if (!isLoggedIn()) {
            setState('unauthenticated')
            show('Please sign in to download this report.', 'error')
            return
          }
          claimPendingReports() // stamps ownership if this report was still anonymous
          const report = getPendingReport(reportId)
          if (!report) return
          if (!canDownloadReport(report)) {
            setState('wrong-account')
            show('This report belongs to a different account.', 'error')
            return
          }
          setIsDownloading(true)
          try {
            const pdfInput = await reportToPdfInput(report)
            await downloadPdfDocument(`${report.tier}-planning-report.pdf`, pdfInput)
          } finally {
            setIsDownloading(false)
          }
        }}
        className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#135BEC] px-4 py-2.5 sm:py-2 text-[12.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors disabled:opacity-60"
      >
        <Download className="h-3.5 w-3.5" />
        {isDownloading ? 'Preparing PDF…' : 'Download report'}
      </button>
    )
  }

  if (state === 'wrong-account') {
    return (
      <div className="mt-3 flex items-start sm:items-center gap-2.5 rounded-xl border border-amber-400/25 bg-amber-500/[0.06] px-3.5 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
          <ShieldAlert className="h-3.5 w-3.5" />
        </span>
        <p className="text-[12.5px] text-[#A8B8D8] leading-relaxed">
          This report was generated under a different account. Sign in with that account to download it.
        </p>
      </div>
    )
  }

  if (state === 'checking') return null

  return (
    <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-blue-400/25 bg-blue-500/[0.06] px-3.5 py-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[#00D4FF]">
          <Lock className="h-3.5 w-3.5" />
        </span>
        <p className="text-[12.5px] text-[#A8B8D8]">
          Log in to download this report and save it to your dashboard.
        </p>
      </div>
      <a
        href={`/login?report=${reportId}&returnTo=${encodeURIComponent(`/dashboard/reports/${reportId}`)}`}
        className="shrink-0 w-full sm:w-auto text-center rounded-full bg-[#135BEC] px-4 py-2.5 sm:py-2 text-[12.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors"
      >
        Log in
      </a>
    </div>
  )
}