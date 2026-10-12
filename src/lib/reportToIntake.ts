// // import { createDraftId, saveDraft, updateProject } from '@/lib/projects'
// // import { getWorkspaceConfig } from '@/types/workspace'
// // import { getPendingReport } from '@/lib/reportStorage'
// // import { lookupAddresses, checkConstraints, councilFor } from '@/lib/constraints'
// // import type { QuestionAnswer } from '@/types/questions'
// // import type { ActorId } from '@/types'

// // /**
// //  * reportToIntake.ts
// //  * ────────────────────
// //  * The bridge between the two funnels:
// //  *
// //  *   Direct funnel  → service/plan card click → login → /dashboard/new/intent
// //  *                     → blank eligibility-check intake form.
// //  *   Chat funnel    → free RPT-00x report in chat → register to download
// //  *                     → login → /dashboard/new/intent?report=<id> → THIS
// //  *                     runs, turning what they already told the chat into
// //  *                     a prefilled eligibility-check draft, so registering
// //  *                     never means starting over.
// //  *
// //  * Only maps the fields that have a direct QUESTION_BANK counterpart —
// //  * anything chat-specific with no intake equivalent (timeline, budget,
// //  * project scale) just stays on the claimed report itself, which is
// //  * still visible from the dashboard's reports list.
// //  */

// // const PROPERTY_TYPE_ACTOR: Partial<Record<string, ActorId>> = {
// //   commercial: 'business',
// //   land: 'developer',
// // }

// // function toAnswer(rowId: string, value: string): QuestionAnswer {
// //   return { rowId, value, flaggedForUpsell: value === 'unsure' }
// // }

// // /**
// //  * Claims the pending report and creates a new draft project prefilled
// //  * from it. Returns null if the report can't be found (expired, wrong
// //  * browser, already claimed) — callers should fall back to the normal
// //  * blank intent flow in that case.
// //  */
// // export function claimReportIntoDraft(
// //   reportId: string,
// //   opts: { forCheckout?: boolean } = {}
// // ): { draftId: string; actorId: ActorId } | null {
// //   const report = getPendingReport(reportId)
// //   if (!report) return null

// //   const { answers } = report
// //   const actorId = PROPERTY_TYPE_ACTOR[answers.propertyType ?? ''] ?? 'homeowner'
// //   const tier = getWorkspaceConfig(actorId).tier

// //   const intakeAnswers: Record<string, QuestionAnswer> = {}

// //   if (answers.propertyType) {
// //     intakeAnswers['003'] = toAnswer('003', answers.postcode ? `${answers.propertyType} — ${answers.postcode}` : answers.propertyType)
// //   }
// //   if (answers.worksDescription) {
// //     intakeAnswers['006'] = toAnswer('006', answers.worksDescription)
// //   }
// //   if (answers.ownership) {
// //     intakeAnswers['004'] = toAnswer('004', answers.ownership)
// //   }
// //   if (answers.heritageAwareness) {
// //     intakeAnswers['005'] = toAnswer('005', answers.heritageAwareness)
// //   }
// //   if (answers.agentActing) {
// //     intakeAnswers['002'] = toAnswer('002', answers.agentActing)
// //   }
// //   if (answers.worksPurpose) {
// //     intakeAnswers['007'] = toAnswer('007', answers.worksPurpose)
// //   }
// //   if (answers.materials) {
// //     intakeAnswers['008'] = toAnswer('008', answers.materials)
// //   }
// //   if (answers.access) {
// //     intakeAnswers['010'] = toAnswer('010', answers.access)
// //   }

// //   const draftId = createDraftId()
// //   saveDraft({ id: draftId, actorId, tier, answers: intakeAnswers })

// //   // Checkout requires address + constraints already saved on the
// //   // project, same as the normal dashboard wizard's address step sets.
// //   // Best-guess the exact address from the postcode chat already
// //   // collected, rather than making them re-enter it before paying.
// //   if (opts.forCheckout && answers.postcode) {
// //     const guess = lookupAddresses(answers.postcode)[0]
// //     updateProject(draftId, {
// //       address: {
// //         postcode: answers.postcode,
// //         line1: guess?.line1 ?? '',
// //         city: guess?.city ?? '',
// //         council: councilFor(answers.postcode),
// //       },
// //       constraints: checkConstraints(answers.postcode),
// //     })
// //   }

// //   return { draftId, actorId }
// // }

