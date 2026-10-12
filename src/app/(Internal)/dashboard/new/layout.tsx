// 'use client'

// import { useRouter } from 'next/navigation'
// import { DashboardShell } from '@/components/dashboard/Dashboardshell'
// import { useWorkspace } from '@/hooks/Useworkspace'

// /**
//  * /dashboard/new/* layout
//  * ─────────────────────────
//  * Wraps both step routes of the "create application" flow:
//  *   /dashboard/new/intent        — resolve the actor for this application
//  *   /dashboard/new/[draftId]     — the tiered intake form (new or resumed)
//  *
//  * Each step is a real, addressable URL now (previously this was all
//  * client-state on top of /dashboard) — so sidebar/nav links, browser
//  * back/forward, and page refresh all behave correctly instead of
//  * silently no-op'ing or losing progress.
//  */
// export default function NewApplicationLayout({ children }: { children: React.ReactNode }) {
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
//       {children}
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
import { useWorkspace } from '@/hooks/Useworkspace'
import { DashboardLoading } from '@/components/dashboard/DashboardLoading'


/**
 * /dashboard/new/* layout
 * ─────────────────────────
 * Wraps both step routes of the "create application" flow:
 *   /dashboard/new/intent        — resolve the actor for this application
 *   /dashboard/new/[draftId]     — the tiered intake form (new or resumed)
 *
 * Each step is a real, addressable URL now (previously this was all
 * client-state on top of /dashboard) — so sidebar/nav links, browser
 * back/forward, and page refresh all behave correctly instead of
 * silently no-op'ing or losing progress.
 */
export default function NewApplicationLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoading, session, workspace, firstName } = useWorkspace()

  if (isLoading) {
    return <DashboardLoading label="Loading your workspace…" />
  }

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
      {children}
    </DashboardShell>
  )
}
