// // 'use client'

// // import { usePathname } from 'next/navigation'
// // import { cn } from '@/lib/cn'
// // import { Logo } from '@/components/ui/Logo'
// // import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
// // import { DashboardFooter } from '@/components/dashboard/DashboardFooter'
// // import { GuardedNavLink } from '@/components/dashboard/GuardedNavLink'
// // import { ProfileCompletionCard } from '@/components/dashboard/ProfileCompletionCard'
// // import { useWorkspace } from '@/hooks/Useworkspace'
// // import type { WorkspaceConfig } from '@/types/workspace'

// // interface DashboardShellProps {
// //   workspace: WorkspaceConfig
// //   firstName: string
// //   /** Shown in the account dropdown; optional since not every caller has it handy */
// //   email?: string
// //   children:  React.ReactNode
// // }

// // /**
// //  * DashboardShell
// //  * ───────────────
// //  * Renders the dashboard chrome: top bar + side nav, driven entirely by
// //  * workspace.navSections. The nav items differ per workspace tier but
// //  * the SAME component renders all of them — no actor-specific branching
// //  * happens in JSX, only in the data passed down.
// //  *
// //  * The sidebar is `sticky top-0 h-screen` and is its own internal flex
// //  * column (`nav` scrolls if it overflows, the completion card is
// //  * `shrink-0` below it) — so on tall pages the sidebar stays pinned to
// //  * the viewport instead of scrolling away with the main content, and
// //  * the profile-completion card at the bottom is always visible.
// //  */
// // export function DashboardShell({ workspace, firstName, email, children }: DashboardShellProps) {
// //   const pathname = usePathname()
// //   const workspaceName = `${firstName}\u2019s workspace`
// //   // Independent read — just for the completion card below, so this
// //   // component doesn't need phone/mfaEnabled threaded through every
// //   // caller's props.
// //   const { session } = useWorkspace()

// //   return (
// //     <div className="min-h-screen bg-[#0A0E1A] flex">

// //       {/* ── Sidebar ──────────────────────────────────────────── */}
// //       <aside className="hidden md:flex md:w-[220px] flex-col sticky top-0 h-screen border-r border-white/[0.06] bg-[#0F1525] shrink-0">
// //         <div className="h-[60px] flex items-center px-5 border-b border-white/[0.06] shrink-0">
// //           <Logo size="sm" />
// //         </div>

// //         <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-1">
// //           {workspace.navSections.map(item => {
// //             const isActive = pathname === item.href
// //             return (
// //               <GuardedNavLink
// //                 key={item.href}
// //                 href={item.href}
// //                 className={cn(
// //                   'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-colors',
// //                   isActive
// //                     ? 'bg-[rgba(19,91,236,0.10)] text-[#135BEC]'
// //                     : 'text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF]'
// //                 )}
// //               >
// //                 <NavIcon name={item.icon} active={isActive} />
// //                 {item.label}
// //               </GuardedNavLink>
// //             )
// //           })}
// //         </nav>

// //         <div className="shrink-0">
// //           <ProfileCompletionCard
// //             phoneSet={!!session?.phone}
// //             mfaEnabled={!!session?.mfaEnabled}
// //           />
// //         </div>

// //       </aside>

// //       {/* ── Main column ──────────────────────────────────────── */}
// //       <div className="flex-1 flex flex-col min-w-0">

// //         {/* Mobile logo bar */}
// //         <div className="md:hidden flex items-center justify-between h-[60px] px-5 border-b border-white/[0.06] bg-[#0F1525]">
// //           <Logo size="sm" />
// //         </div>

// //         {/* Header: workspace name + notifications + profile */}
// //         <DashboardHeader workspaceName={workspaceName} firstName={firstName} email={email} />

// //         <main className="flex-1 px-5 sm:px-8 lg:px-10 py-7 w-full max-w-[1600px] mx-auto">
// //           {children}
// //         </main>

// //         <DashboardFooter />

