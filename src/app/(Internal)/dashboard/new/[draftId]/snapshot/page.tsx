// 'use client'

// import { useEffect, useState } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { getProject, type Project } from '@/lib/projects'
// import { generateSnapshot } from '@/lib/snapshot'
// import { downloadPdfDocument } from '@/lib/pdf'
// import { useToast } from '@/components/ui/Toast'
// import { cn } from '@/lib/cn'

// type ProceedChoice = 'paid' | 'consultant' | 'managed' | 'self'

// const CHOICES: { id: ProceedChoice; icon: string; title: string; sub: string; price: string }[] = [
//   { id: 'paid',       icon: '📄', title: 'Get eligibility report',    sub: 'Tailored planning view with risks, route and document checklist', price: '£49' },
//   { id: 'consultant', icon: '👤', title: 'Speak with a consultant',   sub: 'Expert review by a qualified planning professional',              price: 'from £99' },
//   { id: 'managed',    icon: '⭐', title: 'Handle everything for me',  sub: 'Fully managed — we prepare and submit everything',                price: 'Quote' },
//   { id: 'self',       icon: '🔧', title: "I'll continue myself",      sub: 'Keep the snapshot and explore independently',                     price: 'Free' },
// ]

// const CTA_LABEL: Record<ProceedChoice, string> = {
//   paid:       'Continue with eligibility report →',
//   consultant: 'Book a planning consultation →',
//   managed:    'Request managed service →',
//   self:       'Save snapshot to dashboard →',
// }

// const CTA_TOAST: Record<ProceedChoice, string> = {
//   paid:       "Eligibility report requested — we'll follow up by email.",
//   consultant: "Consultation request received — we'll be in touch to schedule.",
//   managed:    "Managed service request received — we'll be in touch with a quote.",
//   self:       'Snapshot saved to your dashboard.',
// }

// /**
//  * /dashboard/new/[draftId]/snapshot
//  * ────────────────────────────────────
//  * Step 4 (final) of the application flow — the free planning snapshot,
//  * generated from the intake answers + the address step's constraint
//  * check. Requires both to already be saved on the project; bounces back
//  * to the address step otherwise (e.g. a hand-edited URL).
//  */
// export default function SnapshotPage() {
//   const params = useParams<{ draftId: string }>()
//   const router = useRouter()
//   const { show } = useToast()
//   const draftId = params.draftId

//   const [project, setProject] = useState<Project | null | undefined>(undefined)
//   const [choice, setChoice] = useState<ProceedChoice>('paid')
//   const [isDownloading, setIsDownloading] = useState(false)

//   useEffect(() => {
//     setProject(getProject(draftId))
//   }, [draftId])

//   if (project === undefined) {
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
//   }

//   if (!project || !project.address || !project.constraints) {
//     if (typeof window !== 'undefined') router.replace(`/dashboard/new/${draftId}/address`)
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
//   }

//   const snapshot = generateSnapshot({
//     actorId: project.actorId,
//     tier: project.tier,
//     title: project.title,
//     constraints: project.constraints,
//   })
//   const hasWarning = project.constraints.some(c => c.status === 'warning')

//   function handleProceed() {
//     if (choice === 'paid') {
//       router.push(`/dashboard/new/${draftId}/checkout`)
//       return
//     }
//     if (choice === 'consultant') {
//       router.push(`/dashboard/new/${draftId}/consultant`)
//       return
//     }
//     show(CTA_TOAST[choice], 'success')
//     router.push('/dashboard')
//   }

