// // 'use client'

// // import { useEffect, useState } from 'react'
// // import { useRouter } from 'next/navigation'
// // import { FileText, Download, ArrowRight, UserCheck, Plus } from 'lucide-react'

// // import { useWorkspace } from '@/hooks/Useworkspace'
// // import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'
// // import { DashboardShell } from '@/components/dashboard/Dashboardshell'
// // import { ReportCard } from '@/components/home/ReportCard'
// // import { listProjects, type Project } from '@/lib/projects'
// // import { generateReport, buildProjectReportPdfInput, reportReference } from '@/lib/report'
// // import { downloadPdfDocument } from '@/lib/pdf'
// // import { useToast } from '@/components/ui/Toast'
// // import { isCurrentOwner } from '@/lib/authSession'
// // import { listMyReports, type PendingReport } from '@/lib/reportStorage'

// // /**
// //  * /dashboard/reports — "My Reports"
// //  * ─────────────────────────────────────
// //  * Replaces the old (broken — it expected a :draftId this route never
// //  * had) single-report page. This is the real listing: every submitted
// //  * application, in whichever state it's in.
// //  *
// //  *   • No applications at all      → empty state, "Generate a report"
// //  *   • Submitted, not paid yet     → "Continue to report" (goes to the
// //  *                                    snapshot → checkout flow, which
// //  *                                    is what actually produces the
// //  *                                    downloadable report)
// //  *   • Paid report ready           → download + "Upgrade" to a
// //  *                                    consultant review (the next tier
// //  *                                    up from the automated report)
// //  *
// //  * Download is watermarked and re-checks account ownership at click
// //  * time — see lib/report.ts (buildProjectReportPdfInput) and
// //  * lib/authSession.ts.
// //  */
// // export default function ReportsPage() {
// //   const router = useRouter()
// //   const { guardedNavigate } = useUnsavedChangesGuard()
// //   const { isLoading, session, workspace, firstName } = useWorkspace()
// //   const { show } = useToast()

// //   const [projects, setProjects] = useState<Project[] | null>(null)
// //   const [tieredReports, setTieredReports] = useState<PendingReport[] | null>(null)

// //   useEffect(() => {
// //     function refresh() {
// //       setProjects(listProjects())
// //       setTieredReports(listMyReports())
// //     }
// //     refresh()
// //     window.addEventListener('projects:changed', refresh)
// //     window.addEventListener('reports:changed', refresh)
// //     window.addEventListener('storage', refresh)
// //     return () => {
// //       window.removeEventListener('projects:changed', refresh)
// //       window.removeEventListener('reports:changed', refresh)
// //       window.removeEventListener('storage', refresh)
// //     }
// //   }, [])

// //   async function handleDownload(project: Project) {
// //     if (!project.address || !project.constraints || !project.purchase) return

// //     // Re-verify ownership at the moment of download, not just on page load.
// //     if (!isCurrentOwner(project.ownerEmail)) {
// //       show('This report belongs to a different account.', 'error')
// //       return
// //     }

// //     const report = generateReport({
// //       actorId: project.actorId,
// //       council: project.address.council,
// //       constraints: project.constraints,
// //       seed: project.id,
// //     })

// //     const pdfInput = buildProjectReportPdfInput({
// //       projectId: project.id,
// //       addressLine: project.address.line1,
// //       city: project.address.city,
// //       postcode: project.address.postcode,
// //       report,
// //       ownerName: session?.name,
// //       ownerEmail: session?.email,
// //     })

// //     await downloadPdfDocument(`planning-report-${project.id}.pdf`, pdfInput)
// //     show('Report downloaded.', 'success')
// //   }

// //   if (isLoading || projects === null || tieredReports === null) {
// //     return (
// //       <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
// //         <div className="flex items-center gap-3 text-[#5A6A8A]">
// //           <Spinner />
// //           Loading your reports…
// //         </div>
// //       </div>
// //     )
// //   }