// //         {/* Mobile bottom nav */}
// //         <nav className="md:hidden flex items-center justify-around border-t border-white/[0.06] bg-[#0F1525] py-2 px-2 sticky bottom-0">
// //           {workspace.navSections.slice(0, 4).map(item => {
// //             const isActive = pathname === item.href
// //             return (
// //               <GuardedNavLink
// //                 key={item.href}
// //                 href={item.href}
// //                 className={cn(
// //                   'flex flex-col items-center gap-1 px-3 py-1.5 rounded-[8px] text-[10px] font-medium',
// //                   isActive ? 'text-[#135BEC]' : 'text-[#5A6A8A]'
// //                 )}
// //               >
// //                 <NavIcon name={item.icon} active={isActive} size={18} />
// //                 {item.label}
// //               </GuardedNavLink>
// //             )
// //           })}
// //         </nav>
// //       </div>
// //     </div>
// //   )
// // }

// // // ── Icon set (inline SVG, no external icon lib needed) ────────────
// // function NavIcon({ name, active, size = 16 }: { name: string; active: boolean; size?: number }) {
// //   const color = active ? '#135BEC' : 'currentColor'
// //   const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

// //   switch (name) {
// //     case 'home':       return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
// //     case 'building':   return <svg {...props}><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></svg>
// //     case 'layers':     return <svg {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
// //     case 'briefcase':  return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
// //     case 'grid':       return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
// //     case 'shield':     return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
// //     case 'file':       return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
// //     case 'compass':    return <svg {...props}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
// //     case 'users':      return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
// //     case 'card':       return <svg {...props}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
// //     case 'check-sq':   return <svg {...props}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
// //     case 'code':       return <svg {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
// //     case 'edit':       return <svg {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
// //     case 'upload':     return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
// //     case 'help':       return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
// //     default:           return <svg {...props}><circle cx="12" cy="12" r="3"/></svg>
// //   }
// // }


// // 'use client'

// // import { usePathname } from 'next/navigation'
// // import { cn } from '@/lib/cn'
// // import { Logo } from '@/components/ui/Logo'
// // import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
// // import { DashboardFooter } from '@/components/dashboard/DashboardFooter'
// // import { GuardedNavLink } from '@/components/dashboard/GuardedNavLink'
// // import { ProfileCompletionCard } from '@/components/dashboard/ProfileCompletionCard'
// // import { useWorkspace } from '@/hooks/Useworkspace'
// // import type { WorkspaceConfig } from '@/types/workspace'

// // interface DashboardShellProps {
// //   workspace: WorkspaceConfig
// //   firstName: string
// //   /** Shown in the account dropdown; optional since not every caller has it handy */
// //   email?: string
// //   children:  React.ReactNode
// // }

// // /**
// //  * DashboardShell
// //  * ───────────────
// //  * Renders the dashboard chrome: top bar + side nav, driven entirely by
// //  * workspace.navSections. The nav items differ per workspace tier but
// //  * the SAME component renders all of them — no actor-specific branching
// //  * happens in JSX, only in the data passed down.
// //  *
// //  * The sidebar is `sticky top-0 h-screen` and is its own internal flex
// //  * column (`nav` scrolls if it overflows, the completion card is
// //  * `shrink-0` below it) — so on tall pages the sidebar stays pinned to
// //  * the viewport instead of scrolling away with the main content, and
// //  * the profile-completion card at the bottom is always visible.
// //  */
// // export function DashboardShell({ workspace, firstName, email, children }: DashboardShellProps) {
// //   const pathname = usePathname()
// //   const workspaceName = `${firstName}\u2019s workspace`
// //   // Independent read — just for the completion card below, so this
// //   // component doesn't need phone/mfaEnabled threaded through every
// //   // caller's props.
// //   const { session } = useWorkspace()

// //   return (
// //     <div className="min-h-screen bg-[#0A0E1A] flex">

// //       {/* ── Sidebar ──────────────────────────────────────────── */}
// //       <aside className="hidden md:flex md:w-[220px] flex-col sticky top-0 h-screen border-r border-white/[0.06] bg-[#0F1525] shrink-0">
// //         <div className="h-[60px] flex items-center px-5 border-b border-white/[0.06] shrink-0">
// //           <Logo size="sm" />
// //         </div>

// //         <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-1">
// //           {workspace.navSections.map(item => {
// //             const isActive = pathname === item.href
// //             return (
// //               <GuardedNavLink
// //                 key={item.href}
// //                 href={item.href}
// //                 className={cn(
// //                   'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-colors',
// //                   isActive
// //                     ? 'bg-[rgba(19,91,236,0.10)] text-[#135BEC]'
// //                     : 'text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF]'
// //                 )}
// //               >
// //                 <NavIcon name={item.icon} active={isActive} />
// //                 {item.label}
// //               </GuardedNavLink>
// //             )
// //           })}
// //         </nav>

