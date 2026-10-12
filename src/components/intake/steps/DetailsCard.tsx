'use client'

import { useState } from 'react'
import { Mail, Smartphone, User } from 'lucide-react'
import { INTAKE_ROLES } from '@/lib/intake/config'
import { isPlausiblePhone, isValidEmail } from '@/lib/intake/storage'
import type { IntakeDetails } from '@/lib/intake/types'
import { IconField, RadioRow, StepActions, StepCard } from '../ui'

interface Props {
  value: IntakeDetails
  onChange: (v: IntakeDetails) => void
  onBack: () => void
  onNext: () => void
}

type Errors = Partial<Record<'fullName' | 'email' | 'mobile', string>>

function validate(v: IntakeDetails): Errors {
  const e: Errors = {}
  if (v.fullName.trim().length < 2) e.fullName = 'Please enter your full name.'
  if (!isValidEmail(v.email)) e.email = 'Please enter a valid email address — we’ll send your sign-in code here.'
  if (!isPlausiblePhone(v.mobile)) e.mobile = 'That doesn’t look like a phone number. You can leave this blank.'
  return e
}

export function DetailsCard({ value, onChange, onBack, onNext }: Props) {
  const [touched, setTouched] = useState(false)
  const errors = touched ? validate(value) : {}
  const set = (patch: Partial<IntakeDetails>) => onChange({ ...value, ...patch })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (Object.keys(validate(value)).length === 0) onNext()
  }

  return (
    <StepCard icon={<User className="h-[18px] w-[18px]" />} title="Your details">
      <form onSubmit={submit} noValidate>
        <h3 className="text-[19px] font-semibold text-[#E8F0FF]">Who are you?</h3>
        <p className="mb-4 mt-1 text-[13.5px] text-[#A8B8D8]">We&apos;ll use this to set up your project.</p>

        <div className="space-y-3">
          <IconField
            icon={<User className="h-[18px] w-[18px]" />}
            label="Full name"
            placeholder="Jane Smith"
            autoComplete="name"
            value={value.fullName}
            onChange={e => set({ fullName: e.target.value })}
            error={errors.fullName}
          />
          <IconField
            icon={<Mail className="h-[18px] w-[18px]" />}
            label="Email address"
            type="email"
            inputMode="email"
            placeholder="jane.smith@email.com"
            autoComplete="email"
            value={value.email}
            onChange={e => set({ email: e.target.value })}
            error={errors.email}
          />
          <IconField
            icon={<Smartphone className="h-[18px] w-[18px]" />}
            label="Mobile number (optional)"
            type="tel"
            inputMode="tel"
            placeholder="+44 7123 456789"
            autoComplete="tel"
            value={value.mobile}
            onChange={e => set({ mobile: e.target.value })}
            error={errors.mobile}
          />
        </div>

        <p className="mb-1.5 mt-5 text-[14px] font-medium text-[#E8F0FF]">I am a:</p>
        <div role="radiogroup" aria-label="I am a" className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          {INTAKE_ROLES.map(r => (
            <RadioRow key={r.id} selected={value.role === r.id} onClick={() => set({ role: r.id })}>
              {r.label}
            </RadioRow>
          ))}
        </div>

        <StepActions onBack={onBack} />
      </form>
    </StepCard>
  )
}