// //   if (!session || !workspace) {
// //     return (
// //       <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
// //         <div className="text-center max-w-[360px]">
// //           <p className="font-display text-2xl text-[#E8F0FF] mb-2">No active session</p>
// //           <p className="text-[13px] text-[#5A6A8A] mb-6">Please log in to access your reports.</p>
// //           <button
// //             onClick={() => router.push('/login')}
// //             className="px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-sm font-semibold hover:bg-[#2A6BF0] transition-colors"
// //           >
// //             Go to login →
// //           </button>
// //         </div>
// //       </div>
// //     )
// //   }

// //   const submitted = projects.filter(p => p.status === 'submitted')
// //   const isEmpty = submitted.length === 0 && tieredReports.length === 0

// //   return (
// //     <DashboardShell workspace={workspace} firstName={firstName} email={session.email}>
// //       <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
// //         <div>
// //           <h1 className="font-display text-[26px] sm:text-[30px] font-normal text-[#E8F0FF] tracking-tight">
// //             Reports
// //           </h1>
// //           <p className="text-[13.5px] text-[#A8B8D8] mt-1">
// //             Every planning report you've generated, plus the next step for each.
// //           </p>
// //         </div>

// //         {!isEmpty && (
// //           <button
// //             onClick={() => guardedNavigate('/dashboard/new/intent')}
// //             className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] transition-colors"
// //           >
// //             <Plus className="h-3.5 w-3.5" />
// //             New report
// //           </button>
// //         )}
// //       </div>

// //       {isEmpty ? (
// //         <EmptyState onGenerate={() => guardedNavigate('/dashboard/new/intent')} />
// //       ) : (
// //         <div className="space-y-8">
// //           {submitted.length > 0 && (
// //             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
// //               {submitted.map(project => (
// //                 <ReportRow key={project.id} project={project} onDownload={() => handleDownload(project)} />
// //               ))}
// //             </div>
// //           )}

// //           {tieredReports.length > 0 && (
// //             <div>
// //               <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3">
// //                 Free &amp; tiered reports from chat
// //               </p>
// //               <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
// //                 {tieredReports.map(r => (
// //                   <ReportCard key={r.id} reportId={r.id} tier={r.tier} content={r.content} />
// //                 ))}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       )}
// //     </DashboardShell>
// //   )
// // }

// // function EmptyState({ onGenerate }: { onGenerate: () => void }) {
// //   return (
// //     <div className="rounded-[14px] border border-dashed border-white/[0.12] bg-[#0F1525] px-6 py-16 flex flex-col items-center text-center">
// //       <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-[#00D4FF] mb-4">
// //         <FileText className="h-5 w-5" />
// //       </span>
// //       <p className="text-[15px] font-semibold text-[#E8F0FF] mb-1.5">You haven't generated a report yet</p>
// //       <p className="text-[13px] text-[#5A6A8A] max-w-[380px] mb-6">
// //         Answer a few questions about your property and works, and we'll put together a planning
// //         eligibility report — ready to download once it's paid for.
// //       </p>
// //       <button
// //         onClick={onGenerate}
// //         className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] transition-colors"
// //       >
// //         Generate a report →
// //       </button>
// //     </div>
// //   )
// // }

// // function ReportRow({ project, onDownload }: { project: Project; onDownload: () => void }) {
// //   const { guardedNavigate } = useUnsavedChangesGuard()
// //   const hasReport = !!project.purchase && !!project.address && !!project.constraints
// //   const ref = reportReference(project.id)

// //   return (
// //     <div className="rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#0F1525] p-4">
// //       <div className="mb-2.5 flex items-start justify-between gap-3">
// //         <div className="min-w-0">
// //           <p className="text-[14.5px] font-semibold text-[#E8F0FF] truncate">{project.title}</p>
// //           {project.address && (
// //             <p className="mt-0.5 text-[12px] text-[#A8B8D8] truncate">
// //               {project.address.line1}, {project.address.city} ({project.address.postcode})
// //             </p>
// //           )}
// //         </div>
// //         <span
// //           className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${
// //             hasReport
// //               ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-300'
// //               : 'bg-amber-500/15 border border-amber-400/30 text-amber-300'
// //           }`}
// //         >
// //           {hasReport ? 'Report ready' : 'In progress'}
// //         </span>
// //       </div>