// //         <div className="shrink-0">
// //           <ProfileCompletionCard
// //             phoneSet={!!session?.phone}
// //             mfaEnabled={!!session?.mfaEnabled}
// //           />
// //         </div>

// //       </aside>

// //       {/* ── Main column ──────────────────────────────────────── */}
// //       <div className="flex-1 flex flex-col min-w-0">

// //         {/* Mobile logo bar */}
// //         <div className="md:hidden flex items-center justify-between h-[60px] px-5 border-b border-white/[0.06] bg-[#0F1525]">
// //           <Logo size="sm" />
// //         </div>

// //         {/* Header: workspace name + notifications + profile */}
// //         <DashboardHeader workspaceName={workspaceName} firstName={firstName} email={email} avatarUrl={session?.avatarUrl} />

// //         <main className="flex-1 px-5 sm:px-8 lg:px-10 py-7 w-full max-w-[1600px] mx-auto">
// //           {children}
// //         </main>

// //         <DashboardFooter />

// //         {/* Mobile bottom nav */}
// //         <nav className="md:hidden flex items-center justify-around border-t border-white/[0.06] bg-[#0F1525] py-2 px-2 sticky bottom-0">
// //           {workspace.navSections.slice(0, 4).map(item => {
// //             const isActive = pathname === item.href
// //             return (
// //               <GuardedNavLink
// //                 key={item.href}
// //                 href={item.href}
// //                 className={cn(
// //                   'flex flex-col items-center gap-1 px-3 py-1.5 rounded-[8px] text-[10px] font-medium',
// //                   isActive ? 'text-[#135BEC]' : 'text-[#5A6A8A]'
// //                 )}
// //               >
// //                 <NavIcon name={item.icon} active={isActive} size={18} />
// //                 {item.label}
// //               </GuardedNavLink>
// //             )
// //           })}
// //         </nav>
// //       </div>
// //     </div>
// //   )
// // }

// // // ── Icon set (inline SVG, no external icon lib needed) ────────────
// // function NavIcon({ name, active, size = 16 }: { name: string; active: boolean; size?: number }) {
// //   const color = active ? '#135BEC' : 'currentColor'
// //   const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

// //   switch (name) {
// //     case 'home':       return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
// //     case 'building':   return <svg {...props}><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></svg>
// //     case 'layers':     return <svg {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
// //     case 'briefcase':  return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
// //     case 'grid':       return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
// //     case 'shield':     return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
// //     case 'file':       return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
// //     case 'compass':    return <svg {...props}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
// //     case 'users':      return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
// //     case 'card':       return <svg {...props}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
// //     case 'check-sq':   return <svg {...props}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
// //     case 'code':       return <svg {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
// //     case 'edit':       return <svg {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
// //     case 'upload':     return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
// //     case 'help':       return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
// //     default:           return <svg {...props}><circle cx="12" cy="12" r="3"/></svg>
// //   }
// // }

// 'use client'

// import { usePathname } from 'next/navigation'
// import { cn } from '@/lib/cn'
// import { Logo } from '@/components/ui/Logo'
// import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
// import { DashboardFooter } from '@/components/dashboard/DashboardFooter'
// import { GuardedNavLink } from '@/components/dashboard/GuardedNavLink'
// import { ProfileCompletionCard } from '@/components/dashboard/ProfileCompletionCard'
// import { useWorkspace } from '@/hooks/Useworkspace'
// import type { WorkspaceConfig } from '@/types/workspace'

// interface DashboardShellProps {
//   workspace: WorkspaceConfig
//   firstName: string
//   /** Shown in the account dropdown; optional since not every caller has it handy */
//   email?: string
//   children:  React.ReactNode
// }

