// 'use client'

// import { useEffect, useState } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import { getProject, type Project } from '@/lib/projects'
// import { generateReport, buildProjectReportPdfInput, reportReference } from '@/lib/report'
// import { downloadPdfDocument } from '@/lib/pdf'
// import { useToast } from '@/components/ui/Toast'
// import { readAuthSession, isCurrentOwner } from '@/lib/authSession'

// /**
//  * /dashboard/new/[draftId]/report
//  * ──────────────────────────────────
//  * The paid eligibility report, unlocked once /checkout has recorded a
//  * `purchase` on the project. Bounces back to the snapshot if the
//  * project hasn't been paid for yet (e.g. a hand-edited URL).
//  */
// export default function ReportPage() {
//   const params = useParams<{ draftId: string }>()
//   const router = useRouter()
//   const { show } = useToast()
//   const draftId = params.draftId

//   const [project, setProject] = useState<Project | null | undefined>(undefined)

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

//   if (!project.purchase) {
//     if (typeof window !== 'undefined') router.replace(`/dashboard/new/${draftId}/snapshot`)
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
//   }

//   // Seeded on the project id so wording is stable across renders/downloads
//   // of THIS report, but differs from another project's report at the
//   // same address — see lib/variantSeed.ts.
//   const report = generateReport({
//     actorId: project.actorId,
//     council: project.address.council,
//     constraints: project.constraints,
//     seed: project.id,
//   })

//   const ref = reportReference(draftId)

//   async function handleDownload() {
//     if (!project || !project.address) return

//     if (!isCurrentOwner(project.ownerEmail)) {
//       show('This report belongs to a different account.', 'error')
//       return
//     }

//     const session = readAuthSession()
//     await downloadPdfDocument(
//       `planning-report-${draftId}.pdf`,
//       buildProjectReportPdfInput({
//         projectId: draftId,
//         addressLine: project.address.line1,
//         city: project.address.city,
//         postcode: project.address.postcode,
//         report,
//         ownerName: session?.name,
//         ownerEmail: session?.email,
//       })
//     )
//     show('Report downloaded.', 'success')
//   }

//   return (
//     <div className="max-w-[640px] mx-auto">
//       <button
//         onClick={() => router.push('/dashboard')}
//         className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
//       >
//         ← Dashboard
//       </button>

//       <div className="flex items-start justify-between gap-3 mb-2">
//         <h1 className="font-display text-[26px] text-[#E8F0FF]">Your planning eligibility report</h1>
//         <button
//           type="button"
//           onClick={handleDownload}
//           className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] font-semibold text-[#A8B8D8] border border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors"
//         >
//           ⬇ Download
//         </button>
//       </div>
//       <p className="text-[13px] text-[#5A6A8A] mb-6">
//         {project.address.line1}, {project.address.city} · Generated today · Ref: {ref}
//       </p>

//       <Section title="Likely application type">
//         <Row icon="📋" title={report.applicationType.title} detail={report.applicationType.detail} />
//         <Row icon="📜" title={report.alternative.title} detail={report.alternative.detail} />
//       </Section>

//       <Section title="Key risks for this property">
//         {report.risks.map(r => (
//           <Row key={r.title} icon={r.icon} title={r.title} detail={r.detail} tone={r.severity} />
//         ))}
//       </Section>

//       <Section title="Documents you will need">
//         {report.documents.map(d => (
//           <Row key={d.title} icon="○" title={d.title} detail={d.detail} />
//         ))}
//       </Section>

//       <Section title="Recommended next steps">
//         {report.nextSteps.map((s, i) => (
//           <Row key={s} icon={NUMBER_ICONS[i] ?? '•'} title={s} />
//         ))}
//       </Section>

//       {report.consultantRecommended && (
//         <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F87171]/25 bg-[rgba(248,113,113,0.06)] p-3.5 mb-6">
//           <span className="text-[#F87171] shrink-0" aria-hidden="true">👤</span>
//           <p className="text-[12.5px] text-[#A8B8D8] leading-relaxed">
//             <strong className="text-[#E8F0FF]">Consultant review recommended.</strong> Given the risks
//             found here, a planning consultant should confirm the route before drawings are commissioned.
//           </p>
//         </div>
//       )}

//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
//         <button
//           type="button"
//           onClick={() => router.push(`/dashboard/new/${draftId}/consultant`)}
//           className="px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)]"
//         >
//           Book a planning consultant →
//         </button>
//         <button
//           type="button"
//           onClick={() => router.push('/dashboard')}
//           className="px-6 py-3 rounded-[12px] font-semibold text-[13.5px] text-[#A8B8D8] border border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors"
//         >
//           Back to dashboard
//         </button>
//       </div>
//     </div>
//   )
// }

// const NUMBER_ICONS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']

// function Section({ title, children }: { title: string; children: React.ReactNode }) {
//   return (
//     <div className="mb-6">
//       <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3">{title}</p>
//       <div className="space-y-3">{children}</div>
//     </div>
//   )
// }

// function Row({
//   icon, title, detail, tone,
// }: {
//   icon: string
//   title: string
//   detail?: string
//   tone?: 'high' | 'medium'
// }) {
//   return (
//     <div className="flex items-start gap-3">
//       <span
//         className="text-base shrink-0"
//         style={tone === 'high' ? { color: '#F87171' } : tone === 'medium' ? { color: '#F59E0B' } : undefined}
//         aria-hidden="true"
//       >
//         {icon}
//       </span>
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
import { generateReport, buildProjectReportPdfInput, buildAreaSnapshotImagePages, reportReference } from '@/lib/report'
import { downloadPdfDocument } from '@/lib/pdf'
import { useToast } from '@/components/ui/Toast'
import { readAuthSession, isCurrentOwner } from '@/lib/authSession'
import { isEligibilityComplete } from '@/lib/eligibility'