// //       {hasReport ? (
// //         <>
// //           <p className="text-[11.5px] text-[#5A6A8A] mb-3.5">
// //             Ref: {ref} · Paid {new Date(project.purchase!.paidAt).toLocaleDateString()}
// //           </p>

// //           <div className="flex flex-wrap gap-2">
// //             <button
// //               type="button"
// //               onClick={onDownload}
// //               className="inline-flex items-center gap-1.5 rounded-full bg-[#135BEC] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors"
// //             >
// //               <Download className="h-3.5 w-3.5" />
// //               Download report
// //             </button>
// //           </div>

// //           <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3">
// //             {project.consultantBooking ? (
// //               <p className="text-[12px] text-[#A8B8D8] flex items-center gap-2">
// //                 <UserCheck className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
// //                 Consultant call booked
// //                 {project.consultantBooking.date ? ` · ${project.consultantBooking.date}` : ' · callback requested'}
// //               </p>
// //             ) : (
// //               <>
// //                 <p className="text-[12px] text-[#A8B8D8] leading-relaxed">
// //                   Want a planning consultant to review this and confirm the best route?
// //                 </p>
// //                 <button
// //                   onClick={() => guardedNavigate(`/dashboard/new/${project.id}/consultant`)}
// //                   className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#00D4FF] hover:text-[#3ee0ff] transition-colors"
// //                 >
// //                   Upgrade: book a planning consultant
// //                   <ArrowRight className="h-3.5 w-3.5" />
// //                 </button>
// //               </>
// //             )}
// //           </div>
// //         </>
// //       ) : (
// //         <>
// //           <p className="text-[11.5px] text-[#5A6A8A] mb-3.5">
// //             Submitted {new Date(project.submittedAt ?? project.updatedAt).toLocaleDateString()} — pay to unlock the
// //             full report.
// //           </p>
// //           <button
// //             onClick={() => guardedNavigate(`/dashboard/new/${project.id}/snapshot`)}
// //             className="inline-flex items-center gap-1.5 rounded-full bg-[#135BEC] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors"
// //           >
// //             Continue to report
// //             <ArrowRight className="h-3.5 w-3.5" />
// //           </button>
// //         </>
// //       )}
// //     </div>
// //   )
// // }

// // function Spinner() {
// //   return (
// //     <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
// //       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
// //       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
// //     </svg>
// //   )
// // }

// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { FileText, Download, ArrowRight, UserCheck, Plus, ClipboardCheck } from 'lucide-react'

// import { useWorkspace } from '@/hooks/Useworkspace'
// import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'
// import { DashboardShell } from '@/components/dashboard/Dashboardshell'
// import { ReportCard } from '@/components/home/ReportCard'
// import { listProjects, type Project } from '@/lib/projects'
// import { generateReport, buildProjectReportPdfInput, reportReference } from '@/lib/report'
// import { downloadPdfDocument } from '@/lib/pdf'
// import { useToast } from '@/components/ui/Toast'
// import { isCurrentOwner } from '@/lib/authSession'
// import { listMyReports, type PendingReport } from '@/lib/reportStorage'
// import { isEligibilityComplete } from '@/lib/eligibility'

// /**
//  * /dashboard/reports — "My Reports"
//  * ─────────────────────────────────────
//  * Replaces the old (broken — it expected a :draftId this route never
//  * had) single-report page. This is the real listing: every submitted
//  * application, in whichever state it's in.
//  *
//  *   • No applications at all      → empty state, "Generate a report"
//  *   • Submitted, not paid yet     → "Continue to report" (goes to the
//  *                                    snapshot → checkout flow, which
//  *                                    is what actually produces the
//  *                                    downloadable report)
//  *   • Paid report ready           → download + "Upgrade" to a
//  *                                    consultant review (the next tier
//  *                                    up from the automated report)
//  *
//  * Download is watermarked and re-checks account ownership at click
//  * time — see lib/report.ts (buildProjectReportPdfInput) and
//  * lib/authSession.ts.
//  */
// export default function ReportsPage() {
//   const router = useRouter()
//   const { guardedNavigate } = useUnsavedChangesGuard()
//   const { isLoading, session, workspace, firstName } = useWorkspace()
//   const { show } = useToast()

