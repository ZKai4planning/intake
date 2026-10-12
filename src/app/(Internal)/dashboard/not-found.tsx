// 'use client'

// import { useRouter } from 'next/navigation'

// import { DashboardShell } from '@/components/dashboard/Dashboardshell'
// import { GuardedNavLink } from '@/components/dashboard/GuardedNavLink'
// import { useWorkspace } from '@/hooks/Useworkspace'

// /**
//  * dashboard/not-found.tsx
//  * ─────────────────────────
//  * Next.js renders the nearest not-found.tsx for the deepest route
//  * segment it could match. Without this file, any unmatched URL under
//  * /dashboard/* (typo'd link, stale bookmark, hand-edited path) fell
//  * through to the site-wide `src/app/not-found.tsx` — which has no
//  * sidebar/header and only offers "back to homepage", so it looked like
//  * the user had been kicked out of the dashboard entirely instead of
//  * just hitting a bad link inside it.
//  *
//  * This version keeps the normal DashboardShell chrome (sidebar, header,
//  * mobile nav) and points back at /dashboard rather than "/".
//  */
// export default function DashboardNotFound() {
//   const router = useRouter()
//   const { isLoading, session, workspace, firstName } = useWorkspace()

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
//         <div className="flex items-center gap-3 text-[#5A6A8A]">
//           <Spinner />
//           Loading your workspace…
//         </div>
//       </div>
//     )
//   }

//   // No session — same fallback the rest of the dashboard routes use.
//   if (!session || !workspace) {
//     return (
//       <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
//         <div className="text-center max-w-[360px]">
//           <p className="font-display text-2xl text-[#E8F0FF] mb-2">No active session</p>
//           <p className="text-[13px] text-[#5A6A8A] mb-6">
//             Please log in to access your workspace.
//           </p>
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

//   return (
//     <DashboardShell workspace={workspace} firstName={firstName} email={session.email}>
//       <div className="flex flex-col items-center justify-center text-center py-16 px-5">
//         <div className="w-14 h-14 rounded-full bg-[rgba(19,91,236,0.08)] border border-[rgba(19,91,236,0.25)] flex items-center justify-center mb-5">
//           <span className="text-[22px]" aria-hidden="true">🔍</span>
//         </div>

//         <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#5A6A8A] mb-2">
//           404
//         </p>
//         <h1 className="font-display text-[24px] sm:text-[28px] font-normal text-[#E8F0FF] tracking-tight mb-2">
//           We couldn&rsquo;t find that page
//         </h1>
//         <p className="text-[13.5px] text-[#A8B8D8] max-w-[380px] mb-8">
//           The page you were looking for doesn&rsquo;t exist, may have moved, or the link may be
//           out of date. Your workspace is still right here.
//         </p>

//         <div className="flex flex-col sm:flex-row gap-3">
//           <GuardedNavLink
//             href="/dashboard"
//             className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] transition-colors"
//           >
//             ← Back to dashboard
//           </GuardedNavLink>
//           <GuardedNavLink
//             href="/dashboard/reports"
//             className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-transparent border border-white/[0.12] text-[#A8B8D8] text-[13px] font-semibold hover:border-white/[0.25] hover:text-[#E8F0FF] transition-colors"
//           >
//             View reports
//           </GuardedNavLink>
//         </div>
//       </div>
//     </DashboardShell>
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

import { useRouter } from 'next/navigation'

import { DashboardShell } from '@/components/dashboard/Dashboardshell'
import { GuardedNavLink } from '@/components/dashboard/GuardedNavLink'
import { useWorkspace } from '@/hooks/Useworkspace'
import { DashboardLoading } from '@/components/dashboard/DashboardLoading'


/**
 * dashboard/not-found.tsx
 * ─────────────────────────
 * Next.js renders the nearest not-found.tsx for the deepest route
 * segment it could match. Without this file, any unmatched URL under
 * /dashboard/* (typo'd link, stale bookmark, hand-edited path) fell
 * through to the site-wide `src/app/not-found.tsx` — which has no
 * sidebar/header and only offers "back to homepage", so it looked like
 * the user had been kicked out of the dashboard entirely instead of
 * just hitting a bad link inside it.
 *
 * This version keeps the normal DashboardShell chrome (sidebar, header,
 * mobile nav) and points back at /dashboard rather than "/".
 */
export default function DashboardNotFound() {
  const router = useRouter()
  const { isLoading, session, workspace, firstName } = useWorkspace()

  if (isLoading) {
    return <DashboardLoading label="Loading your workspace…" />
  }

  // No session — same fallback the rest of the dashboard routes use.
  if (!session || !workspace) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-5">
        <div className="text-center max-w-[360px]">
          <p className="font-display text-2xl text-[#E8F0FF] mb-2">No active session</p>
          <p className="text-[13px] text-[#5A6A8A] mb-6">
            Please log in to access your workspace.
          </p>
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

  return (
    <DashboardShell workspace={workspace} firstName={firstName} email={session.email}>
      <div className="flex flex-col items-center justify-center text-center py-16 px-5">
        <div className="w-14 h-14 rounded-full bg-[rgba(19,91,236,0.08)] border border-[rgba(19,91,236,0.25)] flex items-center justify-center mb-5">
          <span className="text-[22px]" aria-hidden="true">🔍</span>
        </div>

        <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#5A6A8A] mb-2">
          404
        </p>
        <h1 className="font-display text-[24px] sm:text-[28px] font-normal text-[#E8F0FF] tracking-tight mb-2">
          We couldn&rsquo;t find that page
        </h1>
        <p className="text-[13.5px] text-[#A8B8D8] max-w-[380px] mb-8">
          The page you were looking for doesn&rsquo;t exist, may have moved, or the link may be
          out of date. Your workspace is still right here.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <GuardedNavLink
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] transition-colors"
          >
            ← Back to dashboard
          </GuardedNavLink>
          <GuardedNavLink
            href="/dashboard/reports"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-transparent border border-white/[0.12] text-[#A8B8D8] text-[13px] font-semibold hover:border-white/[0.25] hover:text-[#E8F0FF] transition-colors"
          >
            View reports
          </GuardedNavLink>
        </div>
      </div>
    </DashboardShell>
  )
}
