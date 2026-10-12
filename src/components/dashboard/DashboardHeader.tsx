// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import { cn } from '@/lib/cn'
// import { useLogout } from '@/hooks/useLogout'
// import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'

// interface DashboardHeaderProps {
//   /** Friendly workspace name shown top-left, e.g. "Kall's workspace" */
//   workspaceName: string
//   firstName: string
//   email?: string
//   /** Set true to show the small unread dot on the bell */
//   hasNotifications?: boolean
// }

// /**
//  * DashboardHeader
//  * ─────────────────
//  * Top chrome bar shared by every dashboard page:
//  *  - workspace name (left)
//  *  - notification bell (right)
//  *  - profile avatar → dropdown with "Profile" + "Logout" (right)
//  *
//  * Accessibility: both triggers expose aria-haspopup/aria-expanded/
//  * aria-controls, the panels carry role="menu" (or role="region" for the
//  * read-only notifications panel), and menu items carry role="menuitem".
//  *
//  * Both "Profile" and "Log out" route through the unsaved-changes guard,
//  * so leaving an in-progress application from the header prompts first
//  * instead of discarding answers silently.
//  */
// export function DashboardHeader({ workspaceName, firstName, email, hasNotifications = true }: DashboardHeaderProps) {
//   const { handleLogout, isLoggingOut } = useLogout()
//   const { isDirty, guardedNavigate } = useUnsavedChangesGuard()
//   const [menuOpen, setMenuOpen] = useState(false)
//   const [notifOpen, setNotifOpen] = useState(false)
//   const menuRef = useRef<HTMLDivElement>(null)
//   const notifRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
//       if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
//     }
//     function handleEscape(e: KeyboardEvent) {
//       if (e.key === 'Escape') {
//         setMenuOpen(false)
//         setNotifOpen(false)
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside)
//     document.addEventListener('keydown', handleEscape)
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//       document.removeEventListener('keydown', handleEscape)
//     }
//   }, [])

//   function handleLogoutClick() {
//     if (isDirty && !window.confirm(
//       'You have unsaved answers on this application. Log out anyway without saving?'
//     )) {
//       return
//     }
//     setMenuOpen(false)
//     handleLogout()
//   }

//   const initials = firstName?.trim()?.[0]?.toUpperCase() || 'U'

//   return (
//     <header className="flex items-center justify-between h-[60px] px-5 sm:px-8 border-b border-white/[0.06] bg-[#0F1525] shrink-0 sticky top-0 z-30">
//       {/* ── Workspace name ─────────────────────────────────── */}
//       <div className="flex items-center gap-2 min-w-0">
//         <span className="w-1.5 h-1.5 rounded-full bg-[#135BEC] shrink-0" />
//         <p className="text-[13.5px] font-medium text-[#E8F0FF] truncate">{workspaceName}</p>
//       </div>

//       {/* ── Right cluster ──────────────────────────────────── */}
//       <div className="flex items-center gap-2 sm:gap-3">

//         {/* Notification bell */}
//         <div className="relative" ref={notifRef}>
//           <button
//             type="button"
//             aria-label="Notifications"
//             aria-haspopup="true"
//             aria-expanded={notifOpen}
//             aria-controls="notifications-panel"
//             onClick={() => {
//               setNotifOpen(o => !o)
//               setMenuOpen(false)
//             }}
//             className="relative w-9 h-9 flex items-center justify-center rounded-[10px] text-[#A8B8D8] hover:text-[#E8F0FF] hover:bg-white/[0.06] transition-colors"
//           >
//             <BellIcon />
//             {hasNotifications && (
//               <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#135BEC] shadow-[0_0_6px_rgba(19,91,236,0.8)]" />
//             )}
//           </button>