//   const [projects, setProjects] = useState<Project[] | null>(null)
//   const [tieredReports, setTieredReports] = useState<PendingReport[] | null>(null)

//   useEffect(() => {
//     function refresh() {
//       setProjects(listProjects())
//       setTieredReports(listMyReports())
//     }
//     refresh()
//     window.addEventListener('projects:changed', refresh)
//     window.addEventListener('reports:changed', refresh)
//     window.addEventListener('storage', refresh)
//     return () => {
//       window.removeEventListener('projects:changed', refresh)
//       window.removeEventListener('reports:changed', refresh)
//       window.removeEventListener('storage', refresh)
//     }
//   }, [])

//   async function handleDownload(project: Project) {
//     if (!project.address || !project.constraints || !project.purchase) return

//     // Re-verify ownership at the moment of download, not just on page load.
//     if (!isCurrentOwner(project.ownerEmail)) {
//       show('This report belongs to a different account.', 'error')
//       return
//     }

//     const report = generateReport({
//       actorId: project.actorId,
//       council: project.address.council,
//       constraints: project.constraints,
//       seed: project.id,
//     })

//     const pdfInput = buildProjectReportPdfInput({
//       projectId: project.id,
//       addressLine: project.address.line1,
//       city: project.address.city,
//       postcode: project.address.postcode,
//       report,
//       ownerName: session?.name,
//       ownerEmail: session?.email,
//     })

//     await downloadPdfDocument(`planning-report-${project.id}.pdf`, pdfInput)
//     show('Report downloaded.', 'success')
//   }

//   if (isLoading || projects === null || tieredReports === null) {
//     return (
//       <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
//         <div className="flex items-center gap-3 text-[#5A6A8A]">
//           <Spinner />
//           Loading your reports…
//         </div>
//       </div>
//     )
//   }

//   if (!session || !workspace) {
//     return (
//       <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
//         <div className="text-center max-w-[360px]">
//           <p className="font-display text-2xl text-[#E8F0FF] mb-2">No active session</p>
//           <p className="text-[13px] text-[#5A6A8A] mb-6">Please log in to access your reports.</p>
//           <button
//             onClick={() => router.push('/login')}
//             className="px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-sm font-semibold hover:bg-[#2A6BF0] transition-colors"
//           >
//             Go to login →
//           </button>
//         </div>
//       </div>
//     )
//   }

//   const submitted = projects.filter(p => p.status === 'submitted')
//   const isEmpty = submitted.length === 0 && tieredReports.length === 0

//   return (
//     <DashboardShell workspace={workspace} firstName={firstName} email={session.email}>
//       <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
//         <div>
//           <h1 className="font-display text-[26px] sm:text-[30px] font-normal text-[#E8F0FF] tracking-tight">
//             Reports
//           </h1>
//           <p className="text-[13.5px] text-[#A8B8D8] mt-1">
//             Every planning report you've generated, plus the next step for each.
//           </p>
//         </div>

//         {!isEmpty && (
//           <button
//             onClick={() => guardedNavigate('/dashboard/new/intent')}
//             className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] transition-colors"
//           >
//             <Plus className="h-3.5 w-3.5" />
//             New report
//           </button>
//         )}
//       </div>

//       {isEmpty ? (
//         <EmptyState onGenerate={() => guardedNavigate('/dashboard/new/intent')} />
//       ) : (
//         <div className="space-y-8">
//           {submitted.length > 0 && (
//             <div>
//               <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-1">
//                 Full applications
//               </p>
//               <p className="text-[12px] text-[#5A6A8A] mb-3">
//                 Paid eligibility reports tied to a submitted project — download the PDF or continue to a full eligibility check.
//               </p>
//               <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
//                 {submitted.map(project => (
//                   <ReportRow key={project.id} project={project} onDownload={() => handleDownload(project)} />
//                 ))}
//               </div>
//             </div>
//           )}

