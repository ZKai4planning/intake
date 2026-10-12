'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'
import { listProjects, type Project } from '@/lib/projects'

/**
 * RecentReportsWidget
 * ─────────────────────
 * Preview of the user's most recent submitted applications ("reports"),
 * backed by the same project store as the Active Projects widget and
 * the full /dashboard/reports page. Previously this was two hardcoded
 * rows with no relationship to real data.
 */
export function RecentReportsWidget({ className }: { className?: string }) {
  const { guardedNavigate } = useUnsavedChangesGuard()
  const [reports, setReports] = useState<Project[] | null>(null)

  useEffect(() => {
    function refresh() {
      setReports(listProjects().filter(p => p.status === 'submitted').slice(0, 4))
    }
    refresh()
    window.addEventListener('projects:changed', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('projects:changed', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return (
    <div className={cn('rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-[#E8F0FF]">Recent reports</h3>
        <button
          onClick={() => guardedNavigate('/dashboard/reports')}
          className="text-[12px] text-[#135BEC] hover:text-[#2A6BF0] font-medium"
        >
          View all
        </button>
      </div>

      {reports === null ? (
        <div className="space-y-2">
          {[0, 1].map(i => <div key={i} className="h-[44px] rounded-[8px] bg-white/[0.03] animate-pulse" />)}
        </div>
      ) : reports.length === 0 ? (
        <p className="text-[12.5px] text-[#5A6A8A] text-center py-4">
          Submitted applications will appear here as reports.
        </p>
      ) : (
        <div className="space-y-2">
          {reports.map(r => (
            <div
              key={r.id}
              onClick={() => guardedNavigate('/dashboard/reports')}
              className="flex items-center gap-3 p-2.5 rounded-[8px] hover:bg-white/[0.03] cursor-pointer transition-colors"
            >
              <span className="text-[#135BEC] shrink-0" aria-hidden="true">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] text-[#E8F0FF] truncate">{r.title}</p>
                <p className="text-[11px] text-[#5A6A8A] truncate">{r.tier} application</p>
              </div>
              <span className="text-[10.5px] text-[#5A6A8A] shrink-0">{formatRelativeDate(r.submittedAt ?? r.updatedAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatRelativeDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffDays = Math.round(diffMs / 86400000)
  if (diffDays < 1) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays}d ago`
}