// /**
//  * DashboardShell
//  * ───────────────
//  * Renders the dashboard chrome: top bar + side nav, driven entirely by
//  * workspace.navSections. The nav items differ per workspace tier but
//  * the SAME component renders all of them — no actor-specific branching
//  * happens in JSX, only in the data passed down.
//  *
//  * The sidebar is `sticky top-0 h-screen` and is its own internal flex
//  * column (`nav` scrolls if it overflows, the completion card is
//  * `shrink-0` below it) — so on tall pages the sidebar stays pinned to
//  * the viewport instead of scrolling away with the main content, and
//  * the profile-completion card at the bottom is always visible.
//  */
// export function DashboardShell({ workspace, firstName, email, children }: DashboardShellProps) {
//   const pathname = usePathname()
//   const workspaceName = `${firstName}\u2019s workspace`
//   // Independent read — just for the completion card below, so this
//   // component doesn't need phone/mfaEnabled threaded through every
//   // caller's props.
//   const { session } = useWorkspace()

//   return (
//     <div className="min-h-screen bg-[#0A0E1A] flex">

//       {/* ── Sidebar ──────────────────────────────────────────── */}
//       <aside className="hidden md:flex md:w-[220px] flex-col sticky top-0 h-screen border-r border-white/[0.06] bg-[#0F1525] shrink-0">
//         <div className="h-[60px] flex items-center px-5 border-b border-white/[0.06] shrink-0">
//           <Logo size="lg" showWordmark />
//         </div>

//         <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-1">
//           <GuardedNavLink
//             href="/"
//             className={cn(
//               'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-colors',
//               pathname === '/'
//                 ? 'bg-[rgba(19,91,236,0.10)] text-[#135BEC]'
//                 : 'text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF]'
//             )}
//           >
//             <NavIcon name="home" active={pathname === '/'} />
//             Home
//           </GuardedNavLink>

//           {workspace.navSections.map(item => {
//             const isActive = pathname === item.href
//             return (
//               <GuardedNavLink
//                 key={item.href}
//                 href={item.href}
//                 className={cn(
//                   'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-colors',
//                   isActive
//                     ? 'bg-[rgba(19,91,236,0.10)] text-[#135BEC]'
//                     : 'text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF]'
//                 )}
//               >
//                 <NavIcon name={item.icon} active={isActive} />
//                 {item.label}
//               </GuardedNavLink>
//             )
//           })}
//         </nav>

//         <div className="shrink-0">
//           <ProfileCompletionCard
//             accountCreated={!!session}
//             avatarSet={!!session?.avatarUrl}
//             phoneSet={!!session?.phone}
//             mfaEnabled={!!session?.mfaEnabled}
//           />
//         </div>

//       </aside>

//       {/* ── Main column ──────────────────────────────────────── */}
//       <div className="flex-1 flex flex-col min-w-0">

//         {/* Mobile logo bar */}
//         <div className="md:hidden flex items-center justify-between h-[60px] px-5 border-b border-white/[0.06] bg-[#0F1525]">
//           <Logo size="lg" showWordmark />
//         </div>

//         {/* Header: workspace name + notifications + profile */}
//         <DashboardHeader workspaceName={workspaceName} firstName={firstName} email={email} avatarUrl={session?.avatarUrl} />

//         <main className="flex-1 px-5 sm:px-8 lg:px-10 py-7 w-full max-w-[1600px] mx-auto">
//           {children}
//         </main>

//         <DashboardFooter />

//         {/* Mobile bottom nav */}
//         <nav className="md:hidden flex items-center justify-around border-t border-white/[0.06] bg-[#0F1525] py-2 px-2 sticky bottom-0">
//           {workspace.navSections.slice(0, 4).map(item => {
//             const isActive = pathname === item.href
//             return (
//               <GuardedNavLink
//                 key={item.href}
//                 href={item.href}
//                 className={cn(
//                   'flex flex-col items-center gap-1 px-3 py-1.5 rounded-[8px] text-[10px] font-medium',
//                   isActive ? 'text-[#135BEC]' : 'text-[#5A6A8A]'
//                 )}
//               >
//                 <NavIcon name={item.icon} active={isActive} size={18} />
//                 {item.label}
//               </GuardedNavLink>
//             )
//           })}
//         </nav>
//       </div>
//     </div>
//   )
// }

// // ── Icon set (inline SVG, no external icon lib needed) ────────────
// function NavIcon({ name, active, size = 16 }: { name: string; active: boolean; size?: number }) {
//   const color = active ? '#135BEC' : 'currentColor'
//   const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