//           {tieredReports.length > 0 && (
//             <div>
//               <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-1">
//                 Free preview reports
//               </p>
//               <p className="text-[12px] text-[#5A6A8A] mb-3">
//                 Quick, no-login reports generated from chat. Upgrade to a paid tier for more detail — full applications appear above once purchased.
//               </p>
//               <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
//                 {tieredReports.map(r => (
//                   <ReportCard key={r.id} reportId={r.id} tier={r.tier} content={r.content} />
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </DashboardShell>
//   )
// }

// function EmptyState({ onGenerate }: { onGenerate: () => void }) {
//   return (
//     <div className="rounded-[14px] border border-dashed border-white/[0.12] bg-[#0F1525] px-6 py-16 flex flex-col items-center text-center">
//       <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-[#00D4FF] mb-4">
//         <FileText className="h-5 w-5" />
//       </span>
//       <p className="text-[15px] font-semibold text-[#E8F0FF] mb-1.5">You haven't generated a report yet</p>
//       <p className="text-[13px] text-[#5A6A8A] max-w-[380px] mb-6">
//         Answer a few questions about your property and works, and we'll put together a planning
//         eligibility report — ready to download once it's paid for.
//       </p>
//       <button
//         onClick={onGenerate}
//         className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] transition-colors"
//       >
//         Generate a report →
//       </button>
//     </div>
//   )
// }

// function ReportRow({ project, onDownload }: { project: Project; onDownload: () => void }) {
//   const { guardedNavigate } = useUnsavedChangesGuard()
//   const hasReport = !!project.purchase && !!project.address && !!project.constraints
//   const ref = reportReference(project.id)

//   return (
//     <div className="rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#0F1525] p-4">
//       <div className="mb-2.5 flex items-start justify-between gap-3">
//         <div className="min-w-0">
//           <p className="text-[14.5px] font-semibold text-[#E8F0FF] truncate">{project.title}</p>
//           {project.address && (
//             <p className="mt-0.5 text-[12px] text-[#A8B8D8] truncate">
//               {project.address.line1}, {project.address.city} ({project.address.postcode})
//             </p>
//           )}
//         </div>
//         <span
//           className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${
//             hasReport
//               ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-300'
//               : 'bg-amber-500/15 border border-amber-400/30 text-amber-300'
//           }`}
//         >
//           {hasReport ? 'Report ready' : 'In progress'}
//         </span>
//       </div>

//       {hasReport ? (
//         <>
//           <p className="text-[11.5px] text-[#5A6A8A] mb-3.5">
//             Ref: {ref} · Paid {new Date(project.purchase!.paidAt).toLocaleDateString()}
//           </p>

//           <div className="flex flex-wrap gap-2">
//             <button
//               type="button"
//               onClick={onDownload}
//               className="inline-flex items-center gap-1.5 rounded-full bg-[#135BEC] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors"
//             >
//               <Download className="h-3.5 w-3.5" />
//               Download report
//             </button>
//             <button
//               type="button"
//               onClick={() => guardedNavigate(`/dashboard/new/${project.id}/eligibility`)}
//               className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] px-4 py-2 text-[12.5px] font-semibold text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors"
//             >
//               <ClipboardCheck className="h-3.5 w-3.5" />
//               {isEligibilityComplete(project.id) ? 'Eligibility check ✓' : 'Complete eligibility check'}
//             </button>
//           </div>

