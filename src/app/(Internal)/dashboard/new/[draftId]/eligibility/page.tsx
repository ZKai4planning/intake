// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import { useParams, useRouter, useSearchParams } from 'next/navigation'
// import Link from 'next/link'
// import { CheckCircle2, Circle, ChevronLeft, Loader2, AlertCircle, Download, Mail } from 'lucide-react'

// import { getProject, saveDraft, updateProject, markProjectSubmitted, type Project } from '@/lib/projects'
// import { lookupAddresses, checkConstraints, councilFor } from '@/lib/constraints'
// import { inferActorForService } from '@/lib/services'
// import {
//   ensureEligibility,
//   patchEligibility,
//   markEligibilityComplete,
//   buildEligibilityReceiptPdf,
//   type EligibilityRecord,
// } from '@/lib/eligibility'
// import { getMissingRequiredFields } from '@/lib/eligibilityValidation'
// import { downloadPdfDocument } from '@/lib/pdf'
// import { readAuthSession } from '@/lib/authSession'
// import { relevantSectionsForFeature, isSectionRelevant } from '@/lib/eligibilityRelevance'
// import { EligibilityFormProvider, asStringValue } from '@/components/eligibility/EligibilityFormContext'
// import { AgentZProvider } from '@/components/eligibility/AgentZContext'
// import { AgentZWidget } from '@/components/eligibility/AgentZWidget'
// import { eligibilityComponents } from '@/components/eligibility/fields'
// import { ELIGIBILITY_STEPS } from '@/components/eligibility/steps'
// import type { EligibilityFormValues, EligibilityUpdateSection } from '@/components/eligibility/types'
// import { useToast } from '@/components/ui/Toast'
// import { cn } from '@/lib/cn'

// /**
//  * /dashboard/new/[draftId]/eligibility
//  * ───────────────────────────────────────
//  * The 5-step "full application" form: applicant & property, site
//  * constraints, works & materials, utilities & consents, and
//  * declarations/signature. Sits alongside the existing address →
//  * snapshot → checkout → report steps for the same project — entry
//  * point is a CTA on the paid report page for now (see that page for
//  * the reasoning; where exactly this sits in the funnel long-term is
//  * still being decided).
//  *
//  * Every field autosaves on change via lib/eligibility.ts — there's no
//  * separate "save" step, only "submit" at the end.
//  */
// export default function EligibilityPage() {
//   const params = useParams<{ draftId: string }>()
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const { show } = useToast()
//   const draftId = params.draftId
//   const serviceId = searchParams.get('service') ?? undefined
//   const featureTitle = searchParams.get('feature') ? decodeURIComponent(searchParams.get('feature')!) : undefined

//   const [project, setProject] = useState<Project | null | undefined>(undefined)
//   const [record, setRecord] = useState<EligibilityRecord | null>(null)
//   const [stepIndex, setStepIndex] = useState(0)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
//   const saveIndicatorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
//   const [validationErrors, setValidationErrors] = useState<string[]>([])
//   const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false)

//   useEffect(() => {
//     let existing = getProject(draftId)

//     // Direct entry from a homepage service/subservice pick (see
//     // ServiceExpandPanel + /dashboard/new/service) — there's no
//     // project yet for this draftId, so mint a minimal one instead of
//     // bouncing to the full intent flow. The eligibility form IS the
//     // intake here.
//     if (!existing && serviceId) {
//       const { project: created } = saveDraft({
//         id: draftId,
//         actorId: inferActorForService(serviceId),
//         tier: 'simple',
//         answers: {},
//       })
//       existing = created
//     }

//     if (!existing) {
//       setProject(existing)
//       return
//     }

//     // Service/feature context, resolved once: prefer what's in the
//     // URL (freshest), fall back to what's already stored on the
//     // project (so re-entering from the report page or reports list —
//     // neither of which pass these params — still resolves correctly).
//     const effectiveServiceId = serviceId ?? existing.serviceId
//     const effectiveFeatureTitle = featureTitle ?? existing.featureTitle

//     // Backfill onto the project the first time we learn it (or if the
//     // URL disagrees with what's stored) — this is what makes ANY
//     // future entry point able to look it up without URL params.
//     // Projects that never had this context (generic intent flow) stay
//     // untouched — nothing to backfill, no regression.
//     if (
//       effectiveServiceId &&
//       (existing.serviceId !== effectiveServiceId || existing.featureTitle !== effectiveFeatureTitle)
//     ) {
//       const { project: patched } = updateProject(draftId, {
//         serviceId: effectiveServiceId,
//         featureTitle: effectiveFeatureTitle,
//       })
//       if (patched) existing = patched
//     }

