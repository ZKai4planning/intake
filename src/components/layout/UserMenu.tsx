// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import { cn } from '@/lib/cn'
// import { useLogout } from '@/hooks/useLogout'

// interface UserMenuProps {
//   firstName: string
//   email?: string
// }

// /**
//  * UserMenu
//  * ─────────
//  * Shown in the public-site header (Navbar/NavMobile) once a session is
//  * detected, in place of the "Log in" / "Get started free" CTAs — so a
//  * returning, already-logged-in visitor to the homepage sees their name
//  * and a straight path back into the app instead of being asked to log
//  * in again.
//  */
// export function UserMenu({ firstName, email }: UserMenuProps) {
//   const { handleLogout, isLoggingOut } = useLogout()
//   const [open, setOpen] = useState(false)
//   const menuRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
//     }
//     function handleEscape(e: KeyboardEvent) {
//       if (e.key === 'Escape') setOpen(false)
//     }
//     document.addEventListener('mousedown', handleClickOutside)
//     document.addEventListener('keydown', handleEscape)
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//       document.removeEventListener('keydown', handleEscape)
//     }
//   }, [])

//   const initials = firstName?.trim()?.[0]?.toUpperCase() || 'U'

//   return (
//     <div className="flex items-center gap-2">
//       <a
//         href="/dashboard"
//         className="hidden sm:inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-[10px] bg-[#00D4FF] text-[#050A12] text-sm font-semibold shadow-[0_0_16px_rgba(0,212,255,0.30)] hover:bg-[#2A6BF0] hover:shadow-[0_0_24px_rgba(0,212,255,0.50)] hover:-translate-y-px transition-all duration-150"
//       >
//         Go to dashboard →
//       </a>

//       <div className="relative" ref={menuRef}>
//         <button
//           type="button"
//           aria-label="Account menu"
//           aria-haspopup="menu"
//           aria-expanded={open}
//           aria-controls="site-account-menu"
//           onClick={() => setOpen(o => !o)}
//           className="flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-full border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/30 transition-colors"
//         >
//           <span className="w-6 h-6 rounded-full bg-[rgba(0,212,255,0.14)] border border-[rgba(0,212,255,0.35)] text-[#00D4FF] text-[11px] font-semibold flex items-center justify-center">
//             {initials}
//           </span>
//           <span className="hidden md:inline text-[13px] font-medium text-[#E8F0FF] max-w-[120px] truncate">
//             {firstName}
//           </span>
//         </button>

//         {open && (
//           <div
//             id="site-account-menu"
//             role="menu"
//             aria-label="Account"
//             className="absolute right-0 mt-2 w-[220px] rounded-[12px] border border-white/[0.08] bg-[#0F1525] shadow-[0_12px_32px_rgba(0,0,0,0.4)] overflow-hidden z-40"
//           >
//             <div className="px-4 py-3 border-b border-white/[0.06]">
//               <p className="text-[13px] font-semibold text-[#E8F0FF] truncate">{firstName}</p>
//               {email && <p className="text-[11.5px] text-[#5A6A8A] truncate mt-0.5">{email}</p>}
//             </div>

//             <a
//               href="/dashboard/profile"
//               role="menuitem"
//               onClick={() => setOpen(false)}
//               className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors"
//             >
//               Profile
//             </a>

//             <a
//               href="/dashboard"
//               role="menuitem"
//               onClick={() => setOpen(false)}
//               className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors sm:hidden"
//             >
//               Go to dashboard
//             </a>

//             <button
//               type="button"
//               role="menuitem"
//               onClick={() => {
//                 setOpen(false)
//                 handleLogout()
//               }}
//               disabled={isLoggingOut}
//               className={cn(
//                 'w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-left transition-colors',
//                 isLoggingOut ? 'text-[#5A6A8A] cursor-not-allowed' : 'text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.08)]'
//               )}
//             >
//               {isLoggingOut ? 'Logging out…' : 'Log out'}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { useLogout } from '@/hooks/useLogout'

interface UserMenuProps {
  firstName: string
  email?: string
  /** Cloudinary URL set via /dashboard/profile. Falls back to initials when absent. */
  avatarUrl?: string | null
}

/**
 * UserMenu
 * ─────────
 * Shown in the public-site header (Navbar/NavMobile) once a session is
 * detected, in place of the "Log in" / "Get started free" CTAs — so a
 * returning, already-logged-in visitor to the homepage sees their name
 * and a straight path back into the app instead of being asked to log
 * in again.
 */
export function UserMenu({ firstName, email, avatarUrl }: UserMenuProps) {
  const { handleLogout, isLoggingOut } = useLogout()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const initials = firstName?.trim()?.[0]?.toUpperCase() || 'U'

  return (
    <div className="flex items-center gap-2">
      <a
        href="/dashboard"
        className="hidden sm:inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-[10px] bg-[#00D4FF] text-[#050A12] text-sm font-semibold shadow-[0_0_16px_rgba(0,212,255,0.30)] hover:bg-[#2A6BF0] hover:shadow-[0_0_24px_rgba(0,212,255,0.50)] hover:-translate-y-px transition-all duration-150"
      >
        Go to dashboard →
      </a>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls="site-account-menu"
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-full border border-white/20 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/30 transition-colors"
        >
          <span className="w-6 h-6 rounded-full overflow-hidden bg-[rgba(0,212,255,0.14)] border border-[rgba(0,212,255,0.35)] text-[#00D4FF] text-[11px] font-semibold flex items-center justify-center">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </span>
          <span className="hidden md:inline text-[13px] font-medium text-[#E8F0FF] max-w-[120px] truncate">
            {firstName}
          </span>
        </button>

        {open && (
          <div
            id="site-account-menu"
            role="menu"
            aria-label="Account"
            className="absolute right-0 mt-2 w-[220px] rounded-[12px] border border-white/[0.08] bg-[#0F1525] shadow-[0_12px_32px_rgba(0,0,0,0.4)] overflow-hidden z-40"
          >
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-[13px] font-semibold text-[#E8F0FF] truncate">{firstName}</p>
              {email && <p className="text-[11.5px] text-[#5A6A8A] truncate mt-0.5">{email}</p>}
            </div>

            <a
              href="/dashboard/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors"
            >
              Profile
            </a>

            <a
              href="/dashboard"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#A8B8D8] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors sm:hidden"
            >
              Go to dashboard
            </a>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                handleLogout()
              }}
              disabled={isLoggingOut}
              className={cn(
                'w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-left transition-colors',
                isLoggingOut ? 'text-[#5A6A8A] cursor-not-allowed' : 'text-[#FF6B6B] hover:bg-[rgba(255,107,107,0.08)]'
              )}
            >
              {isLoggingOut ? 'Logging out…' : 'Log out'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}