'use client'

import { CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StepCard } from '../ui'

const POINTS = ['Simple guided questions', 'We analyse the rules for you', 'Works for all planning routes']

export function WelcomeCard({ onStart }: { onStart?: () => void }) {
  return (
    <StepCard icon="1" title="Welcome">
      <h3 className="text-[26px] font-semibold leading-tight tracking-tight">
        <span className="bg-gradient-to-r from-[#135BEC] to-[#00D4FF] bg-clip-text text-transparent">Let&apos;s get started</span>
      </h3>
      <p className="mt-2 max-w-[460px] text-[15px] leading-relaxed text-[#E8F0FF]">
        Tell us about your property and what you would like to do.
      </p>

      <p className="mt-5 inline-flex items-center gap-2 text-[13px] text-[#A8B8D8]">
        <Clock className="h-4 w-4 text-[#5A6A8A]" />
        Takes about 5 minutes
      </p>

      <ul className="mt-3 space-y-2.5">
        {POINTS.map(p => (
          <li key={p} className="flex items-center gap-2.5 text-[14px] text-[#E8F0FF]">
            <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-[#00D4FF]" />
            {p}
          </li>
        ))}
      </ul>

      {/* House photo from the design */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/intake/welcome-house.jpg"
        alt="A welcoming home at dusk"
        className="mt-5 h-[150px] w-full rounded-xl border border-white/10 object-cover"
      />

      {onStart && (
        <Button type="button" size="lg" fullWidth className="mt-6 rounded-full" onClick={onStart} rightIcon={<ArrowRight className="h-4 w-4" />}>
          Start my project
        </Button>
      )}
    </StepCard>
  )
}