// import { createDraftId, saveDraft, submitProject, updateProject } from '@/lib/projects'
// import { getWorkspaceConfig } from '@/types/workspace'
// import { getPendingReport } from '@/lib/reportStorage'
// import { lookupAddresses, checkConstraints, councilFor } from '@/lib/constraints'
// import type { QuestionAnswer } from '@/types/questions'
// import type { ActorId } from '@/types'

// /**
//  * reportToIntake.ts
//  * ────────────────────
//  * The bridge between the two funnels:
//  *
//  *   Direct funnel  → service/plan card click → login → /dashboard/new/intent
//  *                     → blank eligibility-check intake form.
//  *   Chat funnel    → free RPT-00x report in chat → register to download
//  *                     → login → /dashboard/new/intent?report=<id> → THIS
//  *                     runs, turning what they already told the chat into
//  *                     a prefilled eligibility-check draft, so registering
//  *                     never means starting over.
//  *
//  * Only maps the fields that have a direct QUESTION_BANK counterpart —
//  * anything chat-specific with no intake equivalent (timeline, budget,
//  * project scale) just stays on the claimed report itself, which is
//  * still visible from the dashboard's reports list.
//  */

// const PROPERTY_TYPE_ACTOR: Partial<Record<string, ActorId>> = {
//   commercial: 'business',
//   land: 'developer',
// }

// function toAnswer(rowId: string, value: string): QuestionAnswer {
//   return { rowId, value, flaggedForUpsell: value === 'unsure' }
// }

// /**
//  * Claims the pending report and creates a new draft project prefilled
//  * from it. Returns null if the report can't be found (expired, wrong
//  * browser, already claimed) — callers should fall back to the normal
//  * blank intent flow in that case.
//  */
// export function claimReportIntoDraft(
//   reportId: string,
//   opts: { forCheckout?: boolean } = {}
// ): { draftId: string; actorId: ActorId } | null {
//   const report = getPendingReport(reportId)
//   if (!report) return null

//   const { answers } = report
//   const actorId = PROPERTY_TYPE_ACTOR[answers.propertyType ?? ''] ?? 'homeowner'
//   const tier = getWorkspaceConfig(actorId).tier

//   const intakeAnswers: Record<string, QuestionAnswer> = {}

//   if (answers.propertyType) {
//     intakeAnswers['003'] = toAnswer('003', answers.postcode ? `${answers.propertyType} — ${answers.postcode}` : answers.propertyType)
//   }
//   if (answers.worksDescription) {
//     intakeAnswers['006'] = toAnswer('006', answers.worksDescription)
//   }
//   if (answers.ownership) {
//     intakeAnswers['004'] = toAnswer('004', answers.ownership)
//   }
//   if (answers.heritageAwareness) {
//     intakeAnswers['005'] = toAnswer('005', answers.heritageAwareness)
//   }
//   if (answers.agentActing) {
//     intakeAnswers['002'] = toAnswer('002', answers.agentActing)
//   }
//   if (answers.worksPurpose) {
//     intakeAnswers['007'] = toAnswer('007', answers.worksPurpose)
//   }
//   if (answers.materials) {
//     intakeAnswers['008'] = toAnswer('008', answers.materials)
//   }
//   if (answers.access) {
//     intakeAnswers['010'] = toAnswer('010', answers.access)
//   }

//   const draftId = createDraftId()
//   // forCheckout skips the intake review page entirely (straight to
//   // /checkout below), so this is the only point that would ever mark
//   // the project submitted — without it, a paid-for report from the
//   // chat funnel stays status:'draft' forever and never appears in
//   // /dashboard/reports or the Recent Reports widget, even after
//   // payment succeeds. The non-checkout path still lands on the intake
//   // page, which submits it itself once the person reviews/confirms.
//   const persist = opts.forCheckout ? submitProject : saveDraft
//   persist({ id: draftId, actorId, tier, answers: intakeAnswers })

//   // Checkout requires address + constraints already saved on the
//   // project, same as the normal dashboard wizard's address step sets.
//   // Best-guess the exact address from the postcode chat already
//   // collected, rather than making them re-enter it before paying.
//   if (opts.forCheckout && answers.postcode) {
//     const guess = lookupAddresses(answers.postcode)[0]
//     updateProject(draftId, {
//       address: {
//         postcode: answers.postcode,
//         line1: guess?.line1 ?? '',
//         city: guess?.city ?? '',
//         council: councilFor(answers.postcode),
//       },
//       constraints: checkConstraints(answers.postcode),
//     })
//   }

