'use client'

import { useEffect, useState } from 'react'
import { FileText, Send, CreditCard, UserCheck, Sparkles, Unlock, ClipboardCheck } from 'lucide-react'
import { listProjects } from '@/lib/projects'
import { listMyReports } from '@/lib/reportStorage'
import { getEligibility } from '@/lib/eligibility'

interface ActivityEvent {
  id: string
  at: string
  label: string
  detail: string
  icon: typeof FileText
  color: string
}

/**
 * ActivityLogWidget
 * ───────────────────
 * A single chronological feed across BOTH systems this dashboard
 * tracks — application/project events (lib/projects.ts) and the free
 * chat-tier reports (lib/reportStorage.ts) — so there's one place to
 * see "what's happened" instead of hunting through each section.
 *
 * Purely derived: no separate event log is persisted, this just reads
 * the timestamps already on Project/PendingReport records and sorts
 * them. Refreshes on the same 'projects:changed' / 'reports:changed'
 * events the rest of the dashboard already listens for.
 */
export function ActivityLogWidget() {
  const [events, setEvents] = useState<ActivityEvent[] | null>(null)

  useEffect(() => {
    function refresh() {
      const list: ActivityEvent[] = []

      for (const p of listProjects()) {
        list.push({
          id: `${p.id}-created`,
          at: p.createdAt,
          label: 'Application started',
          detail: p.title,
          icon: FileText,
          color: '#5A6A8A',
        })
        if (p.submittedAt) {
          list.push({
            id: `${p.id}-submitted`,
            at: p.submittedAt,
            label: 'Application submitted',
            detail: p.title,
            icon: Send,
            color: '#00D4FF',
          })
        }
        if (p.purchase) {
          list.push({
            id: `${p.id}-paid`,
            at: p.purchase.paidAt,
            label: 'Report purchased',
            detail: `${p.title} · £${p.purchase.total}`,
            icon: CreditCard,
            color: '#135BEC',
          })
        }
        if (p.consultantBooking) {
          list.push({
            id: `${p.id}-consultant`,
            at: p.consultantBooking.bookedAt,
            label: 'Consultant call booked',
            detail: p.title,
            icon: UserCheck,
            color: '#22C55E',
          })
        }
        const eligibility = getEligibility(p.id)
        if (eligibility?.completedAt) {
          list.push({
            id: `${p.id}-eligibility`,
            at: eligibility.completedAt,
            label: 'Eligibility check submitted',
            detail: p.title,
            icon: ClipboardCheck,
            color: '#00D4FF',
          })
        }
      }

      for (const r of listMyReports()) {
        list.push({
          id: `${r.id}-created`,
          at: r.createdAt,
          label: `${r.tier} report generated`,
          detail: r.content.council,
          icon: Sparkles,
          color: '#A855F7',
        })
        if (r.unlockedAt) {
          list.push({
            id: `${r.id}-unlocked`,
            at: r.unlockedAt,
            label: 'Report unlocked',
            detail: r.content.council,
            icon: Unlock,
            color: '#135BEC',
          })
        }
      }

      list.sort((a, b) => b.at.localeCompare(a.at))
      setEvents(list.slice(0, 8))
    }

    refresh()
    window.addEventListener('projects:changed', refresh)
    window.addEventListener('reports:changed', refresh)
    window.addEventListener('eligibility:changed', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('projects:changed', refresh)
      window.removeEventListener('reports:changed', refresh)
      window.removeEventListener('eligibility:changed', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  if (events !== null && events.length === 0) return null

  return (
    <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5">
      <h3 className="text-[14px] font-semibold text-[#E8F0FF] mb-4">Recent activity</h3>

      {events === null ? (
        <div className="space-y-2.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-[40px] rounded-[10px] bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : (
        <ol className="space-y-3.5">
          {events.map(e => {
            const Icon = e.icon
            return (
              <li key={e.id} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ background: `${e.color}1A`, color: e.color }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-[#E8F0FF] truncate">{e.label}</p>
                  <p className="text-[11.5px] text-[#5A6A8A] truncate">{e.detail}</p>
                </div>
                <span className="shrink-0 text-[11px] text-[#5A6A8A] mt-1">{formatRelativeDate(e.at)}</span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

function formatRelativeDate(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMins = Math.round(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.round(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.round(diffHours / 24)
  return `${diffDays}d ago`
}
