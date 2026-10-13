// 'use client'

// import { Check } from 'lucide-react'
// import { cn } from '@/lib/cn'
// import { INTAKE_STEPS, STEPPER_ITEMS } from '@/lib/intake/config'
// import type { IntakeStepId } from '@/lib/intake/types'

// /**
//  * Journey bar across the top (design: Customer → Property Intelligence →
//  * Project Intent → Questionnaire → …). The first five are the chat's cards;
//  * the greyed ones are what unlocks after the email is verified.
//  */
// export function IntakeProgress({ current, onJump }: { current: IntakeStepId; onJump: (s: IntakeStepId) => void }) {
//   const idx = INTAKE_STEPS.indexOf(current)
//   const currentLabel = STEPPER_ITEMS.find(i => i.id === current)?.label

//   return (
//     <>
//       {/* Desktop / tablet */}
//       <ol className="hidden items-start md:flex" aria-label="Progress">
//         {STEPPER_ITEMS.map((item, i) => {
//           const stepIdx = item.id ? INTAKE_STEPS.indexOf(item.id) : -1
//           const done = stepIdx >= 0 && stepIdx < idx
//           const active = stepIdx === idx
//           const locked = stepIdx < 0
//           const lineOn = stepIdx >= 0 && stepIdx <= idx

//           const circle = (
//             <span
//               className={cn(
//                 'relative z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full border text-[11.5px] font-semibold transition-all',
//                 done && 'border-[#00D4FF]/60 bg-[#00D4FF]/15 text-[#00D4FF]',
//                 active && 'border-[#00D4FF] bg-[#135BEC] text-white shadow-[0_0_14px_rgba(0,212,255,0.45)]',
//                 !done && !active && 'border-white/15 bg-[#0A0E1A] text-[#5A6A8A]',
//                 locked && 'opacity-60',
//               )}
//             >
//               {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
//             </span>
//           )

//           return (
//             <li key={item.label} className="relative flex flex-1 flex-col items-center text-center" aria-current={active ? 'step' : undefined}>
//               {i > 0 && <span className={cn('absolute right-1/2 top-[13px] h-px w-full', lineOn ? 'bg-[#00D4FF]/40' : 'bg-white/10')} aria-hidden />}
//               {done ? (
//                 <button type="button" onClick={() => onJump(item.id as IntakeStepId)} className="flex flex-col items-center" title={`Go back to ${item.label}`}>
//                   {circle}
//                   <Label item={item} className="text-[#A8B8D8] hover:text-[#E8F0FF]" />
//                 </button>
//               ) : (
//                 <>
//                   {circle}
//                   <Label item={item} className={cn(active ? 'font-semibold text-[#E8F0FF]' : locked ? 'text-[#55648A]' : 'text-[#5A6A8A]')} />
//                 </>
//               )}
//             </li>
//           )
//         })}
//       </ol>

//       {/* Mobile */}
//       <div className="md:hidden">
//         <p className="mb-2 text-[12px] text-[#A8B8D8]">
//           Step {idx + 1} of {INTAKE_STEPS.length} · <span className="font-semibold text-[#E8F0FF]">{currentLabel}</span>
//         </p>
//         <div className="flex gap-1.5" aria-hidden>
//           {INTAKE_STEPS.map((s, i) => (
//             <span key={s} className={cn('h-1 flex-1 rounded-full transition-colors', i < idx ? 'bg-[#00D4FF]/60' : i === idx ? 'bg-[#135BEC]' : 'bg-white/10')} />
//           ))}
//         </div>
//       </div>
//     </>
//   )
// }

// function Label({ item, className }: { item: { label: string; sublabel?: string }; className?: string }) {
//   return (
//     <span className={cn('mt-1.5 block max-w-[92px] text-[11.5px] leading-tight transition-colors', className)}>
//       {item.label}
//       {item.sublabel && <span className="block text-[10px] opacity-70">{item.sublabel}</span>}
//     </span>
//   )
// }

