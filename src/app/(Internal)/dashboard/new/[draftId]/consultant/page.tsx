'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProject, updateProject, type Project } from '@/lib/projects'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'

const TIME_SLOTS = ['Morning (9am – 12pm)', 'Afternoon (12pm – 5pm)', 'Either — flexible']

/**
 * /dashboard/new/[draftId]/consultant
 * ──────────────────────────────────────
 * Book a 60-minute planning consultation. Reachable from the snapshot's
 * "Speak with a consultant" choice, or from the paid report's next-step
 * CTA — either way the project's address + constraints must already be
 * saved so the consultant has something to review.
 */
export default function ConsultantBookingPage() {
  const params = useParams<{ draftId: string }>()
  const router = useRouter()
  const { show } = useToast()
  const draftId = params.draftId

  const [project, setProject] = useState<Project | null | undefined>(undefined)
  const [date, setDate] = useState('')
  const [time, setTime] = useState(TIME_SLOTS[0])
  const [notes, setNotes] = useState('')
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    setProject(getProject(draftId))
  }, [draftId])

  if (project === undefined) {
    return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
  }

  if (!project || !project.address || !project.constraints) {
    if (typeof window !== 'undefined') router.replace(`/dashboard/new/${draftId}/address`)
    return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
  }

  async function handleConfirm(free: boolean) {
    if (!free && !date) {
      show('Choose a preferred date to continue.', 'error')
      return
    }
    setIsBooking(true)
    await new Promise(resolve => window.setTimeout(resolve, 700))
    const { persisted } = updateProject(draftId, {
      consultantBooking: {
        date: free ? '' : date,
        time: free ? 'Callback — flexible' : time,
        notes: notes.trim() || undefined,
        bookedAt: new Date().toISOString(),
      },
    })
    setIsBooking(false)
    if (!persisted) {
      show("Couldn't save your booking — please try again.", 'error')
      return
    }
    show(
      free
        ? "Callback requested — we'll be in touch shortly."
        : "Consultation booked — we'll email a confirmation and video link.",
      'success'
    )
    router.push('/dashboard')
  }

  return (
    <div className="max-w-[560px] mx-auto">
      <button
        onClick={() => router.back()}
        className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
      >
        ← Back
      </button>

      <h1 className="font-display text-[26px] text-[#E8F0FF] mb-2">Book a planning consultation</h1>
      <p className="text-[13.5px] text-[#A8B8D8] leading-relaxed mb-6">
        A planning consultant will review your project, confirm the best route, and answer your questions.
      </p>

      <div className="rounded-[14px] border border-[#00D4FF]/40 bg-[#141C30] p-4 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[rgba(0,212,255,0.12)] border border-[#00D4FF]/30 flex items-center justify-center text-[12px] font-bold text-[#00D4FF] shrink-0">
            JH
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-[#E8F0FF]">Planning consultant</p>
            <p className="text-[12px] text-[#5A6A8A] mt-0.5">
              Conservation areas · Householder applications · {project.address.council}
            </p>
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[rgba(19,91,236,0.1)] border border-[#135BEC]/30 text-[#135BEC]">
              Available this week
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-[10px] border border-[#00D4FF]/25 bg-[rgba(0,212,255,0.06)] p-3.5 mb-6">
        <span className="text-[#00D4FF] shrink-0" aria-hidden="true">ℹ</span>
        <p className="text-[12.5px] text-[#A8B8D8] leading-relaxed">
          Your snapshot and property details will be shared before the call — no need to repeat yourself.
        </p>
      </div>

      <div className="space-y-3.5 mb-6">
        <Field label="Preferred date">
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Preferred time">
          <select value={time} onChange={e => setTime(e.target.value)} className={inputClass}>
            {TIME_SLOTS.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </Field>
        <Field label="Anything specific to cover? (optional)">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Concerned about conservation area design requirements…"
            rows={3}
            className={cn(inputClass, 'resize-none')}
          />
        </Field>
      </div>

      <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[#E8F0FF]">Planning consultation · 60 min video call</p>
          <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">With report pre-read · Follow-up summary provided</p>
        </div>
        <p className="font-display text-[20px] text-[#E8F0FF] shrink-0">£99</p>
      </div>

      <button
        type="button"
        onClick={() => handleConfirm(false)}
        disabled={isBooking}
        className="w-full px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)] disabled:opacity-60 disabled:cursor-not-allowed mb-2.5"
      >
        {isBooking ? 'Booking…' : 'Confirm booking · £99 →'}
      </button>
      <button
        type="button"
        onClick={() => handleConfirm(true)}
        disabled={isBooking}
        className="w-full px-6 py-3 rounded-[12px] font-semibold text-[13.5px] text-[#A8B8D8] border border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Request a callback instead (free)
      </button>
    </div>
  )
}

const inputClass = cn(
  'w-full rounded-[10px] px-3.5 py-2.5 text-[13.5px]',
  'bg-[#141C30] text-[#E8F0FF] placeholder:text-[#5A6A8A]',
  'border border-white/[0.12] outline-none transition-all',
  'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.12)]'
)

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">{label}</span>
      {children}
    </label>
  )
}
