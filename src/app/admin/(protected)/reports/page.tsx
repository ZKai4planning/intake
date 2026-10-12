'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { listAdminReports, type AdminReportRow } from '@/lib/adminApi'

const PAGE_SIZE = 25

export default function AdminReportsPage() {
  const [page, setPage] = useState(1)
  const [followUpOnly, setFollowUpOnly] = useState(false)
  const [reports, setReports] = useState<AdminReportRow[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    listAdminReports(
      followUpOnly ? { status: 'incomplete' } : { page, limit: PAGE_SIZE }
    ).then(({ data, error: apiError }) => {
      if (apiError || !data) {
        setError(apiError ?? 'Failed to load reports.')
        return
      }
      setError('')
      setReports(data.reports)
      setTotal(data.total)
    })
  }, [page, followUpOnly])

  const totalPages = followUpOnly ? 1 : Math.max(Math.ceil(total / PAGE_SIZE), 1)

  return (
    <div>
      <h1 className="font-display text-[22px] text-[#E8F0FF] mb-1">Reports</h1>
      <p className="text-[13px] text-[#5A6A8A] mb-5">
        {total.toLocaleString()} {followUpOnly ? 'needing follow-up' : 'total'}
        {total === 0 && !followUpOnly && ' — nothing here yet; the report-generation module that creates these rows hasn\'t been ported.'}
      </p>

      <label className="mb-4 inline-flex items-center gap-2 text-[13px] text-[#A8B8D8] cursor-pointer select-none">
        <input
          type="checkbox"
          checked={followUpOnly}
          onChange={e => { setFollowUpOnly(e.target.checked); setPage(1) }}
          className="h-3.5 w-3.5 rounded border-white/[0.2] bg-[#0A0E1A] accent-[#135BEC]"
        />
        Only show stalled checkouts (paid report generated, never unlocked)
      </label>

      {error && <p className="text-[13px] text-[#F87171] mb-4">{error}</p>}

      <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.08] text-[11.5px] uppercase tracking-wide text-[#5A6A8A]">
              <th className="px-4 py-3 font-medium">Report ID</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-[12.5px] text-[#E8F0FF] font-mono">{r.id}</td>
                <td className="px-4 py-3 text-[13.5px] text-[#A8B8D8]">{r.tier}</td>
                <td className="px-4 py-3 text-[13.5px]">
                  {r.userId ? (
                    <Link href={`/admin/users/${r.userId}`} className="text-[#E8F0FF] hover:text-[#135BEC] font-medium">
                      {r.ownerName || '(no name)'}
                    </Link>
                  ) : (
                    <span className="text-[#A8B8D8]">{r.ownerName ?? '—'}</span>
                  )}
                  {r.ownerEmail && <p className="text-[11.5px] text-[#5A6A8A]">{r.ownerEmail}</p>}
                </td>
                <td className="px-4 py-3">
                  {r.unlockedAt ? (
                    <span className="text-[11.5px] font-medium px-2 py-0.5 rounded-full bg-[rgba(52,211,153,0.12)] text-[#34D399]">unlocked</span>
                  ) : r.needsFollowUp ? (
                    <span className="text-[11.5px] font-medium px-2 py-0.5 rounded-full bg-[rgba(251,191,36,0.12)] text-[#FBBF24]" title="Paid tier report generated, checkout never completed">
                      needs follow-up
                    </span>
                  ) : (
                    <span className="text-[11.5px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A8B8D8]">free tier</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[13px] text-[#5A6A8A]">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[13px] text-[#5A6A8A]">No reports found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-[8px] text-[13px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF] hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">← Prev</button>
          <span className="text-[13px] text-[#5A6A8A]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page >= totalPages} className="px-3 py-1.5 rounded-[8px] text-[13px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF] hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Next →</button>
        </div>
      )}
    </div>
  )
}