'use client'

import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/cn'
import { INTAKE_STEPS, STEPPER_ITEMS } from '@/lib/intake/config'
import type { IntakeStepId } from '@/lib/intake/types'

/**
 * Journey bar. Shows only the five steps of this form; the steps that unlock
 * after the email is verified are folded into one quiet "+3 after
 * verification" chip instead of three greyed-out circles. Finished steps are
 * buttons (go back), the current step is highlighted, later steps are plain.
 */
export function IntakeProgress({ current, onJump }: { current: IntakeStepId; onJump: (s: IntakeStepId) => void }) {
  const idx = INTAKE_STEPS.indexOf(current)
  const steps = STEPPER_ITEMS.filter(i => i.id !== null)
  const later = STEPPER_ITEMS.filter(i => i.id === null)
  const currentLabel = steps.find(i => i.id === current)?.label

  return (
    <nav aria-label="Progress">
      {/* Tablet / desktop */}
      <ol className="hidden items-center md:flex">
        {steps.map((item, i) => {
          const stepIdx = INTAKE_STEPS.indexOf(item.id as IntakeStepId)
          const done = stepIdx < idx
          const active = stepIdx === idx
          const fullName = item.sublabel ? `${item.label} ${item.sublabel}` : item.label

          const inner = (
            <>
              <span
                aria-hidden
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11.5px] font-semibold transition-all',
                  done && 'border-[#00D4FF]/60 bg-[#00D4FF]/15 text-[#00D4FF]',
                  active && 'border-[#00D4FF] bg-[#135BEC] text-white shadow-[0_0_12px_rgba(0,212,255,0.45)]',
                  !done && !active && 'border-white/15 text-[#5A6A8A]',
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn('whitespace-nowrap text-[12.5px]', active ? 'font-semibold text-[#E8F0FF]' : done ? 'text-[#A8B8D8]' : 'text-[#5A6A8A]')}>{item.label}</span>
            </>
          )

          return (
            <li key={item.label} className="flex min-w-0 items-center" aria-current={active ? 'step' : undefined}>
              {i > 0 && <span aria-hidden className={cn('mx-2 h-px w-4 lg:w-8', stepIdx <= idx ? 'bg-[#00D4FF]/40' : 'bg-white/10')} />}
              {done ? (
                <button
                  type="button"
                  onClick={() => onJump(item.id as IntakeStepId)}
                  title={`Go back to ${fullName}`}
                  aria-label={`Go back to ${fullName}`}
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
                >
                  {inner}
                </button>
              ) : (
                <span title={fullName} className={cn('flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5', active && 'bg-[#135BEC]/15 ring-1 ring-[#135BEC]/40')}>
                  {inner}
                </span>
              )}
            </li>
          )
        })}

        {later.length > 0 && (
          <li
            className="ml-3 hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-white/10 px-2.5 py-1 text-[11.5px] text-[#5A6A8A] xl:flex"
            title={`After you verify your email: ${later.map(l => l.label).join(', ')}`}
          >
            <Lock className="h-3 w-3" aria-hidden />
            +{later.length} after verification
          </li>
        )}
      </ol>

      {/* Mobile */}
      <div className="md:hidden">
        <p className="mb-1.5 text-[12px] text-[#A8B8D8]">
          Step {idx + 1} of {INTAKE_STEPS.length} · <span className="font-semibold text-[#E8F0FF]">{currentLabel}</span>
        </p>
        <div className="flex gap-1.5" aria-hidden>
          {INTAKE_STEPS.map((s, i) => (
            <span key={s} className={cn('h-1 flex-1 rounded-full transition-colors', i < idx ? 'bg-[#00D4FF]/60' : i === idx ? 'bg-[#135BEC]' : 'bg-white/10')} />
          ))}
        </div>
      </div>
    </nav>
  )
}