//     setProject(existing)

//     const eligibility = ensureEligibility(draftId, {
//       serviceId: effectiveServiceId,
//       featureTitle: effectiveFeatureTitle,
//     })

//     // First time only: bring over what we already know from the address step
//     // so the applicant doesn't retype it.
//     if (Object.keys(eligibility.formData).length === 0 && existing.address) {
//       const seeded = patchEligibility(draftId, {
//         formData: {
//           'Site Address Line 1': existing.address.line1,
//           Postcode: existing.address.postcode,
//           Council: existing.address.council,
//         },
//       })
//       setRecord(seeded)
//     } else {
//       setRecord(eligibility)
//     }
//     setStepIndex(eligibility.currentStep ?? 0)
//   }, [draftId, serviceId, featureTitle])

//   useEffect(() => {
//     return () => {
//       if (saveIndicatorTimeout.current) clearTimeout(saveIndicatorTimeout.current)
//     }
//   }, [])

//   if (project === undefined || record === null) {
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
//   }

//   if (!project) {
//     if (typeof window !== 'undefined') router.replace('/dashboard/new/intent')
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
//   }

//   const step = ELIGIBILITY_STEPS[stepIndex]
//   const isLastStep = stepIndex === ELIGIBILITY_STEPS.length - 1
//   const alreadyComplete = !!record.completedAt
//   const relevantSections = relevantSectionsForFeature(record.featureTitle)
//   const isSectionVisible = (section: string) => isSectionRelevant(section, relevantSections)
//   const session = readAuthSession()

//   const updateSection: EligibilityUpdateSection = (_section, value) => {
//     const patch = (value ?? {}) as { formData?: EligibilityFormValues; location?: Record<string, unknown> }
//     const nextFormData = patch.formData ?? record.formData
//     const answeredSteps = record.answeredSteps?.includes(stepIndex)
//       ? record.answeredSteps
//       : [...(record.answeredSteps ?? []), stepIndex]

//     setSaveState('saving')
//     const updated = patchEligibility(draftId, {
//       formData: nextFormData,
//       answeredSteps,
//       ...(patch.location ? { location: { ...record.location, ...patch.location } } : {}),
//     })
//     setRecord(updated)

//     // Brief "saving…" → "saved" → fade, debounced so rapid typing doesn't flicker.
//     if (saveIndicatorTimeout.current) clearTimeout(saveIndicatorTimeout.current)
//     saveIndicatorTimeout.current = setTimeout(() => {
//       setSaveState('saved')
//       saveIndicatorTimeout.current = setTimeout(() => setSaveState('idle'), 2000)
//     }, 400)
//   }

//   function goToStep(index: number) {
//     setValidationErrors([])
//     setStepIndex(index)
//     patchEligibility(draftId, { currentStep: index })
//   }

//   const handleContinue = () => {
//     const missing = getMissingRequiredFields(step.id, record.formData)
//     if (missing.length > 0) {
//       setValidationErrors(missing)
//       show(`Please complete: ${missing.join(', ')}`, 'error')
//       return
//     }
//     goToStep(stepIndex + 1)
//   }

//   const handleSubmit = async () => {
//     const missing = getMissingRequiredFields(step.id, record.formData)
//     if (missing.length > 0) {
//       setValidationErrors(missing)
//       show(`Please complete: ${missing.join(', ')}`, 'error')
//       return
//     }

//     setIsSubmitting(true)
//     markEligibilityComplete(draftId)

//     // The eligibility form collects its own address fields (Site Address
//     // Line 1 / Postcode / Council — see ApplicantPropertyStepContent), but
//     // when this page is entered directly from a homepage service link
//     // (no prior /address step), the project has no structured
//     // `address`/`constraints` yet. Snapshot/checkout/report — and the
//     // dashboard widgets that only count 'submitted' projects — all need
//     // both, so derive and save them here, same mock lookups the address
//     // step itself uses, before promoting the project.
//     let current: Project = project
//     if (!current.address || !current.constraints) {
//       const postcode = asStringValue(record.formData['Postcode']).trim()
//       if (postcode) {
//         const line1 = asStringValue(record.formData['Site Address Line 1']).trim()
//           || lookupAddresses(postcode)[0]?.line1
//           || ''
//         const city = lookupAddresses(postcode)[0]?.city ?? ''
//         const council = asStringValue(record.formData['Council']).trim() || councilFor(postcode)
//         const { project: withAddress } = updateProject(draftId, {
//           address: { postcode, line1, city, council },
//           constraints: checkConstraints(postcode),
//         })
//         if (withAddress) current = withAddress
//       }
//     }

