// 'use client'

// import { useEffect, useState } from 'react'
// import { cn } from '@/lib/cn'
// import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'
// import { listProjects, deleteProject, type Project } from '@/lib/projects'

// interface ActiveProjectsWidgetProps {
//   className?: string
// }

// const STATUS_META: Record<Project['status'], { label: string; color: string }> = {
//   draft:     { label: 'Draft',   color: '#F59E0B' },
//   submitted: { label: 'Created', color: '#135BEC' },
// }

// /**
//  * ActiveProjectsWidget
//  * ─────────────────────
//  * Shows the signed-in user's applications — anything saved as a draft
//  * from the intake form, or already submitted ("created"). Backed by
//  * lib/projects.ts (localStorage today; swap for a real API later).
//  *
//  * Navigation: drafts link to /dashboard/new/[id], the same route that
//  * created them — clicking one is a real navigation (via the unsaved
//  * -changes guard, in case another draft is already open), not a
//  * callback threaded down from the page.
//  *
//  * Deletion requires a second click to confirm — the row swaps its
//  * status pill for an inline "Delete? [Yes] [No]" control rather than
//  * deleting on the first click.
//  */
// export function ActiveProjectsWidget({ className }: ActiveProjectsWidgetProps) {
//   const { guardedNavigate } = useUnsavedChangesGuard()
//   const [projects, setProjects] = useState<Project[] | null>(null)
//   const [confirmingId, setConfirmingId] = useState<string | null>(null)

//   useEffect(() => {
//     setProjects(listProjects())
//     // Same-tab store writes dispatch this; cross-tab writes fire the native 'storage' event.
//     function refresh() { setProjects(listProjects()) }
//     window.addEventListener('projects:changed', refresh)
//     window.addEventListener('storage', refresh)
//     return () => {
//       window.removeEventListener('projects:changed', refresh)
//       window.removeEventListener('storage', refresh)
//     }
//   }, [])

//   function handleDelete(id: string) {
//     deleteProject(id)
//     setProjects(listProjects())
//     setConfirmingId(null)
//   }

//   return (
//     <div className={cn('rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5', className)}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="text-[14px] font-semibold text-[#E8F0FF]">Active projects</h3>
//         <button
//           onClick={() => guardedNavigate('/dashboard/new/intent')}
//           className="text-[12px] text-[#135BEC] hover:text-[#2A6BF0] font-medium"
//         >
//           + New application
//         </button>
//       </div>

//       {projects === null ? (
//         <div className="space-y-2.5">
//           {[0, 1].map(i => (
//             <div key={i} className="h-[52px] rounded-[10px] bg-white/[0.03] animate-pulse" />
//           ))}
//         </div>
//       ) : projects.length === 0 ? (
//         <div className="text-center py-6">
//           <p className="text-[12.5px] text-[#5A6A8A] mb-3">No projects yet.</p>
//           <button
//             onClick={() => guardedNavigate('/dashboard/new/intent')}
//             className="text-[12.5px] px-3.5 py-2 rounded-[8px] bg-[#135BEC] text-white font-semibold hover:bg-[#2A6BF0] transition-colors"
//           >
//             Start your first application
//           </button>
//         </div>
//       ) : (
//         <div className="space-y-2.5">
//           {projects.map(p => {
//             const meta = STATUS_META[p.status]
//             const isDraft = p.status === 'draft'
//             const isConfirming = confirmingId === p.id

//             return (
//               <div
//                 key={p.id}
//                 onClick={() => isDraft && !isConfirming && guardedNavigate(`/dashboard/new/${p.id}`)}
//                 className={cn(
//                   'group flex items-center gap-3 p-3 rounded-[10px] bg-white/[0.02] transition-colors',
//                   isDraft && !isConfirming && 'hover:bg-white/[0.04] cursor-pointer'
//                 )}
//               >
//                 <div className="flex-1 min-w-0">
//                   <p className="text-[13px] font-medium text-[#E8F0FF] truncate">{p.title}</p>
//                   <p className="text-[11.5px] text-[#5A6A8A] truncate">
//                     {p.answeredCount} of {p.totalCount} answered &middot; updated {formatRelativeDate(p.updatedAt)}
//                   </p>
//                 </div>

//                 {isConfirming ? (
//                   <div className="shrink-0 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
//                     <span className="text-[11px] text-[#A8B8D8] mr-0.5">Delete draft?</span>
//                     <button
//                       type="button"
//                       onClick={() => handleDelete(p.id)}
//                       className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[rgba(248,113,113,0.15)] text-[#F87171] hover:bg-[rgba(248,113,113,0.25)]"
//                     >
//                       Delete
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setConfirmingId(null)}
//                       className="text-[11px] font-medium px-2 py-1 rounded-md text-[#A8B8D8] hover:bg-white/[0.06]"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 ) : (
//                   <>
//                     <span
//                       className="shrink-0 text-[10.5px] font-medium px-2 py-1 rounded-full"
//                       style={{ background: `${meta.color}1A`, color: meta.color }}
//                     >
//                       {meta.label}
//                     </span>
//                     {isDraft && (
//                       <button
//                         type="button"
//                         aria-label="Discard draft"
//                         onClick={e => {
//                           e.stopPropagation()
//                           setConfirmingId(p.id)
//                         }}
//                         className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-[#5A6A8A] opacity-0 group-hover:opacity-100 hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.08)] transition-all"
//                       >
//                         <TrashIcon />
//                       </button>
//                     )}
//                   </>
//                 )}
//               </div>
//             )
//           })}
//         </div>
//       )}
//     </div>
//   )
// }