//           <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3">
//             {project.consultantBooking ? (
//               <p className="text-[12px] text-[#A8B8D8] flex items-center gap-2">
//                 <UserCheck className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
//                 Consultant call booked
//                 {project.consultantBooking.date ? ` · ${project.consultantBooking.date}` : ' · callback requested'}
//               </p>
//             ) : (
//               <>
//                 <p className="text-[12px] text-[#A8B8D8] leading-relaxed">
//                   Want a planning consultant to review this and confirm the best route?
//                 </p>
//                 <button
//                   onClick={() => guardedNavigate(`/dashboard/new/${project.id}/consultant`)}
//                   className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#00D4FF] hover:text-[#3ee0ff] transition-colors"
//                 >
//                   Upgrade: book a planning consultant
//                   <ArrowRight className="h-3.5 w-3.5" />
//                 </button>
//               </>
//             )}
//           </div>
//         </>
//       ) : (
//         <>
//           <p className="text-[11.5px] text-[#5A6A8A] mb-3.5">
//             Submitted {new Date(project.submittedAt ?? project.updatedAt).toLocaleDateString()} — pay to unlock the
//             full report.
//           </p>
//           <button
//             onClick={() => guardedNavigate(`/dashboard/new/${project.id}/snapshot`)}
//             className="inline-flex items-center gap-1.5 rounded-full bg-[#135BEC] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors"
//           >
//             Continue to report
//             <ArrowRight className="h-3.5 w-3.5" />
//           </button>
//         </>
//       )}
//     </div>
//   )
// }

// function Spinner() {
//   return (
//     <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
//       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
//     </svg>
//   )
// }


'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Download, ArrowRight, UserCheck, Plus, ClipboardCheck, ChevronDown } from 'lucide-react'

import { useWorkspace } from '@/hooks/Useworkspace'
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'
import { DashboardShell } from '@/components/dashboard/Dashboardshell'
import { ReportCard } from '@/components/home/ReportCard'
import { listProjects, type Project } from '@/lib/projects'
import { generateReport, buildProjectReportPdfInput, buildAreaSnapshotImagePages, reportReference } from '@/lib/report'
import { downloadPdfDocument } from '@/lib/pdf'
import { useToast } from '@/components/ui/Toast'
import { isCurrentOwner } from '@/lib/authSession'
import { listMyReports, type PendingReport } from '@/lib/reportStorage'
import { isEligibilityComplete } from '@/lib/eligibility'
import { getTierDef } from '@/lib/reportTiers'
import { cn } from '@/lib/cn'

/**
 * /dashboard/reports — "My Reports"
 * ─────────────────────────────────────
 * Replaces the old (broken — it expected a :draftId this route never
 * had) single-report page. This is the real listing: every submitted
 * application, in whichever state it's in.
 *
 *   • No applications at all      → empty state, "Generate a report"
 *   • Submitted, not paid yet     → "Continue to report" (goes to the
 *                                    snapshot → checkout flow, which
 *                                    is what actually produces the
 *                                    downloadable report)
 *   • Paid report ready           → download + "Upgrade" to a
 *                                    consultant review (the next tier
 *                                    up from the automated report)
 *
 * Download is watermarked and re-checks account ownership at click
 * time — see lib/report.ts (buildProjectReportPdfInput) and
 * lib/authSession.ts.
 */