//   async function handleDownload() {
//     if (!project || !project.address) return
//     setIsDownloading(true)
//     try {
//       await downloadPdfDocument(`planning-snapshot-${draftId}.pdf`, {
//         title: 'Free planning snapshot',
//         subtitle: `${project.address.line1}, ${project.address.city} (${project.address.postcode}) · ${project.title} · Generated ${new Date().toLocaleString()}`,
//         note: 'This is general guidance based on the information provided. It is not a full planning assessment or legal advice.',
//         sections: [
//           {
//             heading: 'Likely planning route',
//             paragraphs: [snapshot.route, snapshot.routeDetail, snapshot.confidence],
//           },
//           {
//             heading: 'What to check next',
//             bullets: snapshot.checks,
//           },
//         ],
//         footer: 'AI4Planning — Free planning snapshot',
//       })
//       show('Snapshot downloaded.', 'success')
//     } catch {
//       show("Couldn't generate the PDF — please try again.", 'error')
//     } finally {
//       setIsDownloading(false)
//     }
//   }

//   return (
//     <div className="max-w-[640px] mx-auto">
//       <div className="flex items-start gap-2.5 rounded-[10px] border border-[#00D4FF]/25 bg-[rgba(0,212,255,0.06)] p-3.5 mb-6">
//         <span className="text-[#00D4FF] shrink-0" aria-hidden="true">ⓘ</span>
//         <p className="text-[12.5px] text-[#A8B8D8] leading-relaxed">
//           This is general guidance based on the information provided. It is not a full planning
//           assessment or legal advice.
//         </p>
//       </div>

//       <div className="flex items-start justify-between gap-3 mb-2">
//         <h1 className="font-display text-[26px] text-[#E8F0FF]">Your quick planning snapshot</h1>
//         <button
//           type="button"
//           onClick={handleDownload}
//           disabled={isDownloading}
//           className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] font-semibold text-[#A8B8D8] border border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {isDownloading ? 'Preparing PDF…' : '⬇ Download PDF'}
//         </button>
//       </div>
//       <p className="text-[13px] text-[#5A6A8A] mb-6">
//         {project.address.line1}, {project.address.city} · {project.title} · Generated just now
//       </p>

//       {/* ── Likely route ─────────────────────────────────────────── */}
//       <Section title="Likely planning route">
//         <Row icon="🗺️" title={snapshot.route} detail={snapshot.routeDetail} />
//         {hasWarning && (
//           <Row
//             icon="⚠️"
//             title="Constraint detected — factored into this snapshot"
//             detail={project.constraints
//               .filter(c => c.status === 'warning')
//               .map(c => c.label)
//               .join(' · ')}
//           />
//         )}
//         <Row icon="📊" title={snapshot.confidence} detail="Exact dimensions and design details would sharpen this. A paid report uses your specific measurements and your council's current policies." />
//       </Section>

//       {/* ── What to check next ───────────────────────────────────── */}
//       <Section title="What to check next">
//         {snapshot.checks.map(c => (
//           <Row key={c} icon="○" title={c} />
//         ))}
//       </Section>

//       {hasWarning && (
//         <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F87171]/25 bg-[rgba(248,113,113,0.06)] p-3.5 mb-6">
//           <span className="text-[#F87171] shrink-0" aria-hidden="true">🔍</span>
//           <p className="text-[12.5px] text-[#A8B8D8] leading-relaxed">
//             <strong className="text-[#E8F0FF]">Closer review recommended.</strong> The constraint found
//             here adds complexity. A planning consultant can confirm the exact rules before you commit
//             to a design or spend money on drawings.
//           </p>
//         </div>
//       )}

