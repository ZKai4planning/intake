// 'use client'

// import { useEffect, useState } from 'react'
// import { usePathname } from 'next/navigation'
// import { cn }          from '@/lib/cn'
// import { useNavbar }   from '@/hooks/useNavbar'
// import { useWorkspace } from '@/hooks/Useworkspace'
// import { Logo, Button } from '@/components/ui'
// import { NavDesktop }   from './NavDesktop'
// import { NavMobile }    from './NavMobile'
// import { UserMenu }     from './UserMenu'
// import type { NavItem, NavCTA } from '@/types'

// // ── Config ──────────────────────────────────────────────────────
// const BRAND_NAME = 'AI4Planning'

// const NAV_ITEMS: NavItem[] = [
//   { label: 'Home', href: '/' },
//   { label: 'How it works', href: '/#how-it-works' },
//   { label: 'Services',     href: '/#services' },
//   { label: 'Pricing',      href: '/#pricing' },
//   { label: 'For Business', href: '/#pricing' },
// ]

// const NAV_CTAS: NavCTA[] = [
//   { label: 'Log in',           href: '/login',   variant: 'ghost'   },
//   // { label: 'Get started free', href: '/signup',  variant: 'primary' },
// ]

// export function Navbar() {
//   const pathname = usePathname()
//   const { scrolled, mobileOpen, toggleMobile, closeMobile } = useNavbar()
//   const { isLoading, session, firstName } = useWorkspace()
//   const isLoggedIn = !isLoading && !!session

//   // usePathname() never includes the #hash, so an anchor link like
//   // '/#services' never matches currentPath === item.href in NavDesktop/
//   // NavMobile — only '/' (Home) ever does, so Home stays highlighted no
//   // matter which section is active. Track the hash ourselves and fold it
//   // into the path we hand down, so '/#services' can actually match.
//   const [hash, setHash] = useState('')
//   useEffect(() => {
//     const updateHash = () => setHash(window.location.hash)
//     updateHash()
//     window.addEventListener('hashchange', updateHash)
//     return () => window.removeEventListener('hashchange', updateHash)
//   }, [])
//   const currentPath = `${pathname}${hash}`

//   return (
//     <>
//       <header
//         className={cn(
//           'fixed top-0 inset-x-0 z-30 h-[76px]', // was h-[60px]
//           'flex items-center',
//           'border-b border-white/[0.08]',
//           'transition-all duration-300',
//           scrolled
//             ? 'bg-[rgba(10,14,26,0.92)] backdrop-blur-[12px] shadow-[0_1px_32px_rgba(0,0,0,0.4)]'
//             : 'bg-transparent'
//         )}
//       >
//         <div className="relative w-full px-5 sm:px-8 flex items-center gap-4">

//           {/* Brand */}
//           <div className="flex items-center gap-2 shrink-0">
//             <a
//               href="/"
//               className="flex items-center gap-2 shrink-0 group"
//               aria-label={`${BRAND_NAME} — Home`}
//             >
//               <Logo />
//               <span className="font-semibold text-[15px] text-[#E8F0FF] tracking-tight group-hover:text-white transition-colors duration-150">
//                 {BRAND_NAME}
//               </span>
//             </a>
//           </div>

//           {/* Desktop links — centered against the full header width, not the
//               leftover flex space between brand and CTAs (those two blocks
//               are different widths, so flex-1/justify-center alone would
//               visually skew the nav off-center). */}
//           <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
//             <NavDesktop items={NAV_ITEMS} currentPath={currentPath} />
//           </div>

//           {/* Spacer — keeps brand pinned left and pushes CTAs/hamburger right */}
//           <div className="flex-1" />

//           {/* Desktop CTAs */}
//           <div className="hidden md:flex items-center gap-2 shrink-0">
//             {isLoading ? (
//               <div className="w-9 h-9 rounded-full bg-white/[0.05] animate-pulse" />
//             ) : isLoggedIn ? (
//               <UserMenu firstName={firstName} email={session?.email} avatarUrl={session?.avatarUrl} />
//             ) : (
//               NAV_CTAS.map(cta => (
//                 <Button
//                   key={cta.href}
//                   as="a"
//                   href={cta.href}
//                   variant={cta.variant}
//                   size="md"
//                 >
//                   {cta.label}
//                 </Button>
//               ))
//             )}
//           </div>