//   return { draftId, actorId }
// }


// import { createDraftId, saveDraft, updateProject } from '@/lib/projects'
// import { getWorkspaceConfig } from '@/types/workspace'
// import { getPendingReport } from '@/lib/reportStorage'
// import { lookupAddresses, checkConstraints, councilFor } from '@/lib/constraints'
// import type { QuestionAnswer } from '@/types/questions'
// import type { ActorId } from '@/types'

// /**
//  * reportToIntake.ts
//  * ────────────────────
//  * The bridge between the two funnels:
//  *
//  *   Direct funnel  → service/plan card click → login → /dashboard/new/intent
//  *                     → blank eligibility-check intake form.
//  *   Chat funnel    → free RPT-00x report in chat → register to download
//  *                     → login → /dashboard/new/intent?report=<id> → THIS
//  *                     runs, turning what they already told the chat into
//  *                     a prefilled eligibility-check draft, so registering
//  *                     never means starting over.
//  *
//  * Only maps the fields that have a direct QUESTION_BANK counterpart —
//  * anything chat-specific with no intake equivalent (timeline, budget,
//  * project scale) just stays on the claimed report itself, which is
//  * still visible from the dashboard's reports list.
//  */

// const PROPERTY_TYPE_ACTOR: Partial<Record<string, ActorId>> = {
//   commercial: 'business',
//   land: 'developer',
// }

// function toAnswer(rowId: string, value: string): QuestionAnswer {
//   return { rowId, value, flaggedForUpsell: value === 'unsure' }
// }

// /**
//  * Claims the pending report and creates a new draft project prefilled
//  * from it. Returns null if the report can't be found (expired, wrong
//  * browser, already claimed) — callers should fall back to the normal
//  * blank intent flow in that case.
//  */
// export function claimReportIntoDraft(
//   reportId: string,
//   opts: { forCheckout?: boolean } = {}
// ): { draftId: string; actorId: ActorId } | null {
//   const report = getPendingReport(reportId)
//   if (!report) return null

//   const { answers } = report
//   const actorId = PROPERTY_TYPE_ACTOR[answers.propertyType ?? ''] ?? 'homeowner'
//   const tier = getWorkspaceConfig(actorId).tier

//   const intakeAnswers: Record<string, QuestionAnswer> = {}

//   if (answers.propertyType) {
//     intakeAnswers['003'] = toAnswer('003', answers.postcode ? `${answers.propertyType} — ${answers.postcode}` : answers.propertyType)
//   }
//   if (answers.worksDescription) {
//     intakeAnswers['006'] = toAnswer('006', answers.worksDescription)
//   }
//   if (answers.ownership) {
//     intakeAnswers['004'] = toAnswer('004', answers.ownership)
//   }
//   if (answers.heritageAwareness) {
//     intakeAnswers['005'] = toAnswer('005', answers.heritageAwareness)
//   }
//   if (answers.agentActing) {
//     intakeAnswers['002'] = toAnswer('002', answers.agentActing)
//   }
//   if (answers.worksPurpose) {
//     intakeAnswers['007'] = toAnswer('007', answers.worksPurpose)
//   }
//   if (answers.materials) {
//     intakeAnswers['008'] = toAnswer('008', answers.materials)
//   }
//   if (answers.access) {
//     intakeAnswers['010'] = toAnswer('010', answers.access)
//   }

//   const draftId = createDraftId()
//   saveDraft({ id: draftId, actorId, tier, answers: intakeAnswers })

//   // Checkout requires address + constraints already saved on the
//   // project, same as the normal dashboard wizard's address step sets.
//   // Best-guess the exact address from the postcode chat already
//   // collected, rather than making them re-enter it before paying.
//   if (opts.forCheckout && answers.postcode) {
//     const guess = lookupAddresses(answers.postcode)[0]
//     updateProject(draftId, {
//       address: {
//         postcode: answers.postcode,
//         line1: guess?.line1 ?? '',
//         city: guess?.city ?? '',
//         council: councilFor(answers.postcode),
//       },
//       constraints: checkConstraints(answers.postcode),
//     })
//   }

//   return { draftId, actorId }
// }