//   switch (name) {
//     case 'home':       return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
//     case 'building':   return <svg {...props}><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></svg>
//     case 'layers':     return <svg {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
//     case 'briefcase':  return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
//     case 'grid':       return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
//     case 'shield':     return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
//     case 'file':       return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
//     case 'compass':    return <svg {...props}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
//     case 'users':      return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
//     case 'card':       return <svg {...props}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
//     case 'check-sq':   return <svg {...props}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
//     case 'code':       return <svg {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
//     case 'edit':       return <svg {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
//     case 'upload':     return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
//     case 'help':       return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
//     default:           return <svg {...props}><circle cx="12" cy="12" r="3"/></svg>
//   }
// }


// 'use client'

// import { usePathname } from 'next/navigation'
// import { cn } from '@/lib/cn'
// import { Logo } from '@/components/ui/Logo'
// import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
// import { DashboardFooter } from '@/components/dashboard/DashboardFooter'
// import { GuardedNavLink } from '@/components/dashboard/GuardedNavLink'
// import { ProfileCompletionCard } from '@/components/dashboard/ProfileCompletionCard'
// import { useWorkspace } from '@/hooks/Useworkspace'
// import type { WorkspaceConfig } from '@/types/workspace'

// interface DashboardShellProps {
//   workspace: WorkspaceConfig
//   firstName: string
//   /** Shown in the account dropdown; optional since not every caller has it handy */
//   email?: string
//   children:  React.ReactNode
// }

// /**
//  * DashboardShell
//  * ───────────────
//  * Renders the dashboard chrome: top bar + side nav, driven entirely by
//  * workspace.navSections. The nav items differ per workspace tier but
//  * the SAME component renders all of them — no actor-specific branching
//  * happens in JSX, only in the data passed down.
//  *
//  * The sidebar is `sticky top-0 h-screen` and is its own internal flex
//  * column (`nav` scrolls if it overflows, the completion card is
//  * `shrink-0` below it) — so on tall pages the sidebar stays pinned to
//  * the viewport instead of scrolling away with the main content, and
//  * the profile-completion card at the bottom is always visible.
//  */
// export function DashboardShell({ workspace, firstName, email, children }: DashboardShellProps) {
//   const pathname = usePathname()
//   const workspaceName = `${firstName}\u2019s workspace`
//   // Independent read — just for the completion card below, so this
//   // component doesn't need phone/mfaEnabled threaded through every
//   // caller's props.
//   const { session } = useWorkspace()

//   return (
//     <div className="min-h-screen bg-[#0A0E1A] flex">

//       {/* ── Sidebar ──────────────────────────────────────────── */}
//       <aside className="hidden md:flex md:w-[220px] flex-col sticky top-0 h-screen border-r border-white/[0.06] bg-[#0F1525] shrink-0">
//         <div className="h-[60px] flex items-center px-5 border-b border-white/[0.06] shrink-0">
//           <Logo size="sm" />
//         </div>

//         <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-1">
//           {workspace.navSections.map(item => {
//             const isActive = pathname === item.href
//             return (
//               <GuardedNavLink
//                 key={item.href}
//                 href={item.href}
//                 className={cn(
//                   'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-colors',
//                   isActive
//                     ? 'bg-[rgba(19,91,236,0.10)] text-[#135BEC]'
//                     : 'text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF]'
//                 )}
//               >
//                 <NavIcon name={item.icon} active={isActive} />
//                 {item.label}
//               </GuardedNavLink>
//             )
//           })}
//         </nav>

//         <div className="shrink-0">
//           <ProfileCompletionCard
//             phoneSet={!!session?.phone}
//             mfaEnabled={!!session?.mfaEnabled}
//           />
//         </div>

//       </aside>

//       {/* ── Main column ──────────────────────────────────────── */}
//       <div className="flex-1 flex flex-col min-w-0">

//         {/* Mobile logo bar */}
//         <div className="md:hidden flex items-center justify-between h-[60px] px-5 border-b border-white/[0.06] bg-[#0F1525]">
//           <Logo size="sm" />
//         </div>

//         {/* Header: workspace name + notifications + profile */}
//         <DashboardHeader workspaceName={workspaceName} firstName={firstName} email={email} />