//           {/* Mobile hamburger */}
//           <button
//             type="button"
//             onClick={toggleMobile}
//             aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
//             aria-expanded={mobileOpen}
//             aria-controls="mobile-nav"
//             className={cn(
//               'md:hidden ml-auto flex flex-col items-center justify-center gap-[5px]',
//               'w-9 h-9 rounded-md shrink-0',
//               'border border-white/[0.08] hover:border-white/[0.18]',
//               'text-[#A8B8D8] hover:text-[#E8F0FF]',
//               'transition-colors duration-150'
//             )}
//           >
//             <span
//               className={cn(
//                 'block h-[1.5px] w-5 bg-current rounded-full transition-all duration-200',
//                 mobileOpen && 'translate-y-[6.5px] rotate-45'
//               )}
//             />
//             <span
//               className={cn(
//                 'block h-[1.5px] w-5 bg-current rounded-full transition-all duration-200',
//                 mobileOpen && 'opacity-0 scale-x-0'
//               )}
//             />
//             <span
//               className={cn(
//                 'block h-[1.5px] w-5 bg-current rounded-full transition-all duration-200',
//                 mobileOpen && '-translate-y-[6.5px] -rotate-45'
//               )}
//             />
//           </button>
//         </div>
//       </header>

//       {/* Mobile drawer */}
//       <NavMobile
//         isOpen={mobileOpen}
//         onClose={closeMobile}
//         items={NAV_ITEMS}
//         ctas={NAV_CTAS}
//         currentPath={currentPath}
//         isLoggedIn={isLoggedIn}
//         firstName={firstName}
//         email={session?.email}
//         avatarUrl={session?.avatarUrl}
//       />
//     </>
//   )
// }


'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn }          from '@/lib/cn'
import { useNavbar }   from '@/hooks/useNavbar'
import { useWorkspace } from '@/hooks/Useworkspace'
import { Logo, Button } from '@/components/ui'
import { NavDesktop }   from './NavDesktop'
import { NavMobile }    from './NavMobile'
import { UserMenu }     from './UserMenu'
import type { NavItem, NavCTA } from '@/types'

// ── Config ──────────────────────────────────────────────────────
const BRAND_NAME = 'AI4Planning'

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Services',     href: '/#services' },
  { label: 'Pricing',      href: '/#pricing' },
  { label: 'For Business', href: '/#pricing' },
]

const NAV_CTAS: NavCTA[] = [
  { label: 'Log in',           href: '/login',   variant: 'ghost'   },
  // { label: 'Get started free', href: '/signup',  variant: 'primary' },
]