//     const { project: submittedProject } = markProjectSubmitted(draftId)
//     current = submittedProject ?? current
//     setProject(current)
//     setRecord(ensureEligibility(draftId))
//     setIsSubmitting(false)

//     // Same next step as the rest of the funnel: free snapshot, with the
//     // paid-report / consultant / managed-service / self-serve choice —
//     // see /dashboard/new/[draftId]/snapshot. Only possible once we have
//     // an address + constraint check on the project (above); if no
//     // postcode was ever captured, fall back to the plain confirmation.
//     if (current.address && current.constraints) {
//       router.push(`/dashboard/new/${draftId}/snapshot`)
//     } else {
//       show('Eligibility check submitted.', 'success')
//     }
//   }

//   const handleDownloadReceipt = async () => {
//     setIsDownloadingReceipt(true)
//     try {
//       await downloadPdfDocument(
//         `eligibility-receipt-${draftId}.pdf`,
//         buildEligibilityReceiptPdf({ record, projectTitle: project.title })
//       )
//     } finally {
//       setIsDownloadingReceipt(false)
//     }
//   }

//   return (
//     <AgentZProvider projectId={draftId}>
//       <div className="min-h-screen bg-[#0A0E1A] px-5 py-8 sm:px-8">
//       <div className="mx-auto max-w-[880px]">
//         <Link
//           href="/dashboard/reports"
//           className="mb-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors"
//         >
//           <ChevronLeft className="h-3.5 w-3.5" />
//           Back to My Reports
//         </Link>

//         <div className="mb-6 flex items-start justify-between gap-4">
//           <div>
//             <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#00D4FF] mb-1.5">
//               Eligibility check
//             </p>
//             <h1 className="font-display text-[24px] sm:text-[28px] font-normal text-[#E8F0FF] tracking-tight">
//               {project.title}
//             </h1>
//             {record.featureTitle && (
//               <p className="mt-1 text-[12.5px] text-[#5A6A8A]">
//                 Tailored to: <span className="text-[#A8B8D8] font-medium">{record.featureTitle}</span> — only the relevant questions are shown below.
//               </p>
//             )}
//           </div>

//           {!alreadyComplete && saveState !== 'idle' && (
//             <span className="shrink-0 mt-1 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#5A6A8A]">
//               {saveState === 'saving' ? (
//                 <>
//                   <Loader2 className="h-3 w-3 animate-spin" />
//                   Saving…
//                 </>
//               ) : (
//                 <>
//                   <CheckCircle2 className="h-3 w-3 text-emerald-300" />
//                   Saved
//                 </>
//               )}
//             </span>
//           )}
//         </div>

//         {/* ── Stepper ─────────────────────────────────────────────── */}
//         <div className="mb-7 flex items-center gap-1.5 overflow-x-auto pb-1">
//           {ELIGIBILITY_STEPS.map((s, i) => {
//             const answered = alreadyComplete || !!record.answeredSteps?.includes(i)
//             const visitedEmpty = !answered && i < stepIndex
//             const active = i === stepIndex && !alreadyComplete
//             return (
//               <button
//                 key={s.id}
//                 onClick={() => goToStep(i)}
//                 title={visitedEmpty ? 'Visited — no answers entered yet' : undefined}
//                 className={cn(
//                   'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors',
//                   active
//                     ? 'border-[#135BEC] bg-[#135BEC]/10 text-[#00D4FF]'
//                     : answered
//                       ? 'border-emerald-400/25 bg-emerald-500/[0.06] text-emerald-300'
//                       : visitedEmpty
//                         ? 'border-amber-400/25 bg-amber-500/[0.05] text-amber-300'
//                         : 'border-white/[0.10] text-[#5A6A8A] hover:text-[#A8B8D8]'
//                 )}
//               >
//                 {answered ? (
//                   <CheckCircle2 className="h-3 w-3" />
//                 ) : visitedEmpty ? (
//                   <Circle className="h-3 w-3" />
//                 ) : (
//                   <span>{i + 1}</span>
//                 )}
//                 {s.title}
//               </button>
//             )
//           })}
//         </div>

