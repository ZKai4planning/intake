'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HelpCircle } from 'lucide-react'
import { INTAKE_STEPS, WELCOME_NEEDS_CLICK, getRole } from '@/lib/intake/config'
import { getCategory, getSubtype, summariseProject } from '@/lib/intake/projectTypes'
import type { IntakeDraft, IntakeStepId } from '@/lib/intake/types'
import { AssistantShell, Reveal, UserBubble } from './ChatBits'
import { IntakeProgress } from './IntakeProgress'
import { DetailsCard } from './steps/DetailsCard'
import { PlanningCard } from './steps/PlanningCard'
import { PropertyCard } from './steps/PropertyCard'
import { ReviewCard } from './steps/ReviewCard'
import { TellMoreCard } from './steps/TellMoreCard'
import { WelcomeCard } from './steps/WelcomeCard'
import { useIntakeDraft } from './useIntakeDraft'

const NAVBAR_HEIGHT = 60

/**
 * ProjectIntakeChat  (/start)
 * ─────────────────────────────
 * Guided "Project Intake" conversation: Welcome → Your details → Property →
 * What are you planning? → Tell us more → verify email.
 *
 * Each step is a card inside an assistant bubble. Once answered it collapses
 * into a short summary + the person's reply bubble (with "Change"), so the
 * page reads as a chat rather than a long form. The transcript is derived
 * from state — no message list to keep in sync — and state is persisted by
 * useIntakeDraft, so refresh/resume just works.
 */
export function ProjectIntakeChat() {
  const router = useRouter()
  const { draft, patch, resumable, resume, startFresh } = useIntakeDraft()
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [started, setStarted] = useState(!WELCOME_NEEDS_CLICK)
  const activeRef = useRef<HTMLDivElement>(null)

  const stepIdx = INTAKE_STEPS.indexOf(draft.step)

  function goTo(step: IntakeStepId) {
    setDirection(INTAKE_STEPS.indexOf(step) < stepIdx ? 'back' : 'forward')
    patch({ step })
  }
  const next = () => goTo(INTAKE_STEPS[Math.min(stepIdx + 1, INTAKE_STEPS.length - 1)])
  const back = () => (stepIdx === 0 ? router.push('/') : goTo(INTAKE_STEPS[stepIdx - 1]))

  const scrollToActive = () => requestAnimationFrame(() => activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  const delay = direction === 'back' ? 0 : draft.step === 'details' ? 1100 : 450

  function renderActive() {
    switch (draft.step) {
      case 'details':
        return <DetailsCard value={draft.details} onChange={details => patch({ details })} onBack={back} onNext={next} />
      case 'property':
        return <PropertyCard value={draft.property} onChange={property => patch({ property })} onBack={back} onNext={next} />
      case 'planning':
        return <PlanningCard value={draft.planning} onChange={planning => patch({ planning })} onBack={back} onNext={next} />
      case 'more':
        return <TellMoreCard property={draft.property} planning={draft.planning} value={draft.more} onChange={more => patch({ more })} onBack={back} onNext={next} />
      case 'review':
        return <ReviewCard draft={draft} onEdit={goTo} onBack={back} />
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-0 flex flex-col bg-[#0A0E1A]" style={{ top: NAVBAR_HEIGHT }}>
      {/* Header + journey bar */}
      <div className="shrink-0 border-b border-white/[0.06] px-4 pb-3 pt-3 sm:px-8">
        <div className="mx-auto max-w-[920px]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[17px] font-semibold text-[#E8F0FF] sm:text-[19px]">Project Intake</h1>
              <p className="hidden text-[12.5px] text-[#A8B8D8] sm:block">Tell us what you&apos;re planning. We&apos;ll work out the appropriate planning route.</p>
            </div>
            <Link href="/contact" className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 text-[12px] text-[#A8B8D8] transition-colors hover:text-[#E8F0FF]">
              <HelpCircle className="h-3.5 w-3.5 text-[#00D4FF]" />
              Need help?
            </Link>
          </div>
          <IntakeProgress current={draft.step} onJump={goTo} />
        </div>
      </div>

      {/* Conversation */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-[720px] space-y-5">
          {resumable && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-400/25 bg-blue-500/[0.06] px-4 py-3">
              <p className="text-[12.5px] text-[#A8B8D8]">Welcome back — continue where you left off?</p>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={startFresh} className="px-2 py-1 text-[12px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8]">
                  Start fresh
                </button>
                <button type="button" onClick={resume} className="rounded-full bg-[#135BEC] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2A6BF0]">
                  Resume
                </button>
              </div>
            </div>
          )}

          <Reveal delayMs={350}>
            <WelcomeCard onStart={WELCOME_NEEDS_CLICK && !started ? () => setStarted(true) : undefined} />
          </Reveal>

          {started &&
            INTAKE_STEPS.slice(0, stepIdx).map(step => <CompletedStep key={step} step={step} draft={draft} onChange={() => goTo(step)} />)}

          {started && (
            <div ref={activeRef} className="scroll-mt-4" key={draft.step}>
              <Reveal delayMs={delay} onShown={scrollToActive}>
                {renderActive()}
              </Reveal>
            </div>
          )}

          <div className="h-24" aria-hidden />
        </div>
      </div>
    </div>
  )
}

// ── Collapsed answers ─────────────────────────────────────────────────

function CompletedStep({ step, draft, onChange }: { step: IntakeStepId; draft: IntakeDraft; onChange: () => void }) {
  const { details, property, planning, more } = draft
  let question = ''
  let title = ''
  let lines: string[] = []

  switch (step) {
    case 'details':
      question = 'Who are you?'
      title = details.fullName
      lines = [details.email, ...(details.mobile ? [details.mobile] : []), getRole(details.role).label]
      break
    case 'property':
      question = 'Which property is this?'
      title = property?.line1 ?? 'Property'
      lines = [[property?.town, property?.postcode].filter(Boolean).join(' · ')].filter(Boolean)
      break
    case 'planning': {
      const cat = getCategory(planning.categoryId)
      question = 'What are you planning?'
      title = cat?.label ?? 'Project'
      lines = [
        ...(planning.categoryId === 'unsure' && planning.describe ? [planning.describe] : []),
        planning.routeKnown === 'yes' ? 'I already know my planning route' : 'Planning route: you decide for me',
      ]
      break
    }
    case 'more': {
      const sub = getSubtype(planning.categoryId, more.subtypeId)
      const s = summariseProject(planning.categoryId, planning.describe, planning.routeKnown, more.subtypeId, more.answers)
      question = 'A few more details'
      title = planning.routeKnown === 'yes' ? 'Planning route details' : sub?.label ?? s.category
      const shown = s.lines.slice(0, 4).map(l => `${l.label}: ${l.value}`)
      lines = s.lines.length > 4 ? [...shown, `+ ${s.lines.length - 4} more`] : shown
      break
    }
    default:
      return null
  }

  return (
    <div className="space-y-2.5">
      <AssistantShell>
        <div className="inline-block animate-fade-in rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#0F1525] px-4 py-2.5 text-[13.5px] font-medium text-[#E8F0FF]">
          {question}
        </div>
      </AssistantShell>
      <UserBubble title={title} lines={lines} onChange={onChange} />
    </div>
  )
}