//       {/* ── Upsell ────────────────────────────────────────────────── */}
//       <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6">
//         <p className="text-[13.5px] font-semibold text-[#E8F0FF] mb-3">
//           Would you like a more tailored planning view?
//         </p>
//         <ul className="space-y-2">
//           {snapshot.upsell.map(u => (
//             <li key={u} className="flex items-start gap-2 text-[12.5px] text-[#A8B8D8] leading-relaxed">
//               <span className="text-[#135BEC] mt-0.5 shrink-0" aria-hidden="true">✓</span>
//               {u}
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* ── Proceed choice ───────────────────────────────────────── */}
//       <p className="text-[13.5px] font-semibold text-[#E8F0FF] mb-3">How would you like to proceed?</p>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
//         {CHOICES.map(c => (
//           <button
//             key={c.id}
//             type="button"
//             onClick={() => setChoice(c.id)}
//             className={cn(
//               'text-left rounded-[12px] border p-3.5 transition-colors',
//               choice === c.id
//                 ? 'border-[#135BEC] bg-[rgba(19,91,236,0.07)]'
//                 : 'border-white/[0.1] bg-[#141C30] hover:border-white/[0.22]'
//             )}
//           >
//             <span className="text-lg" aria-hidden="true">{c.icon}</span>
//             <p className="text-[13px] font-semibold text-[#E8F0FF] mt-1.5">{c.title}</p>
//             <p className="text-[11.5px] text-[#5A6A8A] mt-0.5 leading-snug">{c.sub}</p>
//             <p className="text-[12px] font-semibold text-[#135BEC] mt-2">{c.price}</p>
//           </button>
//         ))}
//       </div>

//       <button
//         type="button"
//         onClick={handleProceed}
//         className="w-full px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)]"
//       >
//         {CTA_LABEL[choice]}
//       </button>
//     </div>
//   )
// }

// function Section({ title, children }: { title: string; children: React.ReactNode }) {
//   return (
//     <div className="mb-6">
//       <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3">{title}</p>
//       <div className="space-y-3">{children}</div>
//     </div>
//   )
// }

// function Row({ icon, title, detail }: { icon: string; title: string; detail?: string }) {
//   return (
//     <div className="flex items-start gap-3">
//       <span className="text-base shrink-0" aria-hidden="true">{icon}</span>
//       <div>
//         <p className="text-[13.5px] font-medium text-[#E8F0FF] leading-snug">{title}</p>
//         {detail && <p className="text-[12.5px] text-[#5A6A8A] leading-relaxed mt-0.5">{detail}</p>}
//       </div>
//     </div>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProject, type Project } from '@/lib/projects'
import { generateSnapshot } from '@/lib/snapshot'
import { generateReport, buildProjectReportPdfInput } from '@/lib/report'
import { downloadPdfDocument } from '@/lib/pdf'
import { useToast } from '@/components/ui/Toast'
import { readAuthSession } from '@/lib/authSession'
import { isEligibilityComplete } from '@/lib/eligibility'
import { cn } from '@/lib/cn'

type ProceedChoice = 'paid' | 'consultant' | 'managed' | 'self'

const CHOICES: { id: ProceedChoice; icon: string; title: string; sub: string; price: string }[] = [
  { id: 'paid',       icon: '📄', title: 'Get eligibility report',    sub: 'Tailored planning view with risks, route and document checklist', price: '£49' },
  { id: 'consultant', icon: '👤', title: 'Speak with a consultant',   sub: 'Expert review by a qualified planning professional',              price: 'from £99' },
  { id: 'managed',    icon: '⭐', title: 'Handle everything for me',  sub: 'Fully managed — we prepare and submit everything',                price: 'Quote' },
  { id: 'self',       icon: '🔧', title: "I'll continue myself",      sub: 'Keep the snapshot and explore independently',                     price: 'Free' },
]

const CTA_LABEL: Record<ProceedChoice, string> = {
  paid:       'Continue with eligibility report →',
  consultant: 'Book a planning consultation →',
  managed:    'Request managed service →',
  self:       'Save snapshot to dashboard →',
}

const CTA_TOAST: Record<ProceedChoice, string> = {
  paid:       "Eligibility report requested — we'll follow up by email.",
  consultant: "Consultation request received — we'll be in touch to schedule.",
  managed:    "Managed service request received — we'll be in touch with a quote.",
  self:       'Snapshot saved to your dashboard.',
}