//         {alreadyComplete ? (
//           <div className="rounded-[14px] border border-emerald-400/25 bg-emerald-500/[0.06] px-6 py-14 flex flex-col items-center text-center">
//             <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 mb-4">
//               <CheckCircle2 className="h-5 w-5" />
//             </span>
//             <p className="text-[15px] font-semibold text-[#E8F0FF] mb-1.5">Eligibility check submitted</p>
//             {record.submissionRef && (
//               <p className="text-[12px] text-[#5A6A8A] mb-1">
//                 Reference: <span className="font-mono text-[#A8B8D8]">{record.submissionRef}</span>
//               </p>
//             )}
//             <p className="text-[13px] text-[#5A6A8A] max-w-[380px] mb-1">
//               Submitted {new Date(record.completedAt!).toLocaleString()}. We'll be in touch about next steps for {project.title}.
//             </p>
//             {session?.email && (
//               <p className="mb-6 flex items-center gap-1.5 text-[11.5px] text-[#5A6A8A]">
//                 <Mail className="h-3 w-3" />
//                 Confirmation sent to {session.email}
//                 <span className="text-[#5A6A8A]/70">(preview — no email actually sent yet)</span>
//               </p>
//             )}
//             <div className="flex flex-wrap items-center justify-center gap-2.5">
//               <button
//                 onClick={handleDownloadReceipt}
//                 disabled={isDownloadingReceipt}
//                 className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] border border-white/[0.12] text-[#A8B8D8] text-[13px] font-semibold hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors disabled:opacity-60"
//               >
//                 <Download className="h-3.5 w-3.5" />
//                 {isDownloadingReceipt ? 'Preparing…' : 'Download receipt (PDF)'}
//               </button>
//               <button
//                 onClick={() => {
//                   if (project.purchase) router.push(`/dashboard/new/${draftId}/report`)
//                   else if (project.address && project.constraints) router.push(`/dashboard/new/${draftId}/snapshot`)
//                   else router.push('/dashboard/reports')
//                 }}
//                 className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] transition-colors"
//               >
//                 {project.purchase
//                   ? 'View your report →'
//                   : project.address && project.constraints
//                     ? 'Continue to your report →'
//                     : 'Back to reports'}
//               </button>
//             </div>
//           </div>
//         ) : (
//           <>
//             <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-6 sm:p-7">
//               <h2 className="text-[16px] font-semibold text-[#E8F0FF] mb-1">{step.title}</h2>
//               <p className="text-[12.5px] text-[#5A6A8A] mb-6">{step.description}</p>

//               {validationErrors.length > 0 && (
//                 <div className="mb-6 flex items-start gap-2.5 rounded-[10px] border border-red-400/25 bg-red-500/[0.06] px-3.5 py-3">
//                   <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-300" />
//                   <p className="text-[12.5px] text-[#E8F0FF]">
//                     <span className="font-semibold">Please complete before continuing:</span> {validationErrors.join(', ')}
//                   </p>
//                 </div>
//               )}

//               <EligibilityFormProvider savedFormData={record.formData} updateSection={updateSection}>
//                 <step.Component
//                   savedFormData={record.formData}
//                   updateSection={updateSection}
//                   asStringValue={asStringValue}
//                   components={eligibilityComponents}
//                   isSectionVisible={isSectionVisible}
//                 />
//               </EligibilityFormProvider>
//             </div>

//             <div className="mt-5 flex items-center justify-between">
//               <button
//                 onClick={() => goToStep(Math.max(0, stepIndex - 1))}
//                 disabled={stepIndex === 0}
//                 className="px-4 py-2.5 rounded-[10px] text-[13px] font-semibold text-[#A8B8D8] border border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
//               >
//                 ← Back
//               </button>

