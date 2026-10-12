// 'use client'

// import Link from 'next/link'
// import { cn } from '@/lib/cn'
// import { Button } from '@/components/ui'
// import { Logo   } from '@/components/ui'
// import { useLogout } from '@/hooks/useLogout'
// import type { NavItem, NavCTA } from '@/types'

// interface NavMobileProps {
//   isOpen:    boolean
//   onClose:   () => void
//   items:     NavItem[]
//   ctas:      NavCTA[]
//   currentPath?: string
//   isLoggedIn?: boolean
//   firstName?:  string
//   email?:      string
// }

// /**
//  * NavMobile
//  * ──────────
//  * Full-screen overlay drawer for small screens.
//  * Slides down from the top with a backdrop.
//  * Closes on link click, backdrop click, or Escape (handled by useNavbar).
//  */
// export function NavMobile({
//   isOpen,
//   onClose,
//   items,
//   ctas,
//   currentPath,
//   isLoggedIn = false,
//   firstName,
//   email,
// }: NavMobileProps) {
//   const { handleLogout, isLoggingOut } = useLogout()
//   return (
//     <>
//       {/* ── Backdrop ──────────────────────────────────────────── */}
//       <div
//         aria-hidden="true"
//         className={cn(
//           'fixed inset-0 z-40 bg-[#0A0E1A]/80 backdrop-blur-sm transition-opacity duration-200 md:hidden',
//           isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
//         )}
//         onClick={onClose}
//       />

//       {/* ── Drawer ────────────────────────────────────────────── */}
//       <div
//         role="dialog"
//         aria-modal="true"
//         aria-label="Mobile navigation"
//         className={cn(
//           'fixed top-0 inset-x-0 z-50 md:hidden max-h-screen overflow-y-auto',
//           'bg-[#0F1525] border-b border-white/[0.08]',
//           'transition-transform duration-250 ease-[cubic-bezier(0.22,0.68,0,1.1)]',
//           isOpen ? 'translate-y-0' : '-translate-y-full'
//         )}
//       >
//         {/* Header row */}
//         <div className="flex items-center justify-between px-5 h-[60px] border-b border-white/[0.06]">
//           <Logo onClick={onClose} />
//           <button
//             type="button"
//             onClick={onClose}
//             aria-label="Close menu"
//             className={cn(
//               'flex items-center justify-center w-9 h-9 rounded-md',
//               'text-[#5A6A8A] hover:text-[#E8F0FF]',
//               'border border-white/[0.08] hover:border-white/[0.18]',
//               'transition-colors duration-150'
//             )}
//           >
//             <CloseIcon />
//           </button>
//         </div>

//         {/* Nav links */}
//         <nav
//           aria-label="Mobile navigation links"
//           className="px-5 py-4 flex flex-col gap-1"
//         >
//           {items.map(item => (
//             <Link
//               key={item.href}
//               href={item.href}
//               onClick={onClose}
//               aria-current={currentPath === item.href ? 'page' : undefined}
//               className={cn(
//                 'flex items-center px-3 py-3 rounded-[10px] text-base font-medium',
//                 'text-[#A8B8D8] hover:text-[#E8F0FF]',
//                 'hover:bg-white/[0.05] transition-colors duration-150',
//                 currentPath === item.href &&
//                   'text-[#00D4FF] bg-[rgba(0,212,255,0.06)]'
//               )}
//             >
//               {item.label}
//               {item.isExternal && (
//                 <span className="ml-auto text-[10px] opacity-50">↗</span>
//               )}
//             </Link>
//           ))}
//         </nav>

//         {/* CTAs */}
//         <div className="px-5 pb-6 flex flex-col gap-3 border-t border-white/[0.06] pt-4">
//           {isLoggedIn ? (
//             <>
//               <div className="flex items-center gap-3 px-1 pb-1">
//                 <span className="w-9 h-9 rounded-full bg-[rgba(0,212,255,0.14)] border border-[rgba(0,212,255,0.35)] text-[#00D4FF] text-[13px] font-semibold flex items-center justify-center shrink-0">
//                   {firstName?.trim()?.[0]?.toUpperCase() || 'U'}
//                 </span>
//                 <div className="min-w-0">
//                   <p className="text-[13.5px] font-medium text-[#E8F0FF] truncate">{firstName}</p>
//                   {email && <p className="text-[11.5px] text-[#5A6A8A] truncate">{email}</p>}
//                 </div>
//               </div>
//               <Button as="a" href="/dashboard/profile" variant="ghost" size="lg" fullWidth onClick={onClose}>
//                 Profile
//               </Button>
//               <Button as="a" href="/dashboard" variant="primary" size="lg" fullWidth onClick={onClose}>
//                 Go to dashboard →
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="lg"
//                 fullWidth
//                 disabled={isLoggingOut}
//                 onClick={() => {
//                   onClose()
//                   handleLogout()
//                 }}
//               >
//                 {isLoggingOut ? 'Logging out…' : 'Log out'}
//               </Button>
//             </>
//           ) : (
//             ctas.map(cta => (
//               <Button
//                 key={cta.href}
//                 as="a"
//                 href={cta.href}
//                 variant={cta.variant}
//                 size="lg"
//                 fullWidth
//                 onClick={onClose}
//               >
//                 {cta.label}
//               </Button>
//             ))
//           )}
//         </div>
//       </div>
//     </>
//   )
// }

