'use client'

import { ExtensionPreview } from '../ExtensionPreview'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { sendOtp } from '@/lib/api'
import { readAuthSession } from '@/lib/authSession'
import { getRole, INTAKE_RETURN_TO } from '@/lib/intake/config'
import { summariseProject } from '@/lib/intake/projectTypes'
import type { IntakeDraft, IntakeStepId } from '@/lib/intake/types'
import { FieldError, StepCard } from '../ui'

interface Props {
  draft: IntakeDraft
  onEdit: (step: IntakeStepId) => void
  onBack: () => void
}

/**
 * Final card. The email they gave on card 2 is shown back to them and the
 * OTP is sent with one tap — no retyping, no detour through /login. They
 * land straight on the 6-digit code screen (verify-email), then into
 * their project.
 */
export function ReviewCard({ draft, onEdit, onBack }: Props) {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [signedInAs, setSignedInAs] = useState<string | null>(null)

  useEffect(() => {
    setSignedInAs(readAuthSession()?.email ?? null)
  }, [])

  const { details, property, planning, more } = draft
  const actorId = getRole(details.role).actorId
  const project = summariseProject(planning.categoryId, planning.describe, planning.routeKnown, more.subtypeId, more.answers)

  async function sendCode() {
    if (signedInAs) {
      router.push(INTAKE_RETURN_TO)
      return
    }
    setSending(true)
    setError('')
    const { data, error: apiError } = await sendOtp({ email: details.email.trim() })
    if (apiError || !data?.success) {
      setSending(false)
      setError(apiError ?? 'We couldn’t send the code. Please try again.')
      return
    }
    const params = new URLSearchParams({
      email: details.email.trim(),
      intent: data.intent,
      returnTo: INTAKE_RETURN_TO,
      actor: actorId,
      from: 'intake',
    })
    router.push(`/verify-email?${params.toString()}`)
  }

  const rows: { label: string; value: string; sub?: string; step: IntakeStepId }[] = [
    { label: 'You', value: details.fullName, sub: getRole(details.role).label, step: 'details' },
    ...(property ? [{ label: 'Property', value: property.fullAddress, step: 'property' as IntakeStepId }] : []),
    {
      label: 'Project',
      value: project.subtype ? `${project.category} → ${project.subtype}` : project.category,
      sub: project.lines.length ? `${project.lines.length} answers` : undefined,
      step: 'more',
    },
  ]

  return (
    <StepCard icon={<ShieldCheck className="h-[18px] w-[18px]" />} title="Almost there">
      <h3 className="text-[19px] font-semibold text-[#E8F0FF]">Save your project</h3>
      <p className="mb-4 mt-1 text-[13.5px] text-[#A8B8D8]">
        Verify your email to see your planning route and next steps. No password needed.
      </p>

      <dl className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-[#141C30]">
        {rows.map(r => (
          <div key={r.label} className="flex items-start gap-3 px-3.5 py-3">
            <dt className="w-[68px] shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A6A8A]">{r.label}</dt>
            <dd className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium leading-snug text-[#E8F0FF]">{r.value}</p>
              {r.sub && <p className="text-[12px] text-[#A8B8D8]">{r.sub}</p>}
            </dd>
            <button type="button" onClick={() => onEdit(r.step)} className="shrink-0 text-[12px] font-medium text-[#00D4FF] hover:underline">
              Change
            </button>
          </div>
        ))}
      </dl>

      <ExtensionPreview property={property} planning={planning} more={more} compact className="mt-4" />

      <div className="mt-5 rounded-xl border border-[#135BEC]/30 bg-[rgba(19,91,236,0.07)] p-4">
        {signedInAs ? (
          <p className="text-[13.5px] text-[#A8B8D8]">
            You&apos;re signed in as <span className="font-semibold text-[#E8F0FF]">{signedInAs}</span>. We&apos;ll add this project to your account.
          </p>
        ) : (
          <>
            <p className="text-[13px] text-[#A8B8D8]">We&apos;ll email a 6-digit code to</p>
            <p className="mt-1 flex items-center gap-2 break-all text-[16px] font-semibold text-[#E8F0FF]">
              <Mail className="h-[18px] w-[18px] shrink-0 text-[#00D4FF]" />
              {details.email}
            </p>
            <button type="button" onClick={() => onEdit('details')} className="mt-1.5 text-[12px] font-medium text-[#00D4FF] hover:underline">
              Wrong email? Change it
            </button>
          </>
        )}
      </div>

      <FieldError>{error}</FieldError>
      {error && (
        <p className="mt-1 text-[12px] text-[#5A6A8A]">
          Still stuck? <a className="text-[#00D4FF] hover:underline" href={`/login?email=${encodeURIComponent(details.email)}&from=intake&actor=${actorId}`}>Use the sign-in page</a>.
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="px-1 py-2 text-[13.5px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF]">
          ← Back
        </button>
        <Button type="button" size="lg" className="flex-1 rounded-full sm:max-w-[280px]" isLoading={sending} onClick={sendCode} rightIcon={<ArrowRight className="h-4 w-4" />}>
          {signedInAs ? 'Continue to my project' : 'Email me a code'}
        </Button>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-[#5A6A8A]">
        <Lock className="h-3 w-3" />
        Free to start · no payment details · your answers are saved as you go
      </p>
    </StepCard>
  )
}
