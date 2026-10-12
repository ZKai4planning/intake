import type { EligibilityFormValues } from '@/components/eligibility/types'
import { readAuthSession } from './authSession'
import type { PdfDocumentInput } from './pdf'

/**
 * eligibility.ts
 * ────────────────
 * Persistence for the 5-step eligibility/application form, one record
 * per project (keyed by the project's draftId — see lib/projects.ts).
 * Same localStorage-JSON pattern as projects.ts and reportStorage.ts.
 *
 * `formData` is a flat label→value bag because that's what the ported
 * step-content components read/write (see components/eligibility) —
 * `updateSection('eligibility', value)` shallow-merges whatever it's
 * given (formData and/or other keys like `location`) into this record.
 *
 * API swap point: once there's a backend, this becomes a real
 * submission endpoint — the shape here (formData + step + completedAt)
 * is deliberately close to what a POST body would look like.
 */

export interface EligibilityRecord {
  projectId: string
  formData: EligibilityFormValues
  /** Free-form extra data some step files stash (e.g. a resolved postcode lookup). */
  location?: Record<string, unknown>
  /** Index into ELIGIBILITY_STEPS the person last had open. */
  currentStep: number
  /**
   * Step indexes with at least one real answer entered — distinct from
   * "navigated past" (see the wizard's stepper: an untouched step you
   * clicked through shouldn't get a false checkmark).
   */
  answeredSteps?: number[]
  ownerEmail?: string
  /**
   * Which homepage service/subservice this eligibility check was
   * started from (see lib/services.ts + lib/eligibilityRelevance.ts).
   * Drives which optional sections show — set once, on first entry,
   * and never overwritten after (so navigating back into the wizard
   * later doesn't reshuffle which questions are asked).
   */
  serviceId?: string
  featureTitle?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  /** Human-readable reference shown on the confirmation screen and baked into the receipt PDF — generated once, at submit time. */
  submissionRef?: string
}

const STORAGE_KEY = 'eligibility_records'

function readAll(): EligibilityRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as EligibilityRecord[]) : []
  } catch {
    return []
  }
}

function writeAll(records: EligibilityRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    window.dispatchEvent(new CustomEvent('eligibility:changed'))
  } catch {
    // ignore — same tradeoff as the other *Storage.ts mocks
  }
}

export function getEligibility(projectId: string): EligibilityRecord | null {
  return readAll().find(r => r.projectId === projectId) ?? null
}

/** Gets the record for a project, creating an empty one on first access. */
export function ensureEligibility(
  projectId: string,
  serviceContext?: { serviceId?: string; featureTitle?: string }
): EligibilityRecord {
  const existing = getEligibility(projectId)
  if (existing) return existing

  const now = new Date().toISOString()
  const session = readAuthSession()
  const created: EligibilityRecord = {
    projectId,
    formData: {},
    currentStep: 0,
    ownerEmail: session?.email,
    serviceId: serviceContext?.serviceId,
    featureTitle: serviceContext?.featureTitle,
    createdAt: now,
    updatedAt: now,
  }
  writeAll([...readAll(), created])
  return created
}

/**
 * Merges `patch` into the stored eligibility object — mirrors the
 * `updateSection('eligibility', value)` shallow-merge the step
 * content files call directly (formData is usually passed already
 * fully merged by the caller; other keys like `location` merge in
 * alongside it).
 */
export function patchEligibility(projectId: string, patch: Partial<Omit<EligibilityRecord, 'projectId' | 'createdAt'>>): EligibilityRecord {
  const all = readAll()
  const idx = all.findIndex(r => r.projectId === projectId)
  const now = new Date().toISOString()

  if (idx < 0) {
    const created: EligibilityRecord = {
      projectId,
      formData: {},
      currentStep: 0,
      createdAt: now,
      updatedAt: now,
      ...patch,
    }
    writeAll([...all, created])
    return created
  }

  const updated: EligibilityRecord = { ...all[idx], ...patch, updatedAt: now }
  const next = [...all]
  next[idx] = updated
  writeAll(next)
  return updated
}

export function markEligibilityComplete(projectId: string): EligibilityRecord {
  const ref = `ELG-${projectId.slice(-6).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`
  return patchEligibility(projectId, { completedAt: new Date().toISOString(), submissionRef: ref })
}

export function isEligibilityComplete(projectId: string): boolean {
  return !!getEligibility(projectId)?.completedAt
}

/** Keys not worth showing on the receipt — internal bookkeeping (Agent Z decision flags) or binary data (signature). */
function isDisplayableAnswer(key: string, value: unknown): boolean {
  if (key.includes('— Need help?')) return false
  if (!value) return false
  if (Array.isArray(value) && value.length === 0) return false
  return true
}

function displayAnswer(key: string, value: EligibilityFormValues[string]): string {
  if (key === 'Digital Signature') return '(signature captured)'
  if (Array.isArray(value)) return value.join(', ')
  return value ?? ''
}

/**
 * Builds a plain-language receipt of everything submitted — not the
 * eligibility report itself, just a record of what was sent, for the
 * applicant's own files. Reuses the same watermarked/protected PDF
 * pipeline as the reports (see lib/pdf.ts).
 */
export function buildEligibilityReceiptPdf(opts: {
  record: EligibilityRecord
  projectTitle: string
}): PdfDocumentInput {
  const { record, projectTitle } = opts
  const session = readAuthSession()
  const ref = record.submissionRef ?? 'ELG-UNKNOWN'
  const submittedAt = record.completedAt ? new Date(record.completedAt).toLocaleString() : ''

  const entries = Object.entries(record.formData).filter(([key, value]) => isDisplayableAnswer(key, value))

  return {
    title: 'Eligibility check — submission receipt',
    subtitle: `${projectTitle}${record.featureTitle ? ` · ${record.featureTitle}` : ''} · Ref: ${ref}`,
    note: `Submitted ${submittedAt}. This is a record of what was submitted, not the eligibility report itself.`,
    sections: [
      {
        heading: 'Submitted answers',
        bullets: entries.map(([key, value]) => `${key}: ${displayAnswer(key, value)}`),
      },
    ],
    footer: `AI4Planning — Eligibility submission receipt — Ref: ${ref}${session ? ` — ${session.email}` : ''}`,
    watermark: session
      ? `AI4PLANNING · ${session.name} · ${ref} · NOT FOR REDISTRIBUTION`
      : `AI4PLANNING · ${ref}`,
  }
}