import { createDraftId, saveDraft, submitProject, updateProject } from '@/lib/projects'
import { getWorkspaceConfig } from '@/types/workspace'
import { getPendingReport } from '@/lib/reportStorage'
import { lookupAddresses } from '@/lib/constraints'
import { resolveAddressData } from '@/lib/liveAddressLookup'
import type { QuestionAnswer } from '@/types/questions'
import type { ActorId } from '@/types'

/**
 * reportToIntake.ts
 * ────────────────────
 * The bridge between the two funnels:
 *
 *   Direct funnel  → service/plan card click → login → /dashboard/new/intent
 *                     → blank eligibility-check intake form.
 *   Chat funnel    → free RPT-00x report in chat → register to download
 *                     → login → /dashboard/new/intent?report=<id> → THIS
 *                     runs, turning what they already told the chat into
 *                     a prefilled eligibility-check draft, so registering
 *                     never means starting over.
 *
 * Only maps the fields that have a direct QUESTION_BANK counterpart —
 * anything chat-specific with no intake equivalent (timeline, budget,
 * project scale) just stays on the claimed report itself, which is
 * still visible from the dashboard's reports list.
 */

const PROPERTY_TYPE_ACTOR: Partial<Record<string, ActorId>> = {
  commercial: 'business',
  land: 'developer',
}

function toAnswer(rowId: string, value: string): QuestionAnswer {
  return { rowId, value, flaggedForUpsell: value === 'unsure' }
}

/**
 * Claims the pending report and creates a new draft project prefilled
 * from it. Returns null if the report can't be found (expired, wrong
 * browser, already claimed) — callers should fall back to the normal
 * blank intent flow in that case.
 */
export async function claimReportIntoDraft(
  reportId: string,
  opts: { forCheckout?: boolean } = {}
): Promise<{ draftId: string; actorId: ActorId } | null> {
  const report = getPendingReport(reportId)
  if (!report) return null

  const { answers } = report
  const actorId = PROPERTY_TYPE_ACTOR[answers.propertyType ?? ''] ?? 'homeowner'
  const tier = getWorkspaceConfig(actorId).tier

  const intakeAnswers: Record<string, QuestionAnswer> = {}

  if (answers.propertyType) {
    intakeAnswers['003'] = toAnswer('003', answers.postcode ? `${answers.propertyType} — ${answers.postcode}` : answers.propertyType)
  }
  if (answers.worksDescription) {
    intakeAnswers['006'] = toAnswer('006', answers.worksDescription)
  }
  if (answers.ownership) {
    intakeAnswers['004'] = toAnswer('004', answers.ownership)
  }
  if (answers.heritageAwareness) {
    intakeAnswers['005'] = toAnswer('005', answers.heritageAwareness)
  }
  if (answers.agentActing) {
    intakeAnswers['002'] = toAnswer('002', answers.agentActing)
  }
  if (answers.worksPurpose) {
    intakeAnswers['007'] = toAnswer('007', answers.worksPurpose)
  }
  if (answers.materials) {
    intakeAnswers['008'] = toAnswer('008', answers.materials)
  }
  if (answers.access) {
    intakeAnswers['010'] = toAnswer('010', answers.access)
  }

  const draftId = createDraftId()
  // forCheckout skips the intake review page entirely (straight to
  // /checkout below), so this is the only point that would ever mark
  // the project submitted — without it, a paid-for report from the
  // chat funnel stays status:'draft' forever and never appears in
  // /dashboard/reports or the Recent Reports widget, even after
  // payment succeeds. The non-checkout path still lands on the intake
  // page, which submits it itself once the person reviews/confirms.
  const persist = opts.forCheckout ? submitProject : saveDraft
  persist({ id: draftId, actorId, tier, answers: intakeAnswers })

  // Checkout requires address + constraints already saved on the
  // project, same as the normal dashboard wizard's address step sets.
  // Best-guess the exact address from the postcode chat already
  // collected, rather than making them re-enter it before paying.
  if (opts.forCheckout && answers.postcode) {
    const guess = lookupAddresses(answers.postcode)[0]
    const resolved = await resolveAddressData(answers.postcode)
    updateProject(draftId, {
      address: {
        postcode: answers.postcode,
        line1: guess?.line1 ?? '',
        city: guess?.city ?? '',
        council: resolved.council,
        latitude: resolved.coordinates?.latitude,
        longitude: resolved.coordinates?.longitude,
        dataSource: resolved.dataSource,
        dataNote: resolved.dataNote,
      },
      constraints: resolved.constraints,
    })
  }

  return { draftId, actorId }
}