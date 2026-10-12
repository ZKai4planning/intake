// import { cn } from '@/lib/cn'

// interface HeroHeadlineProps {
//   id?: string
//   className?: string
// }

// export function HeroHeadline({ id, className }: HeroHeadlineProps) {
//   return (
//     <h1
//       id={id}
//       className={`font-sans text-[36px] sm:text-[46px] leading-[1.15] text-white ${className ?? ''}`}
//     >
//       Here when you need us with{' '}
//       <span
//         className="italic text-[#00D4FF]"
//         style={{ textShadow: '0 0 24px rgba(0,212,255,0.35)' }}
//       >
//          property help?
//       </span>
//     </h1>
//   )
// }

// import { cn } from '@/lib/cn'

// interface HeroHeadlineProps {
//   id?: string
//   className?: string
// }

// export function HeroHeadline({ id, className }: HeroHeadlineProps) {
//   return (
//     <h1
//       id={id}
//       className={cn(
//         'font-sans text-[38px] sm:text-[52px] font-normal leading-[1.1] tracking-tight text-white',
//         className
//       )}
//     >
//       Here when you need us, with{' '}
//       <span className="text-[#00D4FF]">property help</span>
//     </h1>
//   )
// }


import { cn } from '@/lib/cn'

interface HeroHeadlineProps {
  id?: string
  className?: string
}

export function HeroHeadline({ id, className }: HeroHeadlineProps) {
  return (
    <h1
      id={id}
      className={cn(
        'font-display text-[38px] sm:text-[52px] font-normal leading-[1.1] tracking-tight text-white',
        className
      )}
    >
      What do you want to do with your{' '}
      <span
        className="italic text-[#00D4FF]"
        style={{ textShadow: '0 0 24px rgba(0,212,255,0.35)' }}
      >
        property?
      </span>
    </h1>
  )
}