// function CloseIcon() {
//   return (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//       <path d="M18 6 6 18M6 6l12 12"/>
//     </svg>
//   )
// }

'use client'

import Link from 'next/link'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui'
import { Logo   } from '@/components/ui'
import { useLogout } from '@/hooks/useLogout'
import type { NavItem, NavCTA } from '@/types'

interface NavMobileProps {
  isOpen:    boolean
  onClose:   () => void
  items:     NavItem[]
  ctas:      NavCTA[]
  currentPath?: string
  isLoggedIn?: boolean
  firstName?:  string
  email?:      string
  /** Cloudinary URL set via /dashboard/profile. Falls back to initials when absent. */
  avatarUrl?:  string | null
}

/**
 * NavMobile
 * ──────────
 * Full-screen overlay drawer for small screens.
 * Slides down from the top with a backdrop.
 * Closes on link click, backdrop click, or Escape (handled by useNavbar).
 */
export function NavMobile({
  isOpen,
  onClose,
  items,
  ctas,
  currentPath,
  isLoggedIn = false,
  firstName,
  email,
  avatarUrl,
}: NavMobileProps) {
  const { handleLogout, isLoggingOut } = useLogout()
  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-[#0A0E1A]/80 backdrop-blur-sm transition-opacity duration-200 md:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* ── Drawer ────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={cn(
          'fixed top-0 inset-x-0 z-50 md:hidden max-h-screen overflow-y-auto',
          'bg-[#0F1525] border-b border-white/[0.08]',
          'transition-transform duration-250 ease-[cubic-bezier(0.22,0.68,0,1.1)]',
          isOpen ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-5 h-[60px] border-b border-white/[0.06]">
          <Logo onClick={onClose} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-md',
              'text-[#5A6A8A] hover:text-[#E8F0FF]',
              'border border-white/[0.08] hover:border-white/[0.18]',
              'transition-colors duration-150'
            )}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Nav links */}
        <nav
          aria-label="Mobile navigation links"
          className="px-5 py-4 flex flex-col gap-1"
        >
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={currentPath === item.href ? 'page' : undefined}
              className={cn(
                'flex items-center px-3 py-3 rounded-[10px] text-base font-medium',
                'text-[#A8B8D8] hover:text-[#E8F0FF]',
                'hover:bg-white/[0.05] transition-colors duration-150',
                currentPath === item.href &&
                  'text-[#00D4FF] bg-[rgba(0,212,255,0.06)]'
              )}
            >
              {item.label}
              {item.isExternal && (
                <span className="ml-auto text-[10px] opacity-50">↗</span>
              )}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="px-5 pb-6 flex flex-col gap-3 border-t border-white/[0.06] pt-4">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 px-1 pb-1">
                <span className="w-9 h-9 rounded-full overflow-hidden bg-[rgba(0,212,255,0.14)] border border-[rgba(0,212,255,0.35)] text-[#00D4FF] text-[13px] font-semibold flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    firstName?.trim()?.[0]?.toUpperCase() || 'U'
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium text-[#E8F0FF] truncate">{firstName}</p>
                  {email && <p className="text-[11.5px] text-[#5A6A8A] truncate">{email}</p>}
                </div>
              </div>
              <Button as="a" href="/dashboard/profile" variant="ghost" size="lg" fullWidth onClick={onClose}>
                Profile
              </Button>
              <Button as="a" href="/dashboard" variant="primary" size="lg" fullWidth onClick={onClose}>
                Go to dashboard →
              </Button>
              <Button
                variant="ghost"
                size="lg"
                fullWidth
                disabled={isLoggingOut}
                onClick={() => {
                  onClose()
                  handleLogout()
                }}
              >
                {isLoggingOut ? 'Logging out…' : 'Log out'}
              </Button>
            </>
          ) : (
            ctas.map(cta => (
              <Button
                key={cta.href}
                as="a"
                href={cta.href}
                variant={cta.variant}
                size="lg"
                fullWidth
                onClick={onClose}
              >
                {cta.label}
              </Button>
            ))
          )}
        </div>
      </div>
    </>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  )
}