//         <main className="flex-1 px-5 sm:px-8 lg:px-10 py-7 w-full max-w-[1600px] mx-auto">
//           {children}
//         </main>

//         <DashboardFooter />

//         {/* Mobile bottom nav */}
//         <nav className="md:hidden flex items-center justify-around border-t border-white/[0.06] bg-[#0F1525] py-2 px-2 sticky bottom-0">
//           {workspace.navSections.slice(0, 4).map(item => {
//             const isActive = pathname === item.href
//             return (
//               <GuardedNavLink
//                 key={item.href}
//                 href={item.href}
//                 className={cn(
//                   'flex flex-col items-center gap-1 px-3 py-1.5 rounded-[8px] text-[10px] font-medium',
//                   isActive ? 'text-[#135BEC]' : 'text-[#5A6A8A]'
//                 )}
//               >
//                 <NavIcon name={item.icon} active={isActive} size={18} />
//                 {item.label}
//               </GuardedNavLink>
//             )
//           })}
//         </nav>
//       </div>
//     </div>
//   )
// }

// // ── Icon set (inline SVG, no external icon lib needed) ────────────
// function NavIcon({ name, active, size = 16 }: { name: string; active: boolean; size?: number }) {
//   const color = active ? '#135BEC' : 'currentColor'
//   const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

//   switch (name) {
//     case 'home':       return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
//     case 'building':   return <svg {...props}><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></svg>
//     case 'layers':     return <svg {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
//     case 'briefcase':  return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
//     case 'grid':       return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
//     case 'shield':     return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
//     case 'file':       return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
//     case 'compass':    return <svg {...props}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
//     case 'users':      return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
//     case 'card':       return <svg {...props}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
//     case 'check-sq':   return <svg {...props}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
//     case 'code':       return <svg {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
//     case 'edit':       return <svg {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
//     case 'upload':     return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
//     case 'help':       return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
//     default:           return <svg {...props}><circle cx="12" cy="12" r="3"/></svg>
//   }
// }


// 'use client'

// import { usePathname } from 'next/navigation'
// import { cn } from '@/lib/cn'
// import { Logo } from '@/components/ui/Logo'
// import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
// import { DashboardFooter } from '@/components/dashboard/DashboardFooter'
// import { GuardedNavLink } from '@/components/dashboard/GuardedNavLink'
// import { ProfileCompletionCard } from '@/components/dashboard/ProfileCompletionCard'
// import { useWorkspace } from '@/hooks/Useworkspace'
// import type { WorkspaceConfig } from '@/types/workspace'

// interface DashboardShellProps {
//   workspace: WorkspaceConfig
//   firstName: string
//   /** Shown in the account dropdown; optional since not every caller has it handy */
//   email?: string
//   children:  React.ReactNode
// }

// /**
//  * DashboardShell
//  * ───────────────
//  * Renders the dashboard chrome: top bar + side nav, driven entirely by
//  * workspace.navSections. The nav items differ per workspace tier but
//  * the SAME component renders all of them — no actor-specific branching
//  * happens in JSX, only in the data passed down.
//  *
//  * The sidebar is `sticky top-0 h-screen` and is its own internal flex
//  * column (`nav` scrolls if it overflows, the completion card is
//  * `shrink-0` below it) — so on tall pages the sidebar stays pinned to
//  * the viewport instead of scrolling away with the main content, and
//  * the profile-completion card at the bottom is always visible.
//  */
// export function DashboardShell({ workspace, firstName, email, children }: DashboardShellProps) {
//   const pathname = usePathname()
//   const workspaceName = `${firstName}\u2019s workspace`
//   // Independent read — just for the completion card below, so this
//   // component doesn't need phone/mfaEnabled threaded through every
//   // caller's props.
//   const { session } = useWorkspace()

//   return (
//     <div className="min-h-screen bg-[#0A0E1A] flex">

//       {/* ── Sidebar ──────────────────────────────────────────── */}
//       <aside className="hidden md:flex md:w-[220px] flex-col sticky top-0 h-screen border-r border-white/[0.06] bg-[#0F1525] shrink-0">
//         <div className="h-[60px] flex items-center px-5 border-b border-white/[0.06] shrink-0">
//           <Logo size="sm" />
//         </div>