//           {notifOpen && (
//             <div
//               id="notifications-panel"
//               role="region"
//               aria-label="Notifications"
//               className="absolute right-0 mt-2 w-[280px] rounded-[12px] border border-white/[0.08] bg-[#0F1525] shadow-[0_12px_32px_rgba(0,0,0,0.4)] overflow-hidden"
//             >
//               <div className="px-4 py-3 border-b border-white/[0.06]">
//                 <p className="text-[13px] font-semibold text-[#E8F0FF]">Notifications</p>
//               </div>
//               <div className="px-4 py-6 text-center">
//                 <p className="text-[12.5px] text-[#5A6A8A]">You&rsquo;re all caught up.</p>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Profile avatar + dropdown */}
//         <div className="relative" ref={menuRef}>
//           <button
//             type="button"
//             aria-label="Account menu"
//             aria-haspopup="menu"
//             aria-expanded={menuOpen}
//             aria-controls="account-menu"
//             onClick={() => {
//               setMenuOpen(o => !o)
//               setNotifOpen(false)
//             }}
//             className="w-9 h-9 rounded-full bg-[rgba(19,91,236,0.12)] border border-[rgba(19,91,236,0.3)] text-[#135BEC] text-[13px] font-semibold flex items-center justify-center hover:bg-[rgba(19,91,236,0.2)] transition-colors"
//           >
//             {initials}
//           </button>

//           {menuOpen && (
//             <div
//               id="account-menu"
//               role="menu"
//               aria-label="Account"
//               className="absolute right-0 mt-2 w-[220px] rounded-[12px] border border-white/[0.08] bg-[#0F1525] shadow-[0_12px_32px_rgba(0,0,0,0.4)] overflow-hidden"
//             >
//               <div className="px-4 py-3 border-b border-white/[0.06]">
//                 <p className="text-[13px] font-semibold text-[#E8F0FF] truncate">{firstName}</p>
//                 {email && <p className="text-[11.5px] text-[#5A6A8A] truncate mt-0.5">{email}</p>}
//               </div>

//               <a
//                 href="/dashboard/profile"
//                 role="menuitem"
//                 onClick={e => {
//                   e.preventDefault()
//                   setMenuOpen(false)
//                   guardedNavigate('/dashboard/profile')
//                 }}
//                 className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors cursor-pointer"
//               >
//                 <UserIcon />
//                 Profile
//               </a>

//               <button
//                 type="button"
//                 role="menuitem"
//                 onClick={handleLogoutClick}
//                 disabled={isLoggingOut}
//                 className={cn(
//                   'w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-left transition-colors border-t border-white/[0.06]',
//                   isLoggingOut ? 'text-[#5A6A8A] cursor-not-allowed' : 'text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.08)]'
//                 )}
//               >
//                 <LogoutIcon />
//                 {isLoggingOut ? 'Logging out…' : 'Log out'}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   )
// }

// // ── Icons ───────────────────────────────────────────────────────
// function BellIcon() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//       <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
//       <path d="M13.73 21a2 2 0 0 1-3.46 0" />
//     </svg>
//   )
// }

// function UserIcon() {
//   return (
//     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//       <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
//       <circle cx="12" cy="7" r="4" />
//     </svg>
//   )
// }

// function LogoutIcon() {
//   return (
//     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
//       <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
//       <polyline points="16 17 21 12 16 7" />
//       <line x1="21" y1="12" x2="9" y2="12" />
//     </svg>
//   )
// }


'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { useLogout } from '@/hooks/useLogout'
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'

interface DashboardHeaderProps {
  /** Friendly workspace name shown top-left, e.g. "Kall's workspace" */
  workspaceName: string
  firstName: string
  email?: string
  /** Cloudinary URL set via /dashboard/profile. Falls back to initials when absent. */
  avatarUrl?: string | null
  /** Set true to show the small unread dot on the bell */
  hasNotifications?: boolean
}

/**
 * DashboardHeader
 * ─────────────────
 * Top chrome bar shared by every dashboard page:
 *  - workspace name (left)
 *  - notification bell (right)
 *  - profile avatar → dropdown with "Profile" + "Logout" (right)
 *
 * Accessibility: both triggers expose aria-haspopup/aria-expanded/
 * aria-controls, the panels carry role="menu" (or role="region" for the
 * read-only notifications panel), and menu items carry role="menuitem".
 *
 * Both "Profile" and "Log out" route through the unsaved-changes guard,
 * so leaving an in-progress application from the header prompts first
 * instead of discarding answers silently.
 */