/**
 * /dashboard/new/[draftId]/report
 * ──────────────────────────────────
 * The paid eligibility report, unlocked once /checkout has recorded a
 * `purchase` on the project. Bounces back to the snapshot if the
 * project hasn't been paid for yet (e.g. a hand-edited URL).
 */
export default function ReportPage() {
  const params = useParams<{ draftId: string }>()
  const router = useRouter()
  const { show } = useToast()
  const draftId = params.draftId

  const [project, setProject] = useState<Project | null | undefined>(undefined)

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

  if (!project.purchase) {
    if (typeof window !== 'undefined') router.replace(`/dashboard/new/${draftId}/snapshot`)
    return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
  }

  // Seeded on the project id so wording is stable across renders/downloads
  // of THIS report, but differs from another project's report at the
  // same address — see lib/variantSeed.ts.
  const report = generateReport({
    actorId: project.actorId,
    council: project.address.council,
    constraints: project.constraints,
    seed: project.id,
  })

  const ref = reportReference(draftId)

  async function handleDownload() {
    if (!project || !project.address) return

    if (!isCurrentOwner(project.ownerEmail)) {
      show('This report belongs to a different account.', 'error')
      return
    }

    const session = readAuthSession()
    const coordinates = typeof project.address.latitude === 'number' && typeof project.address.longitude === 'number'
      ? { latitude: project.address.latitude, longitude: project.address.longitude }
      : undefined
    const imagePages = await buildAreaSnapshotImagePages(coordinates)
    await downloadPdfDocument(
      `planning-report-${draftId}.pdf`,
      buildProjectReportPdfInput({
        projectId: draftId,
        addressLine: project.address.line1,
        city: project.address.city,
        postcode: project.address.postcode,
        report,
        constraintsChecked: project.constraints,
        dataSource: project.address.dataSource,
        dataNote: project.address.dataNote,
        imagePages,
        ownerName: session?.name,
        ownerEmail: session?.email,
      })
    )
    show('Report downloaded.', 'success')
  }

  return (
    <div className="max-w-[640px] mx-auto">
      <button
        onClick={() => router.push('/dashboard')}
        className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
      >
        ← Dashboard
      </button>

      <div className="flex items-start justify-between gap-3 mb-2">
        <h1 className="font-display text-[26px] text-[#E8F0FF]">Your planning eligibility report</h1>
        <button
          type="button"
          onClick={handleDownload}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[12px] font-semibold text-[#A8B8D8] border border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors"
        >
          ⬇ Download
        </button>
      </div>
      <p className="text-[13px] text-[#5A6A8A] mb-6">
        {project.address.line1}, {project.address.city} · Generated today · Ref: {ref}
      </p>

      <Section title="Likely application type">
        <Row icon="📋" title={report.applicationType.title} detail={report.applicationType.detail} />
        <Row icon="📜" title={report.alternative.title} detail={report.alternative.detail} />
      </Section>

      <Section title="Key risks for this property">
        {report.risks.map(r => (
          <Row key={r.title} icon={r.icon} title={r.title} detail={r.detail} tone={r.severity} />
        ))}
      </Section>

      <Section title="Documents you will need">
        {report.documents.map(d => (
          <Row key={d.title} icon="○" title={d.title} detail={d.detail} />
        ))}
      </Section>

      <Section title="Recommended next steps">
        {report.nextSteps.map((s, i) => (
          <Row key={s} icon={NUMBER_ICONS[i] ?? '•'} title={s} />
        ))}
      </Section>

      {report.consultantRecommended && (
        <div className="flex items-start gap-2.5 rounded-[10px] border border-[#F87171]/25 bg-[rgba(248,113,113,0.06)] p-3.5 mb-6">
          <span className="text-[#F87171] shrink-0" aria-hidden="true">👤</span>
          <p className="text-[12.5px] text-[#A8B8D8] leading-relaxed">
            <strong className="text-[#E8F0FF]">Consultant review recommended.</strong> Given the risks
            found here, a planning consultant should confirm the route before drawings are commissioned.
          </p>
        </div>
      )}

      <div className="mb-3">
        <button
          type="button"
          onClick={() => router.push(`/dashboard/new/${draftId}/eligibility`)}
          className="w-full px-6 py-3 rounded-[12px] font-semibold text-[13.5px] transition-all bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)]"
        >
          {isEligibilityComplete(draftId) ? 'View your eligibility check ✓' : 'Complete your eligibility check & apply →'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
        <button
          type="button"
          onClick={() => router.push(`/dashboard/new/${draftId}/consultant`)}
          className="px-6 py-3 rounded-[12px] font-semibold text-[13.5px] text-[#A8B8D8] border border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors"
        >
          Book a planning consultant →
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 rounded-[12px] font-semibold text-[13.5px] text-[#A8B8D8] border border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  )
}

const NUMBER_ICONS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-3">{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Row({
  icon, title, detail, tone,
}: {
  icon: string
  title: string
  detail?: string
  tone?: 'high' | 'medium'
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="text-base shrink-0"
        style={tone === 'high' ? { color: '#F87171' } : tone === 'medium' ? { color: '#F59E0B' } : undefined}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div>
        <p className="text-[13.5px] font-medium text-[#E8F0FF] leading-snug">{title}</p>
        {detail && <p className="text-[12.5px] text-[#5A6A8A] leading-relaxed mt-0.5">{detail}</p>}
      </div>
    </div>
  )
}
