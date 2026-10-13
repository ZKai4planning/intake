import { createDraftId, saveDraft, updateProject } from '@/lib/projects'
import { getWorkspaceConfig } from '@/types/workspace'
import { resolveAddressData } from '@/lib/liveAddressLookup'
import type { QuestionAnswer } from '@/types/questions'
import type { ActorId } from '@/types'
import { getRole } from './config'
import { readIntake, writeIntake } from './storage'
import { summariseProject, type CategoryId } from './projectTypes'

/**
 * handoff.ts
 * ────────────
 * Bridges the pre-login intake chat into the existing dashboard flow, the
 * same way lib/reportToIntake.ts does for the report chat:
 *
 *   /start (intake) → email OTP → /dashboard/new/intent?intake=1 → THIS
 *   → a prefilled draft project → /dashboard/new/<draftId>
 *
 * Only fields with a direct counterpart in the intake question bank are
 * mapped (see lib/questions/questionBank.ts rows 003, 006, 007); the rest
 * of what the person told us stays on the intake record.
 */

/** Intake category → question-bank "Purpose" (row 007) option value. */
const PURPOSE: Record<CategoryId, string> = {
  extend: 'extension',
  convert: 'loft',
  build: 'newbuild',
  use: 'changeofuse',
  exterior: 'other',
  access: 'other',
  trees: 'other',
  existing: 'other',
  unsure: 'unsure',
}

const toAnswer = (rowId: string, value: string): QuestionAnswer => ({ rowId, value, flaggedForUpsell: value === 'unsure' })

export async function claimIntakeIntoDraft(): Promise<{ draftId: string; actorId: ActorId } | null> {
  const intake = readIntake()
  const categoryId = intake?.planning.categoryId
  if (!intake || !categoryId) return null

  const actorId = getRole(intake.details.role).actorId

  // Already claimed (e.g. the person refreshed this page) — reuse that draft.
  if (intake.claimedDraftId) return { draftId: intake.claimedDraftId, actorId }

  const tier = getWorkspaceConfig(actorId).tier
  const { property, planning, more } = intake
  const summary = summariseProject(categoryId, planning.describe, planning.routeKnown, more.subtypeId, more.answers)

  const description = [
    summary.subtype ? `${summary.category} — ${summary.subtype}` : summary.category,
    ...summary.lines.map(l => `${l.label}: ${l.value}`),
    ...(more.fit && (more.fit.status === 'collision' || more.fit.status === 'tight') ? [`Site check: ${more.fit.message}`] : []),
  ].join('. ')

  const answers: Record<string, QuestionAnswer> = {
    '006': toAnswer('006', description),
    '007': toAnswer('007', PURPOSE[categoryId]),
  }
  if (property) {
    const type = /flat|maisonette/i.test(property.propertyType ?? '') ? 'flat' : /bungalow/i.test(property.propertyType ?? '') ? 'bungalow' : 'house'
    answers['003'] = toAnswer('003', `${type} — ${property.fullAddress}`)
  }

  const draftId = createDraftId()
  saveDraft({ id: draftId, actorId, tier, answers })

  if (property) {
    // Live council + constraints for the postcode, same call the address step makes.
    const resolved = await resolveAddressData(property.postcode)
    updateProject(draftId, {
      address: {
        postcode: property.postcode,
        line1: property.line1,
        city: property.town,
        council: property.council ?? resolved.council,
        latitude: property.lat ?? resolved.coordinates?.latitude,
        longitude: property.lng ?? resolved.coordinates?.longitude,
        dataSource: resolved.dataSource,
        dataNote: resolved.dataNote,
      },
      constraints: resolved.constraints,
    })
  }

  writeIntake({ ...intake, claimedDraftId: draftId, savedAt: new Date().toISOString() })
  return { draftId, actorId }
}
