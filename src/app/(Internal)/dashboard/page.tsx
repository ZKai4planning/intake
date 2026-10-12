// 'use client'

// import { useRouter } from 'next/navigation'

// import { WidgetRenderer } from '@/components/dashboard/WidgetRenderer'
// import { GuardedNavLink } from '@/components/dashboard/GuardedNavLink'
// import { useWorkspace } from '@/hooks/Useworkspace'
// import { DashboardShell } from '@/components/dashboard/Dashboardshell'

// /**
//  * /dashboard
//  * ───────────
//  * Single route, completely different rendering per workspace tier.
//  * The user never sees which "actor" they are — they just see a
//  * dashboard shaped for their workspace, resolved from the session.
//  *
//  * This page is now ONLY the projects overview (widget grid). The
//  * "create application" flow (intent confirmation → tiered intake form)
//  * lives on its own routes under /dashboard/new/* — see that folder for
//  * why: keeping it as client-state on this same URL meant every nav
//  * link pointing at /dashboard silently did nothing while a user was
//  * mid-application, since there was no URL change to navigate to.
//  *
//  * Flow:
//  *  1. useWorkspace() reads session (set during verify-email/mfa-verify)
//  *  2. Resolves WorkspaceConfig from session.actorId (backend-issued)
//  *  3. Renders DashboardShell with workspace.navSections
//  *  4. Loops workspace.widgets through WidgetRenderer
//  *
//  * If no session exists, redirects to /login.
//  */
// export default function DashboardPage() {
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

//       {/* ── Greeting ──────────────────────────────────────────── */}
//       <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
//         <div>
//           <h1 className="font-display text-[26px] sm:text-[30px] font-normal text-[#E8F0FF] tracking-tight">
//             Welcome back, {firstName}
//           </h1>
//           <p className="text-[13.5px] text-[#A8B8D8] mt-1">
//             Here&rsquo;s an overview of your {workspace.greetingNoun}.
//           </p>
//         </div>

//         <GuardedNavLink
//           href="/dashboard/new/intent"
//           className="shrink-0 px-4 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] transition-colors inline-block"
//         >
//           Start new application →
//         </GuardedNavLink>
//       </div>

//       {/* ── Widget grid — driven entirely by workspace.widgets ── */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//         {workspace.widgets.map(widgetId => (
//           <WidgetRenderer key={widgetId} widgetId={widgetId} workspace={workspace} />
//         ))}
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

import { WidgetRenderer } from '@/components/dashboard/WidgetRenderer'
import { ActivityLogWidget } from '@/components/dashboard/widgets/ActivityLogWidget'
import { GuardedNavLink } from '@/components/dashboard/GuardedNavLink'
import { useWorkspace } from '@/hooks/Useworkspace'
import { DashboardShell } from '@/components/dashboard/Dashboardshell'

/**
 * /dashboard
 * ───────────
 * Single route, completely different rendering per workspace tier.
 * The user never sees which "actor" they are — they just see a
 * dashboard shaped for their workspace, resolved from the session.
 *
 * This page is now ONLY the projects overview (widget grid). The
 * "create application" flow (intent confirmation → tiered intake form)
 * lives on its own routes under /dashboard/new/* — see that folder for
 * why: keeping it as client-state on this same URL meant every nav
 * link pointing at /dashboard silently did nothing while a user was
 * mid-application, since there was no URL change to navigate to.
 *
 * Flow:
 *  1. useWorkspace() reads session (set during verify-email/mfa-verify)
 *  2. Resolves WorkspaceConfig from session.actorId (backend-issued)
 *  3. Renders DashboardShell with workspace.navSections
 *  4. Loops workspace.widgets through WidgetRenderer
 *
 * If no session exists, redirects to /login.
 */
export default function DashboardPage() {
  const router = useRouter()
  const { isLoading, session, workspace, firstName } = useWorkspace()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#5A6A8A]">
          <Spinner />
          Loading your workspace…
        </div>
      </div>
    )
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

      {/* ── Greeting ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="font-display text-[26px] sm:text-[30px] font-normal text-[#E8F0FF] tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-[13.5px] text-[#A8B8D8] mt-1">
            Here&rsquo;s an overview of your {workspace.greetingNoun}.
          </p>
        </div>

        <GuardedNavLink
          href="/dashboard/new/intent"
          className="shrink-0 px-4 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] transition-colors inline-block"
        >
          Start new application →
        </GuardedNavLink>
      </div>

      {/* ── Widget grid — driven entirely by workspace.widgets ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {workspace.widgets.map(widgetId => (
          <WidgetRenderer key={widgetId} widgetId={widgetId} workspace={workspace} />
        ))}
      </div>

      <ActivityLogWidget />
    </DashboardShell>
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