//               {isLastStep ? (
//                 <button
//                   onClick={handleSubmit}
//                   disabled={isSubmitting}
//                   className="px-6 py-2.5 rounded-[10px] font-semibold text-[13.5px] bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)] transition-colors disabled:opacity-60"
//                 >
//                   {isSubmitting ? 'Submitting…' : 'Submit application'}
//                 </button>
//               ) : (
//                 <button
//                   onClick={handleContinue}
//                   className="px-6 py-2.5 rounded-[10px] font-semibold text-[13.5px] bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)] transition-colors"
//                 >
//                   Continue →
//                 </button>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//       </div>
//       <AgentZWidget />
//     </AgentZProvider>
//   )
// }



'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Circle, ChevronLeft, Loader2, AlertCircle, Download, Mail } from 'lucide-react'

import { getProject, saveDraft, updateProject, markProjectSubmitted, type Project } from '@/lib/projects'
import { lookupAddresses } from '@/lib/constraints'
import { resolveAddressData } from '@/lib/liveAddressLookup'
import { inferActorForService } from '@/lib/services'
import {
  ensureEligibility,
  patchEligibility,
  markEligibilityComplete,
  buildEligibilityReceiptPdf,
  type EligibilityRecord,
} from '@/lib/eligibility'
import { getMissingRequiredFields } from '@/lib/eligibilityValidation'
import { downloadPdfDocument } from '@/lib/pdf'
import { readAuthSession } from '@/lib/authSession'
import { relevantSectionsForFeature, isSectionRelevant } from '@/lib/eligibilityRelevance'
import { EligibilityFormProvider, asStringValue } from '@/components/eligibility/EligibilityFormContext'
import { AgentZProvider } from '@/components/eligibility/AgentZContext'
import { AgentZWidget } from '@/components/eligibility/AgentZWidget'
import { eligibilityComponents } from '@/components/eligibility/fields'
import { ELIGIBILITY_STEPS } from '@/components/eligibility/steps'
import type { EligibilityFormValues, EligibilityUpdateSection } from '@/components/eligibility/types'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/cn'

/**
 * /dashboard/new/[draftId]/eligibility
 * ───────────────────────────────────────
 * The 5-step "full application" form: applicant & property, site
 * constraints, works & materials, utilities & consents, and
 * declarations/signature. Sits alongside the existing address →
 * snapshot → checkout → report steps for the same project — entry
 * point is a CTA on the paid report page for now (see that page for
 * the reasoning; where exactly this sits in the funnel long-term is
 * still being decided).
 *
 * Every field autosaves on change via lib/eligibility.ts — there's no
 * separate "save" step, only "submit" at the end.
 */