export function Navbar() {
  const pathname = usePathname()
  const { scrolled, mobileOpen, toggleMobile, closeMobile } = useNavbar()
  const { isLoading, session, firstName } = useWorkspace()
  const isLoggedIn = !isLoading && !!session

  // usePathname() never includes the #hash, so an anchor link like
  // '/#services' never matches currentPath === item.href in NavDesktop/
  // NavMobile — only '/' (Home) ever does, so Home stays highlighted no
  // matter which section is active. Track the hash ourselves and fold it
  // into the path we hand down, so '/#services' can actually match.
  const [hash, setHash] = useState('')
  useEffect(() => {
    const updateHash = () => setHash(window.location.hash)
    updateHash()
    window.addEventListener('hashchange', updateHash)
    return () => window.removeEventListener('hashchange', updateHash)
  }, [])
  const currentPath = `${pathname}${hash}`

  return (
    <>
      <header
        className={cn(
          // Hero-sized header: taller than a typical SaaS bar on purpose —
          // this audience (UK, older users) reads a bigger, calmer strip
          // as more trustworthy than a cramped 60px bar.
          'fixed top-0 inset-x-0 z-30 h-24', // was h-[76px] (~96px now)
          'flex items-center',
          'border-b border-white/[0.08]',
          'transition-all duration-300',
          scrolled
            ? 'bg-[rgba(10,14,26,0.94)] backdrop-blur-[12px] shadow-[0_1px_32px_rgba(0,0,0,0.4)]'
            : 'bg-[rgba(10,14,26,0.6)]' // slight tint even unscrolled — pure transparent read as "broken" to some testers over pale hero art
        )}
      >
        <div className="relative w-full px-6 sm:px-10 flex items-center gap-4">

          {/* Brand — the whole lockup is one link back to "/" so the mark,
              the wordmark, and the empty space between them are all a
              home button, not just the icon. Standard, expected pattern. */}
          <a
            href="/"
            className="flex items-center gap-2.5 shrink-0 group -m-2 p-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
            aria-label={`${BRAND_NAME} — go to homepage`}
          >
            <Logo />
            {/* Signature mark: a drafting compass, in place of a generic
                logomark — nods to UK "planning" (planning permission,
                architectural drawings) rather than a generic AI glyph. */}
            {/* <svg width="38" height="38" viewBox="0 0 34 34" fill="none" className="shrink-0" aria-hidden="true">
              <circle cx="17" cy="17" r="15" stroke="#C9A227" strokeWidth="1.5" />
              <line x1="17" y1="17" x2="17" y2="6" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="17" y1="17" x2="24" y2="22" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="17" cy="17" r="2" fill="#C9A227" />
            </svg> */}
            <span className="font-serif text-[20px] font-semibold text-[#E8F0FF] tracking-tight group-hover:text-white transition-colors duration-150">
              {BRAND_NAME}
            </span>
          </a>

          {/* Desktop links — centered against the full header width, not the
              leftover flex space between brand and CTAs (those two blocks
              are different widths, so flex-1/justify-center alone would
              visually skew the nav off-center). Larger type + taller hit
              targets (48px+) than the previous pass. */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <NavDesktop items={NAV_ITEMS} currentPath={currentPath} />
          </div>

          {/* Spacer — keeps brand pinned left and pushes CTAs/hamburger right */}
          <div className="flex-1" />

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {isLoading ? (
              <div className="w-11 h-11 rounded-full bg-white/[0.05] animate-pulse" />
            ) : isLoggedIn ? (
              <UserMenu firstName={firstName} email={session?.email} avatarUrl={session?.avatarUrl} />
            ) : (
              NAV_CTAS.map(cta => (
                <Button
                  key={cta.href}
                  as="a"
                  href={cta.href}
                  variant={cta.variant}
                  size="lg"
                >
                  {cta.label}
                </Button>
              ))
            )}
          </div>

          {/* Mobile hamburger — bumped to a full 48px target */}
          <button
            type="button"
            onClick={toggleMobile}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className={cn(
              'md:hidden ml-auto flex flex-col items-center justify-center gap-[6px]',
              'w-12 h-12 rounded-md shrink-0',
              'border border-white/[0.08] hover:border-white/[0.18]',
              'text-[#A8B8D8] hover:text-[#E8F0FF]',
              'transition-colors duration-150'
            )}
          >
            <span
              className={cn(
                'block h-[2px] w-6 bg-current rounded-full transition-all duration-200',
                mobileOpen && 'translate-y-[7px] rotate-45'
              )}
            />
            <span
              className={cn(
                'block h-[2px] w-6 bg-current rounded-full transition-all duration-200',
                mobileOpen && 'opacity-0 scale-x-0'
              )}
            />
            <span
              className={cn(
                'block h-[2px] w-6 bg-current rounded-full transition-all duration-200',
                mobileOpen && '-translate-y-[7px] -rotate-45'
              )}
            />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <NavMobile
        isOpen={mobileOpen}
        onClose={closeMobile}
        items={NAV_ITEMS}
        ctas={NAV_CTAS}
        currentPath={currentPath}
        isLoggedIn={isLoggedIn}
        firstName={firstName}
        email={session?.email}
        avatarUrl={session?.avatarUrl}
      />
    </>
  )
}