// function formatRelativeDate(iso: string): string {
//   const diffMs = Date.now() - new Date(iso).getTime()
//   const diffMins = Math.round(diffMs / 60000)
//   if (diffMins < 1) return 'just now'
//   if (diffMins < 60) return `${diffMins}m ago`
//   const diffHours = Math.round(diffMins / 60)
//   if (diffHours < 24) return `${diffHours}h ago`
//   const diffDays = Math.round(diffHours / 24)
//   return `${diffDays}d ago`
// }

// function TrashIcon() {
//   return (
//     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//       <polyline points="3 6 5 6 21 6" />
//       <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
//     </svg>
//   )
// }


'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'
import { listProjects, deleteProject, type Project } from '@/lib/projects'

interface ActiveProjectsWidgetProps {
  className?: string
}

const STATUS_META: Record<Project['status'], { label: string; color: string }> = {
  draft:     { label: 'Draft',   color: '#F59E0B' },
  submitted: { label: 'Created', color: '#135BEC' },
}

/** Richer label for submitted projects once later steps are done — draft keeps its own meta above. */
function statusFor(p: Project): { label: string; color: string } {
  if (p.status !== 'submitted') return STATUS_META[p.status]
  if (p.consultantBooking) return { label: 'Consultation booked', color: '#00D4FF' }
  if (p.purchase) return { label: 'Report purchased', color: '#135BEC' }
  return STATUS_META.submitted
}

/**
 * ActiveProjectsWidget
 * ─────────────────────
 * Shows the signed-in user's applications — anything saved as a draft
 * from the intake form, or already submitted ("created"). Backed by
 * lib/projects.ts (localStorage today; swap for a real API later).
 *
 * Navigation: drafts link to /dashboard/new/[id], the same route that
 * created them — clicking one is a real navigation (via the unsaved
 * -changes guard, in case another draft is already open), not a
 * callback threaded down from the page.
 *
 * Deletion requires a second click to confirm — the row swaps its
 * status pill for an inline "Delete? [Yes] [No]" control rather than
 * deleting on the first click.
 */
export function ActiveProjectsWidget({ className }: ActiveProjectsWidgetProps) {
  const { guardedNavigate } = useUnsavedChangesGuard()
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  useEffect(() => {
    setProjects(listProjects())
    // Same-tab store writes dispatch this; cross-tab writes fire the native 'storage' event.
    function refresh() { setProjects(listProjects()) }
    window.addEventListener('projects:changed', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('projects:changed', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  function handleDelete(id: string) {
    deleteProject(id)
    setProjects(listProjects())
    setConfirmingId(null)
  }

  return (
    <div className={cn('rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-[#E8F0FF]">Active projects</h3>
        <button
          onClick={() => guardedNavigate('/dashboard/new/intent')}
          className="text-[12px] text-[#135BEC] hover:text-[#2A6BF0] font-medium"
        >
          + New application
        </button>
      </div>

      {projects === null ? (
        <div className="space-y-2.5">
          {[0, 1].map(i => (
            <div key={i} className="h-[52px] rounded-[10px] bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-[12.5px] text-[#5A6A8A] mb-3">No projects yet.</p>
          <button
            onClick={() => guardedNavigate('/dashboard/new/intent')}
            className="text-[12.5px] px-3.5 py-2 rounded-[8px] bg-[#135BEC] text-white font-semibold hover:bg-[#2A6BF0] transition-colors"
          >
            Start your first application
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {projects.map(p => {
            const meta = statusFor(p)
            const isDraft = p.status === 'draft'
            const isConfirming = confirmingId === p.id

            function handleRowClick() {
              if (isConfirming) return
              if (isDraft) guardedNavigate(`/dashboard/new/${p.id}`)
              else guardedNavigate(`/dashboard/projects/${p.id}`)
            }

            return (
              <div
                key={p.id}
                onClick={handleRowClick}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isConfirming) {
                    e.preventDefault()
                    handleRowClick()
                  }
                }}
                aria-label={isDraft ? `Resume draft: ${p.title}` : `View project details: ${p.title}`}
                className={cn(
                  'group flex items-center gap-3 p-3 rounded-[10px] bg-white/[0.02] transition-colors',
                  !isConfirming && 'hover:bg-white/[0.04] cursor-pointer'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#E8F0FF] truncate">{p.title}</p>
                  <p className="text-[11.5px] text-[#5A6A8A] truncate">
                    {p.answeredCount} of {p.totalCount} answered &middot; updated {formatRelativeDate(p.updatedAt)}
                  </p>
                </div>

                {isConfirming ? (
                  <div className="shrink-0 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <span className="text-[11px] text-[#A8B8D8] mr-0.5">Delete draft?</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[rgba(248,113,113,0.15)] text-[#F87171] hover:bg-[rgba(248,113,113,0.25)]"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="text-[11px] font-medium px-2 py-1 rounded-md text-[#A8B8D8] hover:bg-white/[0.06]"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span
                      className="shrink-0 text-[10.5px] font-medium px-2 py-1 rounded-full"
                      style={{ background: `${meta.color}1A`, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    {isDraft && (
                      <button
                        type="button"
                        aria-label="Discard draft"
                        onClick={e => {
                          e.stopPropagation()
                          setConfirmingId(p.id)
                        }}
                        className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-[#5A6A8A] opacity-0 group-hover:opacity-100 hover:text-[#F87171] hover:bg-[rgba(248,113,113,0.08)] transition-all"
                      >
                        <TrashIcon />
                      </button>
                    )}
                    {!isDraft && (
                      <span className="shrink-0 text-[#5A6A8A] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                        <ChevronIcon />
                      </span>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
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

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}