export default function EligibilityPage() {
  const params = useParams<{ draftId: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { show } = useToast()
  const draftId = params.draftId
  const serviceId = searchParams.get('service') ?? undefined
  const featureTitle = searchParams.get('feature') ? decodeURIComponent(searchParams.get('feature')!) : undefined

  const [project, setProject] = useState<Project | null | undefined>(undefined)
  const [record, setRecord] = useState<EligibilityRecord | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const saveIndicatorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false)

  useEffect(() => {
    let existing = getProject(draftId)

    // Direct entry from a homepage service/subservice pick (see
    // ServiceExpandPanel + /dashboard/new/service) — there's no
    // project yet for this draftId, so mint a minimal one instead of
    // bouncing to the full intent flow. The eligibility form IS the
    // intake here.
    if (!existing && serviceId) {
      const { project: created } = saveDraft({
        id: draftId,
        actorId: inferActorForService(serviceId),
        tier: 'simple',
        answers: {},
      })
      existing = created
    }

    if (!existing) {
      setProject(existing)
      return
    }

    // Service/feature context, resolved once: prefer what's in the
    // URL (freshest), fall back to what's already stored on the
    // project (so re-entering from the report page or reports list —
    // neither of which pass these params — still resolves correctly).
    const effectiveServiceId = serviceId ?? existing.serviceId
    const effectiveFeatureTitle = featureTitle ?? existing.featureTitle

    // Backfill onto the project the first time we learn it (or if the
    // URL disagrees with what's stored) — this is what makes ANY
    // future entry point able to look it up without URL params.
    // Projects that never had this context (generic intent flow) stay
    // untouched — nothing to backfill, no regression.
    if (
      effectiveServiceId &&
      (existing.serviceId !== effectiveServiceId || existing.featureTitle !== effectiveFeatureTitle)
    ) {
      const { project: patched } = updateProject(draftId, {
        serviceId: effectiveServiceId,
        featureTitle: effectiveFeatureTitle,
      })
      if (patched) existing = patched
    }

    setProject(existing)

    const eligibility = ensureEligibility(draftId, {
      serviceId: effectiveServiceId,
      featureTitle: effectiveFeatureTitle,
    })

    // First time only: bring over what we already know from the address step
    // so the applicant doesn't retype it.
    if (Object.keys(eligibility.formData).length === 0 && existing.address) {
      const seeded = patchEligibility(draftId, {
        formData: {
          'Site Address Line 1': existing.address.line1,
          Postcode: existing.address.postcode,
          Council: existing.address.council,
        },
      })
      setRecord(seeded)
    } else {
      setRecord(eligibility)
    }
    setStepIndex(eligibility.currentStep ?? 0)
  }, [draftId, serviceId, featureTitle])

  useEffect(() => {
    return () => {
      if (saveIndicatorTimeout.current) clearTimeout(saveIndicatorTimeout.current)
    }
  }, [])

  if (project === undefined || record === null) {
    return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading…</p>
  }

  if (!project) {
    if (typeof window !== 'undefined') router.replace('/dashboard/new/intent')
    return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
  }

  const step = ELIGIBILITY_STEPS[stepIndex]
  const isLastStep = stepIndex === ELIGIBILITY_STEPS.length - 1
  const alreadyComplete = !!record.completedAt
  const relevantSections = relevantSectionsForFeature(record.featureTitle)
  const isSectionVisible = (section: string) => isSectionRelevant(section, relevantSections)
  const session = readAuthSession()

  const updateSection: EligibilityUpdateSection = (_section, value) => {
    const patch = (value ?? {}) as { formData?: EligibilityFormValues; location?: Record<string, unknown> }
    const nextFormData = patch.formData ?? record.formData
    const answeredSteps = record.answeredSteps?.includes(stepIndex)
      ? record.answeredSteps
      : [...(record.answeredSteps ?? []), stepIndex]

    setSaveState('saving')
    const updated = patchEligibility(draftId, {
      formData: nextFormData,
      answeredSteps,
      ...(patch.location ? { location: { ...record.location, ...patch.location } } : {}),
    })
    setRecord(updated)

    // Brief "saving…" → "saved" → fade, debounced so rapid typing doesn't flicker.
    if (saveIndicatorTimeout.current) clearTimeout(saveIndicatorTimeout.current)
    saveIndicatorTimeout.current = setTimeout(() => {
      setSaveState('saved')
      saveIndicatorTimeout.current = setTimeout(() => setSaveState('idle'), 2000)
    }, 400)
  }

  function goToStep(index: number) {
    setValidationErrors([])
    setStepIndex(index)
    patchEligibility(draftId, { currentStep: index })
  }

  const handleContinue = () => {
    const missing = getMissingRequiredFields(step.id, record.formData)
    if (missing.length > 0) {
      setValidationErrors(missing)
      show(`Please complete: ${missing.join(', ')}`, 'error')
      return
    }
    goToStep(stepIndex + 1)
  }

  const handleSubmit = async () => {
    const missing = getMissingRequiredFields(step.id, record.formData)
    if (missing.length > 0) {
      setValidationErrors(missing)
      show(`Please complete: ${missing.join(', ')}`, 'error')
      return
    }

    setIsSubmitting(true)
    markEligibilityComplete(draftId)

    // The eligibility form collects its own address fields (Site Address
    // Line 1 / Postcode / Council — see ApplicantPropertyStepContent), but
    // when this page is entered directly from a homepage service link
    // (no prior /address step), the project has no structured
    // `address`/`constraints` yet. Snapshot/checkout/report — and the
    // dashboard widgets that only count 'submitted' projects — all need
    // both, so derive and save them here, same mock lookups the address
    // step itself uses, before promoting the project.
    let current: Project = project
    // The site-specific "Postcode" / "Site Address Line 1" / "Council"
    // fields only render when the applicant says the site address is
    // DIFFERENT from their correspondence address (see
    // ApplicantPropertyStepContent's `useAlternateCorrespondenceAddress`).
    // In the common case — site address SAME as correspondence address —
    // those fields never render, so fall back to the "Correspondence …"
    // fields, which hold the site address in that case.
    const eligibilityPostcode =
      asStringValue(record.formData['Postcode']).trim() ||
      asStringValue(record.formData['Correspondence Postcode']).trim()

    // Re-derive address/constraints if either there's none yet on the
    // project (direct entry from a homepage service link, no prior
    // /address step), OR the applicant edited the site address inside
    // the eligibility form itself to a different postcode than what the
    // /address step originally checked — otherwise the snapshot/report
    // that follows keeps showing the stale, pre-edit constraint check.
    const addressChanged =
      !!eligibilityPostcode &&
      !!current.address &&
      eligibilityPostcode.replace(/\s+/g, '').toUpperCase() !==
        current.address.postcode.replace(/\s+/g, '').toUpperCase()

    if (!current.address || !current.constraints || addressChanged) {
      const postcode = eligibilityPostcode
      if (postcode) {
        const line1 = asStringValue(record.formData['Site Address Line 1']).trim()
          || asStringValue(record.formData['Correspondence Address Line 1']).trim()
          || lookupAddresses(postcode)[0]?.line1
          || ''
        const city = lookupAddresses(postcode)[0]?.city ?? ''
        const resolved = await resolveAddressData(postcode)
        const council = asStringValue(record.formData['Council']).trim()
          || asStringValue(record.formData['Correspondence Council']).trim()
          || resolved.council
        const { project: withAddress } = updateProject(draftId, {
          address: {
            postcode,
            line1,
            city,
            council,
            latitude: resolved.coordinates?.latitude,
            longitude: resolved.coordinates?.longitude,
            dataSource: resolved.dataSource,
            dataNote: resolved.dataNote,
          },
          constraints: resolved.constraints,
        })
        if (withAddress) current = withAddress
      }
    }

    const { project: submittedProject } = markProjectSubmitted(draftId)
    current = submittedProject ?? current
    setProject(current)
    setRecord(ensureEligibility(draftId))
    setIsSubmitting(false)

    // Same next step as the rest of the funnel: free snapshot, with the
    // paid-report / consultant / managed-service / self-serve choice —
    // see /dashboard/new/[draftId]/snapshot. Only possible once we have
    // an address + constraint check on the project (above); if no
    // postcode was ever captured, fall back to the plain confirmation.
    if (current.address && current.constraints) {
      router.push(`/dashboard/new/${draftId}/snapshot`)
    } else {
      show('Eligibility check submitted.', 'success')
    }
  }

  const handleDownloadReceipt = async () => {
    setIsDownloadingReceipt(true)
    try {
      await downloadPdfDocument(
        `eligibility-receipt-${draftId}.pdf`,
        buildEligibilityReceiptPdf({ record, projectTitle: project.title })
      )
    } finally {
      setIsDownloadingReceipt(false)
    }
  }

  return (
    <AgentZProvider projectId={draftId}>
      <div className="min-h-screen bg-[#0A0E1A] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-[880px]">
        <Link
          href="/dashboard/reports"
          className="mb-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-[#5A6A8A] hover:text-[#A8B8D8] transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to My Reports
        </Link>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#00D4FF] mb-1.5">
              Eligibility check
            </p>
            <h1 className="font-display text-[24px] sm:text-[28px] font-normal text-[#E8F0FF] tracking-tight">
              {project.title}
            </h1>
            {record.featureTitle && (
              <p className="mt-1 text-[12.5px] text-[#5A6A8A]">
                Tailored to: <span className="text-[#A8B8D8] font-medium">{record.featureTitle}</span> — only the relevant questions are shown below.
              </p>
            )}
          </div>

          {!alreadyComplete && saveState !== 'idle' && (
            <span className="shrink-0 mt-1 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#5A6A8A]">
              {saveState === 'saving' ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                  Saved
                </>
              )}
            </span>
          )}
        </div>

        {/* ── Stepper ─────────────────────────────────────────────── */}
        <div className="mb-7 flex items-center gap-1.5 overflow-x-auto pb-1">
          {ELIGIBILITY_STEPS.map((s, i) => {
            const answered = alreadyComplete || !!record.answeredSteps?.includes(i)
            const visitedEmpty = !answered && i < stepIndex
            const active = i === stepIndex && !alreadyComplete
            return (
              <button
                key={s.id}
                onClick={() => goToStep(i)}
                title={visitedEmpty ? 'Visited — no answers entered yet' : undefined}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors',
                  active
                    ? 'border-[#135BEC] bg-[#135BEC]/10 text-[#00D4FF]'
                    : answered
                      ? 'border-emerald-400/25 bg-emerald-500/[0.06] text-emerald-300'
                      : visitedEmpty
                        ? 'border-amber-400/25 bg-amber-500/[0.05] text-amber-300'
                        : 'border-white/[0.10] text-[#5A6A8A] hover:text-[#A8B8D8]'
                )}
              >
                {answered ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : visitedEmpty ? (
                  <Circle className="h-3 w-3" />
                ) : (
                  <span>{i + 1}</span>
                )}
                {s.title}
              </button>
            )
          })}
        </div>

        {alreadyComplete ? (
          <div className="rounded-[14px] border border-emerald-400/25 bg-emerald-500/[0.06] px-6 py-14 flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 mb-4">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <p className="text-[15px] font-semibold text-[#E8F0FF] mb-1.5">Eligibility check submitted</p>
            {record.submissionRef && (
              <p className="text-[12px] text-[#5A6A8A] mb-1">
                Reference: <span className="font-mono text-[#A8B8D8]">{record.submissionRef}</span>
              </p>
            )}
            <p className="text-[13px] text-[#5A6A8A] max-w-[380px] mb-1">
              Submitted {new Date(record.completedAt!).toLocaleString()}. We'll be in touch about next steps for {project.title}.
            </p>
            {session?.email && (
              <p className="mb-6 flex items-center gap-1.5 text-[11.5px] text-[#5A6A8A]">
                <Mail className="h-3 w-3" />
                Confirmation sent to {session.email}
                <span className="text-[#5A6A8A]/70">(preview — no email actually sent yet)</span>
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={handleDownloadReceipt}
                disabled={isDownloadingReceipt}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] border border-white/[0.12] text-[#A8B8D8] text-[13px] font-semibold hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors disabled:opacity-60"
              >
                <Download className="h-3.5 w-3.5" />
                {isDownloadingReceipt ? 'Preparing…' : 'Download receipt (PDF)'}
              </button>
              <button
                onClick={() => {
                  if (project.purchase) router.push(`/dashboard/new/${draftId}/report`)
                  else if (project.address && project.constraints) router.push(`/dashboard/new/${draftId}/snapshot`)
                  else router.push('/dashboard/reports')
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] transition-colors"
              >
                {project.purchase
                  ? 'View your report →'
                  : project.address && project.constraints
                    ? 'Continue to your report →'
                    : 'Back to reports'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-6 sm:p-7">
              <h2 className="text-[16px] font-semibold text-[#E8F0FF] mb-1">{step.title}</h2>
              <p className="text-[12.5px] text-[#5A6A8A] mb-6">{step.description}</p>

              {validationErrors.length > 0 && (
                <div className="mb-6 flex items-start gap-2.5 rounded-[10px] border border-red-400/25 bg-red-500/[0.06] px-3.5 py-3">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-300" />
                  <p className="text-[12.5px] text-[#E8F0FF]">
                    <span className="font-semibold">Please complete before continuing:</span> {validationErrors.join(', ')}
                  </p>
                </div>
              )}

              <EligibilityFormProvider savedFormData={record.formData} updateSection={updateSection}>
                <step.Component
                  savedFormData={record.formData}
                  updateSection={updateSection}
                  asStringValue={asStringValue}
                  components={eligibilityComponents}
                  isSectionVisible={isSectionVisible}
                />
              </EligibilityFormProvider>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={() => goToStep(Math.max(0, stepIndex - 1))}
                disabled={stepIndex === 0}
                className="px-4 py-2.5 rounded-[10px] text-[13px] font-semibold text-[#A8B8D8] border border-white/[0.12] hover:bg-white/[0.05] hover:text-[#E8F0FF] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Back
              </button>

              {isLastStep ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-[10px] font-semibold text-[13.5px] bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)] transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? 'Submitting…' : 'Submit application'}
                </button>
              ) : (
                <button
                  onClick={handleContinue}
                  className="px-6 py-2.5 rounded-[10px] font-semibold text-[13.5px] bg-[#135BEC] text-white hover:bg-[#2A6BF0] shadow-[0_0_16px_rgba(19,91,236,0.3)] transition-colors"
                >
                  Continue →
                </button>
              )}
            </div>
          </>
        )}
      </div>
      </div>
      <AgentZWidget />
    </AgentZProvider>
  )
}