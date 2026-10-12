'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { INTAKE_STEPS, STEPPER_ITEMS } from '@/lib/intake/config'
import type { IntakeStepId } from '@/lib/intake/types'

/**
 * Journey bar across the top (design: Customer → Property Intelligence →
 * Project Intent → Questionnaire → …). The first five are the chat's cards;
 * the greyed ones are what unlocks after the email is verified.
 */
export function IntakeProgress({ current, onJump }: { current: IntakeStepId; onJump: (s: IntakeStepId) => void }) {
  const idx = INTAKE_STEPS.indexOf(current)
  const currentLabel = STEPPER_ITEMS.find(i => i.id === current)?.label

  return (
    <>
      {/* Desktop / tablet */}
      <ol className="hidden items-start md:flex" aria-label="Progress">
        {STEPPER_ITEMS.map((item, i) => {
          const stepIdx = item.id ? INTAKE_STEPS.indexOf(item.id) : -1
          const done = stepIdx >= 0 && stepIdx < idx
          const active = stepIdx === idx
          const locked = stepIdx < 0
          const lineOn = stepIdx >= 0 && stepIdx <= idx

          const circle = (
            <span
              className={cn(
                'relative z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full border text-[11.5px] font-semibold transition-all',
                done && 'border-[#00D4FF]/60 bg-[#00D4FF]/15 text-[#00D4FF]',
                active && 'border-[#00D4FF] bg-[#135BEC] text-white shadow-[0_0_14px_rgba(0,212,255,0.45)]',
                !done && !active && 'border-white/15 bg-[#0A0E1A] text-[#5A6A8A]',
                locked && 'opacity-60',
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </span>
          )

          return (
            <li key={item.label} className="relative flex flex-1 flex-col items-center text-center" aria-current={active ? 'step' : undefined}>
              {i > 0 && <span className={cn('absolute right-1/2 top-[13px] h-px w-full', lineOn ? 'bg-[#00D4FF]/40' : 'bg-white/10')} aria-hidden />}
              {done ? (
                <button type="button" onClick={() => onJump(item.id as IntakeStepId)} className="flex flex-col items-center" title={`Go back to ${item.label}`}>
                  {circle}
                  <Label item={item} className="text-[#A8B8D8] hover:text-[#E8F0FF]" />
                </button>
              ) : (
                <>
                  {circle}
                  <Label item={item} className={cn(active ? 'font-semibold text-[#E8F0FF]' : locked ? 'text-[#55648A]' : 'text-[#5A6A8A]')} />
                </>
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile */}
      <div className="md:hidden">
        <p className="mb-2 text-[12px] text-[#A8B8D8]">
          Step {idx + 1} of {INTAKE_STEPS.length} · <span className="font-semibold text-[#E8F0FF]">{currentLabel}</span>
        </p>
        <div className="flex gap-1.5" aria-hidden>
          {INTAKE_STEPS.map((s, i) => (
            <span key={s} className={cn('h-1 flex-1 rounded-full transition-colors', i < idx ? 'bg-[#00D4FF]/60' : i === idx ? 'bg-[#135BEC]' : 'bg-white/10')} />
          ))}
        </div>
      </div>
    </>
  )
}

function Label({ item, className }: { item: { label: string; sublabel?: string }; className?: string }) {
  return (
    <span className={cn('mt-1.5 block max-w-[92px] text-[11.5px] leading-tight transition-colors', className)}>
      {item.label}
      {item.sublabel && <span className="block text-[10px] opacity-70">{item.sublabel}</span>}
    </span>
  )
}