export function DashboardHeader({ workspaceName, firstName, email, avatarUrl, hasNotifications = true }: DashboardHeaderProps) {
  const { handleLogout, isLoggingOut } = useLogout()
  const { isDirty, guardedNavigate } = useUnsavedChangesGuard()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleLogoutClick() {
    if (isDirty && !window.confirm(
      'You have unsaved answers on this application. Log out anyway without saving?'
    )) {
      return
    }
    setMenuOpen(false)
    handleLogout()
  }

  const initials = firstName?.trim()?.[0]?.toUpperCase() || 'U'

  return (
    <header className="flex items-center justify-between h-[60px] px-5 sm:px-8 border-b border-white/[0.06] bg-[#0F1525] shrink-0 sticky top-0 z-30">
      {/* ── Workspace name ─────────────────────────────────── */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#135BEC] shrink-0" />
        <p className="text-[13.5px] font-medium text-[#E8F0FF] truncate">{workspaceName}</p>
      </div>

      {/* ── Right cluster ──────────────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={notifOpen}
            aria-controls="notifications-panel"
            onClick={() => {
              setNotifOpen(o => !o)
              setMenuOpen(false)
            }}
            className="relative w-9 h-9 flex items-center justify-center rounded-[10px] text-[#A8B8D8] hover:text-[#E8F0FF] hover:bg-white/[0.06] transition-colors"
          >
            <BellIcon />
            {hasNotifications && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#135BEC] shadow-[0_0_6px_rgba(19,91,236,0.8)]" />
            )}
          </button>

          {notifOpen && (
            <div
              id="notifications-panel"
              role="region"
              aria-label="Notifications"
              className="absolute right-0 mt-2 w-[280px] rounded-[12px] border border-white/[0.08] bg-[#0F1525] shadow-[0_12px_32px_rgba(0,0,0,0.4)] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-[13px] font-semibold text-[#E8F0FF]">Notifications</p>
              </div>
              <div className="px-4 py-6 text-center">
                <p className="text-[12.5px] text-[#5A6A8A]">You&rsquo;re all caught up.</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile avatar + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls="account-menu"
            onClick={() => {
              setMenuOpen(o => !o)
              setNotifOpen(false)
            }}
            className="w-9 h-9 rounded-full overflow-hidden bg-[rgba(19,91,236,0.12)] border border-[rgba(19,91,236,0.3)] text-[#135BEC] text-[13px] font-semibold flex items-center justify-center hover:bg-[rgba(19,91,236,0.2)] transition-colors"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </button>

          {menuOpen && (
            <div
              id="account-menu"
              role="menu"
              aria-label="Account"
              className="absolute right-0 mt-2 w-[220px] rounded-[12px] border border-white/[0.08] bg-[#0F1525] shadow-[0_12px_32px_rgba(0,0,0,0.4)] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-[13px] font-semibold text-[#E8F0FF] truncate">{firstName}</p>
                {email && <p className="text-[11.5px] text-[#5A6A8A] truncate mt-0.5">{email}</p>}
              </div>

              <a
                href="/dashboard/profile"
                role="menuitem"
                onClick={e => {
                  e.preventDefault()
                  setMenuOpen(false)
                  guardedNavigate('/dashboard/profile')
                }}
                className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors cursor-pointer"
              >
                <UserIcon />
                Profile
              </a>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogoutClick}
                disabled={isLoggingOut}
                className={cn(
                  'w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-left transition-colors border-t border-white/[0.06]',
                  isLoggingOut ? 'text-[#5A6A8A] cursor-not-allowed' : 'text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.08)]'
                )}
              >
                <LogoutIcon />
                {isLoggingOut ? 'Logging out…' : 'Log out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ── Icons ───────────────────────────────────────────────────────
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}