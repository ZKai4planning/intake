// import Link from 'next/link'
// import { cn } from '@/lib/cn'
// import Image from 'next/image';

// interface LogoProps {
//   size?: 'sm' | 'md' | 'lg'
//   onClick?: () => void
//   className?: string
//   /** When true renders a <div> instead of <Link> — useful inside nav anchors */
//   asDiv?: boolean
//   /**
//    * Show the "AI4Planning" wordmark next to the icon. Off by default —
//    * only the dashboard sidebar needs it, since that's the one spot with
//    * no other label nearby. The public navbar already renders its own
//    * white "AI4Planning" text next to <Logo>, so turning this on there
//    * would duplicate it.
//    */
//   showWordmark?: boolean
// }

// // sm  = sidebar / dense chrome — stays compact next to other nav rows.
// // md  = general-purpose fallback.
// // lg  = the public site header — this is the one place the mark should
// //       stand out at a glance, so it's sized to fill most of the 96px
// //       header height rather than sit as a small icon next to the text.
// const iconSize  = { sm: 'w-8 h-8',   md: 'w-11 h-11', lg: 'w-16 h-16' }
// const textSize  = { sm: 'text-lg',   md: 'text-2xl',  lg: 'text-3xl'  }
// const iconText  = { sm: 'text-sm',   md: 'text-base', lg: 'text-lg'   }

// /**
//  * Logo
//  * ─────
//  * Renders the AI4Planning wordmark with its glowing icon.
//  *
//  * This is the site's only "go to homepage" affordance in the dashboard
//  * sidebar, so it needs to read as a clickable brand mark rather than a
//  * loose video clip: icon is capped to iconSize so it doesn't overflow a
//  * 60px header, the wordmark is always shown next to it, and hover/title
//  * make the "click to go home" behavior explicit rather than implied.
//  */
// export function Logo({ size = 'md', onClick, className, asDiv, showWordmark = false }: LogoProps) {
//   const inner = (
//     <span
//       className={cn(
//         'flex items-center gap-2.5 select-none cursor-pointer group',
//         'transition-opacity duration-150 hover:opacity-80',
//         className
//       )}
//     >
//       <span
//         className={cn(
//           'relative overflow-hidden rounded-none shrink-0 bg-[#0F1525]',
//           iconSize[size]
//         )}
//       >
//         <video
//           className="absolute inset-0 w-full h-full object-contain"
//           autoPlay
//           muted
//           loop
//           playsInline
//         >
//           <source src="/logovideo.mp4" type="video/mp4" />
//         </video>
//       </span>
//       {showWordmark && (
//         <span
//           className={cn(
//             'font-display font-normal tracking-tight leading-none',
//             textSize[size]
//           )}
//           style={{ color: '#E8F0FF' }}
//         >
//           AI4Planning
//         </span>
//       )}
//     </span>
//   )

//   if (asDiv) {
//     return (
//       <div onClick={onClick} title="Go to homepage">
//         {inner}
//       </div>
//     )
//   }

//   return (
//     <Link href="/" onClick={onClick} aria-label="AI4Planning — go to homepage" title="Go to homepage">
//       {inner}
//     </Link>
//   )
// }

// // ── Logo Icon ─────────────────────────────────────────────────────
// function LogoIcon({
//   sizeClass,
//   textClass,
// }: {
//   sizeClass: string
//   textClass: string
// }) {
//   return (
//     <span
//       className={cn(
//         'inline-flex items-center justify-center rounded-lg shrink-0',
//         'font-display font-semibold',
//         sizeClass,
//         textClass
//       )}
//       style={{
//         background: 'linear-gradient(135deg, #135BEC 0%, #00D4FF 100%)',
//         boxShadow:
//           '0 0 12px rgba(19,91,236,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
//         color: '#050A12',
//       }}
//       aria-hidden="true"
//     >
//       ?
//     </span>
//   )
// }


import Link from 'next/link'
import { cn } from '@/lib/cn'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
  /** When true renders a <div> instead of <Link> — useful inside nav anchors */
  asDiv?: boolean
  /**
   * Show the "AI4Planning" wordmark next to the icon. Off by default —
   * only the dashboard sidebar needs it, since that's the one spot with
   * no other label nearby. The public navbar already renders its own
   * white "AI4Planning" text next to <Logo>, so turning this on there
   * would duplicate it.
   */
  showWordmark?: boolean
}

// Icon box is sized to the video's native 3:2 ratio (width:height) so
// object-contain never has to letterbox/pillarbox it — the box IS the
// media's aspect ratio, just scaled up per size. Bumped up across the
// board vs the old square boxes since "big" was the ask.
// sm  = sidebar / dense chrome
// md  = general-purpose fallback
// lg  = public site header — sized to fill most of the 96px header
const iconSize  = { sm: 'w-9 h-6',   md: 'w-[108px] h-[72px]', lg: 'w-[132px] h-[88px]' }
const textSize  = { sm: 'text-lg',   md: 'text-2xl',  lg: 'text-3xl'  }

/**
 * Logo
 * ─────
 * Renders the AI4Planning wordmark with its glowing icon.
 *
 * This is the site's only "go to homepage" affordance in the dashboard
 * sidebar, so it needs to read as a clickable brand mark rather than a
 * loose video clip: icon is capped to iconSize so it doesn't overflow a
 * 60px header, the wordmark is always shown next to it, and hover/title
 * make the "click to go home" behavior explicit rather than implied.
 */
export function Logo({ size = 'md', onClick, className, asDiv, showWordmark = false }: LogoProps) {
  const inner = (
    <span
      className={cn(
        'flex items-center gap-2.5 select-none cursor-pointer group',
        'transition-opacity duration-150 hover:opacity-80',
        className
      )}
    >
      <span
        className={cn(
          'relative overflow-hidden rounded-none shrink-0 bg-[#0F1525]',
          iconSize[size]
        )}
      >
        <video
          className="absolute inset-0 w-full h-full object-contain"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/logovideo.mp4" type="video/mp4" />
        </video>
      </span>
      {showWordmark && (
        <span
          className={cn(
            'font-display font-normal tracking-tight leading-none',
            textSize[size]
          )}
          style={{ color: '#E8F0FF' }}
        >
          AI4Planning
        </span>
      )}
    </span>
  )

  if (asDiv) {
    return (
      <div onClick={onClick} title="Go to homepage">
        {inner}
      </div>
    )
  }

  return (
    <Link href="/" onClick={onClick} aria-label="AI4Planning — go to homepage" title="Go to homepage">
      {inner}
    </Link>
  )
}