//         <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-1">
//           {workspace.navSections.map(item => {
//             const isActive = pathname === item.href
//             return (
//               <GuardedNavLink
//                 key={item.href}
//                 href={item.href}
//                 className={cn(
//                   'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-colors',
//                   isActive
//                     ? 'bg-[rgba(19,91,236,0.10)] text-[#135BEC]'
//                     : 'text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF]'
//                 )}
//               >
//                 <NavIcon name={item.icon} active={isActive} />
//                 {item.label}
//               </GuardedNavLink>
//             )
//           })}
//         </nav>

//         <div className="shrink-0">
//           <ProfileCompletionCard
//             phoneSet={!!session?.phone}
//             mfaEnabled={!!session?.mfaEnabled}
//           />
//         </div>

//       </aside>

//       {/* ── Main column ──────────────────────────────────────── */}
//       <div className="flex-1 flex flex-col min-w-0">

//         {/* Mobile logo bar */}
//         <div className="md:hidden flex items-center justify-between h-[60px] px-5 border-b border-white/[0.06] bg-[#0F1525]">
//           <Logo size="sm" />
//         </div>

//         {/* Header: workspace name + notifications + profile */}
//         <DashboardHeader workspaceName={workspaceName} firstName={firstName} email={email} avatarUrl={session?.avatarUrl} />

//         <main className="flex-1 px-5 sm:px-8 lg:px-10 py-7 w-full max-w-[1600px] mx-auto">
//           {children}
//         </main>

//         <DashboardFooter />

//         {/* Mobile bottom nav */}
//         <nav className="md:hidden flex items-center justify-around border-t border-white/[0.06] bg-[#0F1525] py-2 px-2 sticky bottom-0">
//           {workspace.navSections.slice(0, 4).map(item => {
//             const isActive = pathname === item.href
//             return (
//               <GuardedNavLink
//                 key={item.href}
//                 href={item.href}
//                 className={cn(
//                   'flex flex-col items-center gap-1 px-3 py-1.5 rounded-[8px] text-[10px] font-medium',
//                   isActive ? 'text-[#135BEC]' : 'text-[#5A6A8A]'
//                 )}
//               >
//                 <NavIcon name={item.icon} active={isActive} size={18} />
//                 {item.label}
//               </GuardedNavLink>
//             )
//           })}
//         </nav>
//       </div>
//     </div>
//   )
// }

// // ── Icon set (inline SVG, no external icon lib needed) ────────────
// function NavIcon({ name, active, size = 16 }: { name: string; active: boolean; size?: number }) {
//   const color = active ? '#135BEC' : 'currentColor'
//   const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

//   switch (name) {
//     case 'home':       return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
//     case 'building':   return <svg {...props}><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></svg>
//     case 'layers':     return <svg {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
//     case 'briefcase':  return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
//     case 'grid':       return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
//     case 'shield':     return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
//     case 'file':       return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
//     case 'compass':    return <svg {...props}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
//     case 'users':      return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
//     case 'card':       return <svg {...props}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
//     case 'check-sq':   return <svg {...props}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
//     case 'code':       return <svg {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
//     case 'edit':       return <svg {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
//     case 'upload':     return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
//     case 'help':       return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
//     default:           return <svg {...props}><circle cx="12" cy="12" r="3"/></svg>
//   }
// }

'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { Logo } from '@/components/ui/Logo'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { DashboardFooter } from '@/components/dashboard/DashboardFooter'
import { GuardedNavLink } from '@/components/dashboard/GuardedNavLink'
import { ProfileCompletionCard } from '@/components/dashboard/ProfileCompletionCard'
import { useWorkspace } from '@/hooks/Useworkspace'
import { AgentAssistantWidget } from '@/components/agentAssistant/AgentAssistantWidget'
import type { WorkspaceConfig } from '@/types/workspace'

interface DashboardShellProps {
  workspace: WorkspaceConfig
  firstName: string
  /** Shown in the account dropdown; optional since not every caller has it handy */
  email?: string
  children:  React.ReactNode
}