/**
 * /dashboard/new/[draftId]/snapshot
 * ────────────────────────────────────
 * Step 4 (final) of the application flow — the free planning snapshot,
 * generated from the intake answers + the address step's constraint
 * check. Requires both to already be saved on the project; bounces back
 * to the address step otherwise (e.g. a hand-edited URL).
 */
export default function SnapshotPage() {
  const params = useParams<{ draftId: string }>()
  const router = useRouter()
  const { show } = useToast()
  const draftId = params.draftId

  // Coming from the eligibility check flow (see the eligibility page's
  // "Continue to your report →" CTA) means the applicant already has a
  // completed eligibility record — they should get that eligibility
  // report on download here, and the "upgrade to the eligibility
  // report" choice below doesn't apply to them (it's how a *free*
  // snapshot user gets to one in the first place).
  const fromEligibilityCheck = isEligibilityComplete(draftId)

  const [project, setProject] = useState<Project | null | undefined>(undefined)
  const [choice, setChoice] = useState<ProceedChoice>(fromEligibilityCheck ? 'self' : 'paid')
  const [isDownloading, setIsDownloading] = useState(false)

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

  // Report upgrade is only for free users — someone who already
  // completed the eligibility check doesn't need to be sold on
  // getting the eligibility report; they already have it.
  const choices = fromEligibilityCheck ? CHOICES.filter(c => c.id !== 'paid') : CHOICES

  const snapshot = generateSnapshot({
    actorId: project.actorId,
    tier: project.tier,
    title: project.title,
    constraints: project.constraints,
  })
  const hasWarning = project.constraints.some(c => c.status === 'warning')

  function handleProceed() {
    if (choice === 'paid') {
      router.push(`/dashboard/new/${draftId}/checkout`)
      return
    }
    if (choice === 'consultant') {
      router.push(`/dashboard/new/${draftId}/consultant`)
      return
    }
    show(CTA_TOAST[choice], 'success')
    router.push('/dashboard')
  }

  async function handleDownload() {
    if (!project || !project.address || !project.constraints) return
    setIsDownloading(true)
    try {
      if (fromEligibilityCheck) {
        // Already completed the eligibility check — give them the real
        // eligibility report, not the free snapshot.
        const session = readAuthSession()
        const report = generateReport({
          actorId: project.actorId,
          council: project.address.council,
          constraints: project.constraints,
          seed: project.id,
        })
        await downloadPdfDocument(
          `planning-eligibility-report-${draftId}.pdf`,
          buildProjectReportPdfInput({
            projectId: draftId,
            addressLine: project.address.line1,
            city: project.address.city,
            postcode: project.address.postcode,
            report,
            ownerName: session?.name,
            ownerEmail: session?.email,
          })
        )
        show('Eligibility report downloaded.', 'success')
      } else {
        await downloadPdfDocument(`planning-snapshot-${draftId}.pdf`, {
          title: 'Free planning snapshot',
          subtitle: `${project.address.line1}, ${project.address.city} (${project.address.postcode}) · ${project.title} · Generated ${new Date().toLocaleString()}`,
          note: 'This is general guidance based on the information provided. It is not a full planning assessment or legal advice.',
          sections: [
            {
              heading: 'Likely planning route',
              paragraphs: [snapshot.route, snapshot.routeDetail, snapshot.confidence],
            },
            {
              heading: 'What to check next',
              bullets: snapshot.checks,
            },
          ],
          footer: 'AI4Planning — Free planning snapshot',
        })
        show('Snapshot downloaded.', 'success')
      }
    } catch {
      show("Couldn't generate the PDF — please try again.", 'error')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="max-w-[640px] mx-auto">
      <div className="flex items-start gap-2.5 rounded-[10px] border border-[#00D4FF]/25 bg-[rgba(0,212,255,0.06)] p-3.5 mb-6">
        <span className="text-[#00D4FF] shrink-0" aria-hidden="true">ⓘ</span>
        <p className="text-[12.5px] text-[#A8B8D8] leading-relaxed">
          This is general guidance based on the information provided. It is not a full planning
          assessment or legal advice.
        </p>
      </div>

      <div className="flex items-start justify-between gap-3 mb-2">
        <h1 className="font-display text-[26px] text-[#E8F0FF]">Your quick planning snapshot</h1>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] font-semibold text-[#A8B8D8] border border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? 'Preparing PDF…' : fromEligibilityCheck ? '⬇ Download eligibility report' : '⬇ Download PDF'}
        </button>
      </div>
      <p className="text-[13px] text-[#5A6A8A] mb-6">
        {project.address.line1}, {project.address.city} · {project.title} · Generated just now
      </p>

      {/* ── Likely route ─────────────────────────────────────────── */}
      <Section title="Likely planning route">
        <Row icon="🗺️" title={snapshot.route} detail={snapshot.routeDetail} />
        {hasWarning && (
          <Row
            icon="⚠️"
            title="Constraint detected — factored into this snapshot"
            detail={project.constraints
              .filter(c => c.status === 'warning')
              .map(c => c.label)
              .join(' · ')}
          />
        )}
        <Row icon="📊" title={snapshot.confidence} detail="Exact dimensions and design details would sharpen this. A paid report uses your specific measurements and your council's current policies." />
      </Section>

      {/* ── What to check next ───────────────────────────────────── */}
      <Section title="What to check next">
        {snapshot.checks.map(c => (
          <Row key={c} icon="○" title={c} />
        ))}
      </Section>

      {hasWarning && (
        <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F87171]/25 bg-[rgba(248,113,113,0.06)] p-3.5 mb-6">
          <span className="text-[#F87171] shrink-0" aria-hidden="true">🔍</span>
          <p className="text-[12.5px] text-[#A8B8D8] leading-relaxed">
            <strong className="text-[#E8F0FF]">Closer review recommended.</strong> The constraint found
            here adds complexity. A planning consultant can confirm the exact rules before you commit
            to a design or spend money on drawings.
          </p>
        </div>
      )}

      {/* ── Upsell ────────────────────────────────────────────────── */}
      <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4 mb-6">
        <p className="text-[13.5px] font-semibold text-[#E8F0FF] mb-3">
          Would you like a more tailored planning view?
        </p>
        <ul className="space-y-2">
          {snapshot.upsell.map(u => (
            <li key={u} className="flex items-start gap-2 text-[12.5px] text-[#A8B8D8] leading-relaxed">
              <span className="text-[#135BEC] mt-0.5 shrink-0" aria-hidden="true">✓</span>
              {u}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Proceed choice ───────────────────────────────────────── */}
      <p className="text-[13.5px] font-semibold text-[#E8F0FF] mb-3">How would you like to proceed?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
        {choices.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setChoice(c.id)}
            className={cn(
              'text-left rounded-[12px] border p-3.5 transition-colors',
              choice === c.id
                ? 'border-[#135BEC] bg-[rgba(19,91,236,0.07)]'
                : 'border-white/[0.1] bg-[#141C30] hover:border-white/[0.22]'
            )}
          >
            <span className="text-lg" aria-hidden="true">{c.icon}</span>
            <p className="text-[13px] font-semibold text-[#E8F0FF] mt-1.5">{c.title}</p>
            <p className="text-[11.5px] text-[#5A6A8A] mt-0.5 leading-snug">{c.sub}</p>
            <p className="text-[12px] font-semibold text-[#135BEC] mt-2">{c.price}</p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleProceed}
        className="w-full px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)]"
      >
        {CTA_LABEL[choice]}
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Row({ icon, title, detail }: { icon: string; title: string; detail?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base shrink-0" aria-hidden="true">{icon}</span>
      <div>
        <p className="text-[13.5px] font-medium text-[#E8F0FF] leading-snug">{title}</p>
        {detail && <p className="text-[12.5px] text-[#5A6A8A] leading-relaxed mt-0.5">{detail}</p>}
      </div>
    </div>
  )
}