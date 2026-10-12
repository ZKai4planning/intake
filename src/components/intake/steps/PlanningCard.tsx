'use client'

import { useState } from 'react'
import { Car, DoorOpen, Expand, HelpCircle, Check, Hammer, History, Info, Layers, Pencil, Repeat, TreePine } from 'lucide-react'
import { cn } from '@/lib/cn'
import { CATEGORIES, type Category, type CategoryIcon } from '@/lib/intake/projectTypes'
import type { IntakePlanning } from '@/lib/intake/types'
import { FieldError, IDLE, SELECTED, StepActions, StepCard, TextArea } from '../ui'

const ICONS: Record<CategoryIcon, React.ComponentType<{ className?: string }>> = {
  expand: Expand,
  layers: Layers,
  hammer: Hammer,
  repeat: Repeat,
  door: DoorOpen,
  car: Car,
  tree: TreePine,
  history: History,
  help: HelpCircle,
}

export function CategoryTile({ category, selected, onClick, className }: { category: Category; selected: boolean; onClick: () => void; className?: string }) {
  const Icon = ICONS[category.icon]
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn('relative flex min-h-[72px] items-center gap-3 rounded-[12px] border p-2.5 pr-8 text-left transition-all', selected ? SELECTED : IDLE, className)}
    >
      <span
        className={cn(
          'flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-[#135BEC]/30 to-[#00D4FF]/10',
          selected ? 'text-[#00D4FF]' : 'text-[#A8B8D8]',
        )}
        style={category.image ? { backgroundImage: `url(${category.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {!category.image && <Icon className="h-6 w-6" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-medium leading-snug text-[#E8F0FF]">{category.label}</span>
        {category.note && <span className="block text-[11px] text-[#5A6A8A]">{category.note}</span>}
      </span>
      {selected && (
        <span className="absolute right-2.5 top-2.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#00D4FF] text-[#0A0E1A]">
          <Check className="h-3 w-3" strokeWidth={3.5} />
        </span>
      )}
    </button>
  )
}

interface Props {
  value: IntakePlanning
  onChange: (v: IntakePlanning) => void
  onBack: () => void
  onNext: () => void
}

export function PlanningCard({ value, onChange, onBack, onNext }: Props) {
  const [tried, setTried] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const set = (patch: Partial<IntakePlanning>) => onChange({ ...value, ...patch })

  const needsDescribe = value.categoryId === 'unsure'
  const describeError = needsDescribe && value.describe.trim().length < 5 ? 'Please tell us a little about what you have in mind.' : ''
  const missingCategory = !value.categoryId

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setTried(true)
    if (missingCategory || describeError) return
    onNext()
  }

  return (
    <StepCard icon={<Pencil className="h-[18px] w-[18px]" />} title="What are you planning?">
      <form onSubmit={submit} noValidate>
        <p className="mb-4 text-[13.5px] text-[#A8B8D8]">Tell us what you would like to do.</p>

        <div role="radiogroup" aria-label="What are you planning?" className="grid grid-cols-1 gap-2.5 min-[520px]:grid-cols-2">
          {CATEGORIES.map(c => (
            <CategoryTile
              key={c.id}
              category={c}
              selected={value.categoryId === c.id}
              onClick={() => set({ categoryId: c.id })}
              className={c.id === 'unsure' ? 'min-[520px]:col-span-2' : undefined}
            />
          ))}
        </div>
        {tried && missingCategory && <FieldError>Please choose the option that is closest to your plan.</FieldError>}

        {needsDescribe && (
          <div className="mt-3 animate-fade-in">
            <TextArea
              autoFocus
              value={value.describe}
              onChange={e => set({ describe: e.target.value })}
              placeholder="Describe what you would like to do, in your own words…"
              invalid={tried && !!describeError}
            />
            {tried && <FieldError>{describeError}</FieldError>}
          </div>
        )}

        <div className="mt-6">
          <div className="mb-2.5 flex items-center gap-2">
            <p className="text-[14px] font-semibold text-[#F59E0B]">
              Already know the planning route? <span className="font-normal text-[#5A6A8A]">(Optional)</span>
            </p>
            <button type="button" onClick={() => setShowInfo(s => !s)} aria-label="What is a planning route?" aria-expanded={showInfo} className="text-[#5A6A8A] hover:text-[#00D4FF]">
              <Info className="h-4 w-4" />
            </button>
          </div>
          {showInfo && (
            <p className="mb-3 rounded-lg bg-white/[0.04] px-3 py-2.5 text-[12.5px] leading-relaxed text-[#A8B8D8] animate-fade-in">
              A planning route is the type of application or check your project needs — for example householder planning
              permission (HHP), permitted development (PD) or a Lawful Development Certificate (LDC). Not sure? Leave it on
              &quot;You decide for me&quot; and we&apos;ll work it out from your answers.
            </p>
          )}
          <div role="radiogroup" aria-label="Already know the planning route" className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
            {([
              ['yes', 'Yes, I know my route', 'e.g. HHP, LDC, PD, etc.'],
              ['no', 'No / I’m not sure', 'You decide for me'],
            ] as const).map(([v, title, sub]) => {
              const sel = value.routeKnown === v
              return (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  onClick={() => set({ routeKnown: v })}
                  className={cn('rounded-[12px] border px-3.5 py-3 text-center transition-all', sel ? SELECTED : IDLE)}
                >
                  <span className="block text-[13.5px] font-medium text-[#E8F0FF]">{title}</span>
                  <span className={cn('block text-[11.5px]', sel ? 'text-[#00D4FF]' : 'text-[#5A6A8A]')}>{sub}</span>
                </button>
              )
            })}
          </div>
        </div>

        <StepActions onBack={onBack} />
      </form>
    </StepCard>
  )
}