/**
 * DashboardShell
 * ───────────────
 * Renders the dashboard chrome: top bar + side nav, driven entirely by
 * workspace.navSections. The nav items differ per workspace tier but
 * the SAME component renders all of them — no actor-specific branching
 * happens in JSX, only in the data passed down.
 *
 * The sidebar is `sticky top-0 h-screen` and is its own internal flex
 * column (`nav` scrolls if it overflows, the completion card is
 * `shrink-0` below it) — so on tall pages the sidebar stays pinned to
 * the viewport instead of scrolling away with the main content, and
 * the profile-completion card at the bottom is always visible.
 */
export function DashboardShell({ workspace, firstName, email, children }: DashboardShellProps) {
  const pathname = usePathname()
  const workspaceName = `${firstName}\u2019s workspace`
  // Independent read — just for the completion card below, so this
  // component doesn't need phone/mfaEnabled threaded through every
  // caller's props.
  const { session } = useWorkspace()

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex">

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-[220px] flex-col sticky top-0 h-screen border-r border-white/[0.06] bg-[#0F1525] shrink-0">
        <div className="h-[60px] flex items-center px-5 border-b border-white/[0.06] shrink-0">
          <Logo size="sm" showWordmark />
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-1">
          <GuardedNavLink
            href="/"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-colors',
              pathname === '/'
                ? 'bg-[rgba(19,91,236,0.10)] text-[#135BEC]'
                : 'text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF]'
            )}
          >
            <NavIcon name="home" active={pathname === '/'} />
            Home
          </GuardedNavLink>

          {workspace.navSections.map(item => {
            const isActive = pathname === item.href
            return (
              <GuardedNavLink
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13.5px] font-medium transition-colors',
                  isActive
                    ? 'bg-[rgba(19,91,236,0.10)] text-[#135BEC]'
                    : 'text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF]'
                )}
              >
                <NavIcon name={item.icon} active={isActive} />
                {item.label}
              </GuardedNavLink>
            )
          })}
        </nav>

        <div className="shrink-0">
          <ProfileCompletionCard
            accountCreated={!!session}
            avatarSet={!!session?.avatarUrl}
            phoneSet={!!session?.phone}
            mfaEnabled={!!session?.mfaEnabled}
          />
        </div>

      </aside>

      {/* ── Main column ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile logo bar */}
        <div className="md:hidden flex items-center justify-between h-[60px] px-5 border-b border-white/[0.06] bg-[#0F1525]">
          <Logo size="sm" showWordmark />
        </div>

        {/* Header: workspace name + notifications + profile */}
        <DashboardHeader workspaceName={workspaceName} firstName={firstName} email={email} avatarUrl={session?.avatarUrl} />

        <main className="flex-1 px-5 sm:px-8 lg:px-10 py-7 w-full max-w-[1600px] mx-auto">
          {children}
        </main>

        <DashboardFooter />

        {/* Mobile bottom nav */}
        <nav className="md:hidden flex items-center justify-around border-t border-white/[0.06] bg-[#0F1525] py-2 px-2 sticky bottom-0">
          {workspace.navSections.slice(0, 4).map(item => {
            const isActive = pathname === item.href
            return (
              <GuardedNavLink
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-[8px] text-[10px] font-medium',
                  isActive ? 'text-[#135BEC]' : 'text-[#5A6A8A]'
                )}
              >
                <NavIcon name={item.icon} active={isActive} size={18} />
                {item.label}
              </GuardedNavLink>
            )
          })}
        </nav>
      </div>

      <AgentAssistantWidget surface="customer" />
    </div>
  )
}

// ── Icon set (inline SVG, no external icon lib needed) ────────────
function NavIcon({ name, active, size = 16 }: { name: string; active: boolean; size?: number }) {
  const color = active ? '#135BEC' : 'currentColor'
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  switch (name) {
    case 'home':       return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
    case 'building':   return <svg {...props}><rect x="4" y="2" width="16" height="20" rx="1"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></svg>
    case 'layers':     return <svg {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
    case 'briefcase':  return <svg {...props}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
    case 'grid':       return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    case 'shield':     return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    case 'file':       return <svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    case 'compass':    return <svg {...props}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
    case 'users':      return <svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    case 'card':       return <svg {...props}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
    case 'check-sq':   return <svg {...props}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
    case 'code':       return <svg {...props}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    case 'edit':       return <svg {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
    case 'upload':     return <svg {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
    case 'help':       return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17"/></svg>
    default:           return <svg {...props}><circle cx="12" cy="12" r="3"/></svg>
  }
}