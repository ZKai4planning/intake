'use client'

import { useEffect, useMemo, useState } from 'react'
import { Home, List } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  defaultSubtypeId,
  firstUnanswered,
  getCategory,
  getQuestionSet,
  getSubtype,
  isAnswered,
  visibleQuestions,
} from '@/lib/intake/projectTypes'
import type { IntakeMore, IntakePlanning, IntakeProperty } from '@/lib/intake/types'
import { ExtensionPreview } from '../ExtensionPreview'
import { QuestionField } from '../QuestionField'
import { IDLE, SELECTED, StepActions, StepCard } from '../ui'

interface Props {
  property: IntakeProperty | null
  planning: IntakePlanning
  value: IntakeMore
  onChange: (v: IntakeMore) => void
  onBack: () => void
  onNext: () => void
}

/**
 * Card 5. The questions are chosen from the category picked on card 4 plus the
 * "type of work" chip chosen here — see lib/intake/projectTypes.ts.
 */
export function TellMoreCard({ property, planning, value, onChange, onBack, onNext }: Props) {
  const [tried, setTried] = useState(false)
  const category = getCategory(planning.categoryId)

  // Make sure subtypeId is always valid for the current category.
  const validSubtype = category?.subtypes.some(s => s.id === value.subtypeId) ? value.subtypeId : defaultSubtypeId(planning.categoryId)
  useEffect(() => {
    if (validSubtype !== value.subtypeId) onChange({ ...value, subtypeId: validSubtype })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validSubtype, value.subtypeId])

  const subtype = getSubtype(planning.categoryId, validSubtype)
  const set = useMemo(() => getQuestionSet(planning.categoryId, validSubtype, planning.routeKnown), [planning.categoryId, validSubtype, planning.routeKnown])
  const questions = visibleQuestions(set, value.answers)

  const setAnswer = (id: string, v: string) => onChange({ ...value, subtypeId: validSubtype, answers: { ...value.answers, [id]: v } })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const missing = firstUnanswered(questions, value.answers)
    if (missing) {
      setTried(true)
      requestAnimationFrame(() => document.querySelector(`[data-qid="${missing.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
      return
    }
    onNext()
  }

  return (
    <StepCard icon={<List className="h-[18px] w-[18px]" />} title="Tell us more">
      <form onSubmit={submit} noValidate>
        <p className="text-[13.5px] leading-relaxed text-[#A8B8D8]">
          A few questions based on your selection.
          <br />
          The questions will change to match your project.
        </p>

        {/* Your selection */}
        <div className="mt-4 rounded-xl border border-[#00D4FF]/25 bg-[rgba(0,212,255,0.06)] p-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#135BEC]/25 text-[#00D4FF]">
              <Home className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6A8A]">Your selection</p>
              <p className="text-[14.5px] font-medium leading-snug text-[#E8F0FF]">{category?.label}</p>
              {(subtype || planning.routeKnown === 'yes') && (
                <p className="text-[13px] text-[#00D4FF]">→ {planning.routeKnown === 'yes' ? 'I know my planning route' : subtype?.label}</p>
              )}
            </div>
          </div>

          {category && category.subtypes.length > 1 && (
            <div className="mt-3.5 border-t border-white/[0.07] pt-3">
              <p className="mb-2 text-[12.5px] text-[#A8B8D8]">{category.subtypeLabel ?? 'Type of work'}</p>
              <div role="radiogroup" className="flex flex-wrap gap-2">
                {category.subtypes.map(s => {
                  const sel = s.id === validSubtype
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={sel}
                      onClick={() => {
                        setTried(false)
                        onChange({ ...value, subtypeId: s.id })
                      }}
                      className={cn('rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-all', sel ? SELECTED : IDLE)}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Live preview of the proposal on the map / aerial photo (extensions, outbuildings, garages) */}
        <ExtensionPreview property={property} planning={planning} more={{ ...value, subtypeId: validSubtype }} className="mt-4" />

        {/* Dynamic questions */}
        <div className="mt-5 space-y-5" key={`${planning.categoryId}-${validSubtype}-${planning.routeKnown}`}>
          {questions.map((q, i) => (
            <QuestionField
              key={q.id}
              q={q}
              n={i + 1}
              value={value.answers[q.id] ?? ''}
              onChange={v => setAnswer(q.id, v)}
              error={tried && !isAnswered(q, value.answers)}
            />
          ))}
        </div>

        <StepActions onBack={onBack} />
      </form>
    </StepCard>
  )
}
