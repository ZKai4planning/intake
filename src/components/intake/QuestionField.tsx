'use client'

import { cn } from '@/lib/cn'
import type { Question } from '@/lib/intake/projectTypes'
import { ChoicePill, DimensionsInput, FieldError, NumberInput, Segmented, SelectBox, TextArea } from './ui'

const YESNO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'I’m not sure' },
]

/** One numbered question, rendered by type. Used by card 5 ("Tell us more"). */
export function QuestionField({
  q,
  n,
  value,
  onChange,
  error,
}: {
  q: Question
  n: number
  value: string
  onChange: (v: string) => void
  error?: boolean
}) {
  const invalid = !!error

  return (
    <div data-qid={q.id} className="scroll-mt-24">
      <p className="mb-2.5 text-[14px] font-medium leading-snug text-[#E8F0FF]">
        <span className="mr-1.5 text-[#5A6A8A]">{n}.</span>
        {q.label}
        {q.optional && <span className="ml-1.5 text-[12px] font-normal text-[#5A6A8A]">(optional)</span>}
      </p>

      {q.type === 'yesno' && <Segmented options={q.twoWay ? YESNO.slice(0, 2) : YESNO} value={value} onChange={onChange} />}

      {q.type === 'single' && q.options && (
        <div role="radiogroup" className={cn('grid gap-2', q.options.length === 2 ? 'grid-cols-1 min-[420px]:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3')}>
          {q.options.map(o => (
            <ChoicePill key={o.value} selected={value === o.value} onClick={() => onChange(o.value)}>
              {o.label}
            </ChoicePill>
          ))}
        </div>
      )}

      {q.type === 'select' && q.options && <SelectBox value={value} onChange={onChange} options={q.options} invalid={invalid} />}

      {q.type === 'number' && <NumberInput value={value} onChange={onChange} unit={q.unit} allowUnknown={q.allowUnknown} invalid={invalid} />}

      {q.type === 'dimensions' && <DimensionsInput value={value} onChange={onChange} unit={q.unit} invalid={invalid} />}

      {q.type === 'text' && (
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={q.placeholder}
          className={cn(
            'w-full rounded-[12px] border bg-[#141C30] px-3.5 py-3 text-[16px] text-[#E8F0FF] outline-none transition-all placeholder:text-[#55648A] focus:border-[#135BEC] sm:text-[14px]',
            invalid ? 'border-[rgba(248,113,113,0.6)]' : 'border-white/[0.10]',
          )}
        />
      )}

      {q.type === 'textarea' && <TextArea value={value} onChange={e => onChange(e.target.value)} placeholder={q.placeholder} invalid={invalid} />}

      {invalid && <FieldError>{q.type === 'textarea' || q.type === 'text' ? 'Please add a short description.' : 'Please answer this to continue.'}</FieldError>}
    </div>
  )
}