export default function ReportsPage() {
  const router = useRouter()
  const { guardedNavigate } = useUnsavedChangesGuard()
  const { isLoading, session, workspace, firstName } = useWorkspace()
  const { show } = useToast()

  const [projects, setProjects] = useState<Project[] | null>(null)
  const [tieredReports, setTieredReports] = useState<PendingReport[] | null>(null)

  useEffect(() => {
    function refresh() {
      setProjects(listProjects())
      setTieredReports(listMyReports())
    }
    refresh()
    window.addEventListener('projects:changed', refresh)
    window.addEventListener('reports:changed', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('projects:changed', refresh)
      window.removeEventListener('reports:changed', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  async function handleDownload(project: Project) {
    if (!project.address || !project.constraints || !project.purchase) return

    // Re-verify ownership at the moment of download, not just on page load.
    if (!isCurrentOwner(project.ownerEmail)) {
      show('This report belongs to a different account.', 'error')
      return
    }

    const report = generateReport({
      actorId: project.actorId,
      council: project.address.council,
      constraints: project.constraints,
      seed: project.id,
    })

    const pdfInput = buildProjectReportPdfInput({
      projectId: project.id,
      addressLine: project.address.line1,
      city: project.address.city,
      postcode: project.address.postcode,
      report,
      constraintsChecked: project.constraints,
      dataSource: project.address.dataSource,
      dataNote: project.address.dataNote,
      imagePages: await buildAreaSnapshotImagePages(
        typeof project.address.latitude === 'number' && typeof project.address.longitude === 'number'
          ? { latitude: project.address.latitude, longitude: project.address.longitude }
          : undefined
      ),
      ownerName: session?.name,
      ownerEmail: session?.email,
    })

    await downloadPdfDocument(`planning-report-${project.id}.pdf`, pdfInput)
    show('Report downloaded.', 'success')
  }

  if (isLoading || projects === null || tieredReports === null) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#5A6A8A]">
          <Spinner />
          Loading your reports…
        </div>
      </div>
    )
  }

  if (!session || !workspace) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
        <div className="text-center max-w-[360px]">
          <p className="font-display text-2xl text-[#E8F0FF] mb-2">No active session</p>
          <p className="text-[13px] text-[#5A6A8A] mb-6">Please log in to access your reports.</p>
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

  const submitted = projects.filter(p => p.status === 'submitted')
  const isEmpty = submitted.length === 0 && tieredReports.length === 0

  return (
    <DashboardShell workspace={workspace} firstName={firstName} email={session.email}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="font-display text-[26px] sm:text-[30px] font-normal text-[#E8F0FF] tracking-tight">
            Reports
          </h1>
          <p className="text-[13.5px] text-[#A8B8D8] mt-1">
            Every planning report you've generated, plus the next step for each.
          </p>
        </div>

        {!isEmpty && (
          <button
            onClick={() => guardedNavigate('/dashboard/new/intent')}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New report
          </button>
        )}
      </div>

      {isEmpty ? (
        <EmptyState onGenerate={() => guardedNavigate('/dashboard/new/intent')} />
      ) : (
        <div className="space-y-8">
          {submitted.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-1">
                Full applications
              </p>
              <p className="text-[12px] text-[#5A6A8A] mb-3">
                Paid eligibility reports tied to a submitted project — download the PDF or continue to a full eligibility check.
              </p>
              <div className="space-y-3">
                {submitted.map(project => (
                  <ReportListItem key={project.id} project={project} onDownload={() => handleDownload(project)} />
                ))}
              </div>
            </div>
          )}

          {tieredReports.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-1">
                Free preview reports
              </p>
              <p className="text-[12px] text-[#5A6A8A] mb-3">
                Quick, no-login reports generated from chat. Upgrade to a paid tier for more detail — full applications appear above once purchased.
              </p>
              <div className="space-y-3">
                {tieredReports.map(r => (
                  <TieredReportListItem key={r.id} reportId={r.id} tier={r.tier} content={r.content} createdAt={r.createdAt} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  )
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="rounded-[14px] border border-dashed border-white/[0.12] bg-[#0F1525] px-6 py-16 flex flex-col items-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-[#00D4FF] mb-4">
        <FileText className="h-5 w-5" />
      </span>
      <p className="text-[15px] font-semibold text-[#E8F0FF] mb-1.5">You haven't generated a report yet</p>
      <p className="text-[13px] text-[#5A6A8A] max-w-[380px] mb-6">
        Answer a few questions about your property and works, and we'll put together a planning
        eligibility report — ready to download once it's paid for.
      </p>
      <button
        onClick={onGenerate}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] transition-colors"
      >
        Generate a report →
      </button>
    </div>
  )
}

function ReportListItem({ project, onDownload }: { project: Project; onDownload: () => void }) {
  const { guardedNavigate } = useUnsavedChangesGuard()
  const [expanded, setExpanded] = useState(false)
  const hasReport = !!project.purchase && !!project.address && !!project.constraints
  const ref = reportReference(project.id)

  return (
    <div className="rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#0F1525] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className="min-w-0">
          <p className="text-[14.5px] font-semibold text-[#E8F0FF] truncate">{project.title}</p>
          {project.address && (
            <p className="mt-0.5 text-[12px] text-[#A8B8D8] truncate">
              {project.address.line1}, {project.address.city} ({project.address.postcode})
            </p>
          )}
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide',
              hasReport
                ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-300'
                : 'bg-amber-500/15 border border-amber-400/30 text-amber-300'
            )}
          >
            {hasReport ? 'Report ready' : 'In progress'}
          </span>
          <ChevronDown className={cn('h-4 w-4 text-[#5A6A8A] transition-transform', expanded && 'rotate-180')} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-3.5 border-t border-white/[0.06]">
          {hasReport ? (
            <>
              <p className="text-[11.5px] text-[#5A6A8A] mb-3.5">
                Ref: {ref} · Paid {new Date(project.purchase!.paidAt).toLocaleString()}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onDownload}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#135BEC] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download report
                </button>
                <button
                  type="button"
                  onClick={() => guardedNavigate(`/dashboard/new/${project.id}/eligibility`)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] px-4 py-2 text-[12.5px] font-semibold text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  {isEligibilityComplete(project.id) ? 'Eligibility check ✓' : 'Complete eligibility check'}
                </button>
              </div>

              <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3">
                {project.consultantBooking ? (
                  <p className="text-[12px] text-[#A8B8D8] flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                    Consultant call booked
                    {project.consultantBooking.date ? ` · ${project.consultantBooking.date}` : ' · callback requested'}
                  </p>
                ) : (
                  <>
                    <p className="text-[12px] text-[#A8B8D8] leading-relaxed">
                      Want a planning consultant to review this and confirm the best route?
                    </p>
                    <button
                      onClick={() => guardedNavigate(`/dashboard/new/${project.id}/consultant`)}
                      className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#00D4FF] hover:text-[#3ee0ff] transition-colors"
                    >
                      Upgrade: book a planning consultant
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-[11.5px] text-[#5A6A8A] mb-3.5">
                Submitted {new Date(project.submittedAt ?? project.updatedAt).toLocaleDateString()} — pay to unlock the
                full report.
              </p>
              <button
                onClick={() => guardedNavigate(`/dashboard/new/${project.id}/snapshot`)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#135BEC] px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-[#2A6BF0] transition-colors"
              >
                Continue to report
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Collapsed summary row for a free/tiered chat report — expands on click
 * to reveal the full ReportCard (unchanged, so the paywall/download-gate
 * logic that lives there keeps working exactly as it does in the chat
 * flow; this only wraps it in a click-to-expand shell for this list).
 */
function TieredReportListItem({ reportId, tier, content, createdAt }: { reportId: string; tier: PendingReport['tier']; content: PendingReport['content']; createdAt: PendingReport['createdAt'] }) {
  const [expanded, setExpanded] = useState(false)
  const tierDef = getTierDef(tier)

  return (
    <div className="rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#0F1525] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className="min-w-0 flex items-center gap-2.5">
          <span className="shrink-0 rounded-full bg-blue-500/15 border border-blue-400/30 px-2.5 py-1 text-[10.5px] font-bold text-[#00D4FF] uppercase tracking-wide">
            {tierDef.badge}
          </span>
          <p className="text-[13.5px] font-medium text-[#E8F0FF] truncate">{content.route.title}</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          {tierDef.priceGBP !== null && (
            <span className="text-[12px] font-semibold text-[#E8F0FF]">{tierDef.priceLabel}</span>
          )}
          <ChevronDown className={cn('h-4 w-4 text-[#5A6A8A] transition-transform', expanded && 'rotate-180')} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-3.5 border-t border-white/[0.06]">
          <p className="text-[11.5px] text-[#5A6A8A] mb-3.5">
            Generated {new Date(createdAt).toLocaleString()}
          </p>
          <ReportCard reportId={reportId} tier={tier} content={content} />
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}