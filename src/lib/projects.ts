
import { getQuestionsForTier } from '@/lib/questions/questionBank'
import type { QuestionAnswer } from '@/types/questions'
import type { WorkspaceTier } from '@/types/workspace'
import type { ActorId } from '@/types'
import type { ConstraintResult } from '@/lib/constraints'
import { readAuthSession } from '@/lib/authSession'
import { listProjectsRemote, upsertProjectRemote, deleteProjectRemote } from '@/lib/api'

/**
 * projects.ts
 * ────────────
 * Client-side store for a user's applications ("projects") — the things
 * the dashboard's "Active projects" widget shows as either a Draft
 * (saved but not submitted) or a Created project (submitted), and the
 * source for the /dashboard/reports page.
 *
 * Persistence: localStorage as an instant-read cache (not sessionStorage
 * — deliberately, so a draft survives a closed tab or a second tab open
 * on the same browser), backed by a real /api/projects (see
 * projectsService.ts). Every write here also fires a best-effort sync
 * to the server so admin/DB reflect reality; every read lazily pulls
 * the server's copy in the background and merges it in, so cache misses
 * (a second device, a cleared browser) self-heal without callers having
 * to change from the synchronous reads they already do. Server writes
 * are fire-and-forget on purpose — this file's public functions stay
 * synchronous so nothing that calls them today has to become async.
 */

let hydrated = false

/** Pulls the server's copy in the background and merges it into the local cache (server wins on id conflicts). Safe to call repeatedly — only actually hits the network once per page load. */
function ensureHydrated(): void {
  if (hydrated) return
  if (!readAuthSession()) return // not logged in yet — nothing to pull
  hydrated = true

  listProjectsRemote().then(({ data }) => {
    if (!data) return
    const local = readAll()
    const byId = new Map(local.map(p => [p.id, p]))
    for (const remote of data.projects) {
      byId.set(remote.id as string, remote as unknown as Project)
    }
    writeAll(Array.from(byId.values()))
  }).catch(() => {
    // offline/network error — local cache still works, just try again next load
  })
}

/** Fire-and-forget: keeps the server copy in sync with a local write. Errors are swallowed here — the local write already succeeded and is what the UI reflects; a failed sync just means it won't show up in the DB/admin panel until the next successful one. */
function syncUpsert(project: Project): void {
  if (!readAuthSession()) return
  void upsertProjectRemote(project as unknown as Record<string, unknown>)
}

function syncDelete(id: string): void {
  if (!readAuthSession()) return
  void deleteProjectRemote(id)
}

export type ProjectStatus = 'draft' | 'submitted'

export interface ProjectAddress {
  postcode: string
  line1:    string
  city:     string
  council:  string
  /** postcodes.io coordinates for this postcode — only set when dataSource === 'live'. Used to render the real map page in the PDF (see lib/staticMap.ts). */
  latitude?: number
  longitude?: number
  /**
   * Where council/coordinates + the constraints on this project came
   * from. 'live' = a real-time postcodes.io + planning.data.gov.uk
   * lookup for this exact postcode. 'estimate' = the live lookup
   * couldn't complete (bad postcode, or the services were unreachable)
   * and this fell back to a general, non-address-specific estimate.
   */
  dataSource?: 'live' | 'estimate'
  dataNote?: string
}


export interface PurchaseItem {
  id:    string
  label: string
  price: number
}

/** Set once the checkout step's (mock) payment succeeds. */
export interface ProjectPurchase {
  items:  PurchaseItem[]
  total:  number
  paidAt: string
}

/** Set once a consultant call has been booked, from either the snapshot or the paid report. */
export interface ConsultantBooking {
  date:     string
  time:     string
  notes?:   string
  bookedAt: string
}

export interface Project {
  id: string
  actorId: ActorId
  tier: WorkspaceTier
  title: string
  status: ProjectStatus
  answeredCount: number
  totalCount: number
  /** Serializable snapshot of answers, used to resume a draft. File values are dropped. */
  answers: Record<string, QuestionAnswer>
  createdAt: string
  updatedAt: string
  /** Set when status is 'submitted' — used by the Reports page. */
  submittedAt?: string
  /** Set once the address step is completed. */
  address?: ProjectAddress
  /** Set once the (mock) planning constraint check has run for `address`. */
  constraints?: ConstraintResult[]
  /** Set once the paid eligibility report has been bought via /checkout. */
  purchase?: ProjectPurchase
  /** Set once a consultation has been booked via /consultant. */
  consultantBooking?: ConsultantBooking
  /**
   * Snapshot of who created this project, taken from the session at
   * save time. Used to re-verify ownership before a report download
   * is allowed — see /dashboard/reports and lib/authSession.ts.
   */
  ownerEmail?: string
  ownerName?: string
  /**
   * Which homepage service/feature this project was started from (see
   * ServiceExpandPanel + /dashboard/new/service). Backfilled by the
   * eligibility page the first time it's known, so re-entering from
   * anywhere else (report page, reports list) that doesn't carry these
   * as URL params can still resolve them from the project itself.
   */
  serviceId?: string
  featureTitle?: string
}

export const STORAGE_KEY = 'dashboard_projects'

function readAll(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Project[]) : []
  } catch {
    return []
  }
}

/** Returns false (instead of throwing) when the write fails — callers decide how to surface it. */
function writeAll(projects: Project[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    // Same-tab listeners (the 'storage' event only fires in OTHER tabs) —
    // dispatch a matching custom event so this tab's widgets can refresh too.
    window.dispatchEvent(new CustomEvent('projects:changed'))
    return true
  } catch {
    return false
  }
}

/** File objects aren't JSON-serializable — strip them before persisting. */
function sanitizeAnswers(answers: Record<string, QuestionAnswer>): Record<string, QuestionAnswer> {
  const clean: Record<string, QuestionAnswer> = {}
  for (const [rowId, answer] of Object.entries(answers)) {
    clean[rowId] = Array.isArray(answer.value) && answer.value.some(v => v instanceof File)
      ? { ...answer, value: [] }
      : answer
  }
  return clean
}

function countAnswered(answers: Record<string, QuestionAnswer>): number {
  return Object.values(answers).filter(a => {
    if (a.value === null || a.value === '') return false
    if (Array.isArray(a.value) && a.value.length === 0) return false
    return true
  }).length
}

function deriveTitle(tier: WorkspaceTier, answers: Record<string, QuestionAnswer>): string {
  const questions = getQuestionsForTier(tier)
  for (const q of questions) {
    const a = answers[q.rowId]
    if (a && typeof a.value === 'string' && a.value.trim()) {
      return a.value.trim().slice(0, 60)
    }
  }
  return 'Untitled application'
}

export function listProjects(): Project[] {
  ensureHydrated()
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getProject(id: string): Project | null {
  ensureHydrated()
  return readAll().find(p => p.id === id) ?? null
}

interface UpsertInput {
  /** Pass the existing project id to update it in place instead of creating a new one. */
  id: string
  actorId: ActorId
  tier: WorkspaceTier
  answers: Record<string, QuestionAnswer>
}

export interface UpsertResult {
  project: Project
  /** False when the write to storage failed (e.g. quota/private mode) — caller should warn the user. */
  persisted: boolean
}

function upsert({ id, actorId, tier, answers }: UpsertInput, status: ProjectStatus): UpsertResult {
  const all = readAll()
  const now = new Date().toISOString()
  const cleanAnswers = sanitizeAnswers(answers)
  const session = readAuthSession()

  const shared = {
    actorId,
    tier,
    title: deriveTitle(tier, answers),
    status,
    answeredCount: countAnswered(answers),
    totalCount: getQuestionsForTier(tier).length,
    answers: cleanAnswers,
    updatedAt: now,
    ...(session ? { ownerEmail: session.email, ownerName: session.name } : {}),
    ...(status === 'submitted' ? { submittedAt: now } : {}),
  }

  const existingIdx = all.findIndex(p => p.id === id)

  const project: Project = existingIdx >= 0
    ? { ...all[existingIdx], ...shared }
    : { id, createdAt: now, ...shared }

  const next = existingIdx >= 0
    ? all.map((p, i) => (i === existingIdx ? project : p))
    : [project, ...all]

  const persisted = writeAll(next)
  if (persisted) syncUpsert(project)
  return { project, persisted }
}

/** Saves the current answers as a draft (creates or updates the given id in place). */
export function saveDraft(input: UpsertInput): UpsertResult {
  return upsert(input, 'draft')
}

/** Marks the application as submitted/created (creates or updates the given id in place). */
export function submitProject(input: UpsertInput): UpsertResult {
  return upsert(input, 'submitted')
}

/** Client-side id generator for a brand-new draft, minted before the first save so the URL is stable. */
export function createDraftId(): string {
  return `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export interface UpdateResult {
  project: Project | null
  /** False when the write to storage failed, OR when no project with that id exists yet. */
  persisted: boolean
}

/** Patches address/constraints onto an existing project — used by the address step, which runs after submit. */
export function updateProject(
  id: string,
  patch: Partial<Pick<Project, 'address' | 'constraints' | 'purchase' | 'consultantBooking' | 'serviceId' | 'featureTitle'>>
): UpdateResult {
  const all = readAll()
  const idx = all.findIndex(p => p.id === id)
  if (idx < 0) return { project: null, persisted: false }

  const updated: Project = { ...all[idx], ...patch, updatedAt: new Date().toISOString() }
  const next = all.map((p, i) => (i === idx ? updated : p))
  const persisted = writeAll(next)
  if (persisted) syncUpsert(updated)
  return { project: updated, persisted }
}

export function deleteProject(id: string): boolean {
  const persisted = writeAll(readAll().filter(p => p.id !== id))
  if (persisted) syncDelete(id)
  return persisted
}

/**
 * Promotes an existing project straight to 'submitted', without requiring
 * the full intake payload (actorId/tier/answers) that submitProject needs.
 *
 * Needed because some projects are minted mid-flow with status 'draft' —
 * e.g. the eligibility page creates one via saveDraft() when someone
 * enters directly from a homepage service link (see EligibilityPage) —
 * and nothing else ever promotes them. Without this, such a project's
 * status stays 'draft' forever, even after its eligibility check is
 * completed, so it never appears in RecentReportsWidget (on /dashboard)
 * or the /dashboard/reports "Full applications" list — both filter on
 * status === 'submitted'.
 */
export function markProjectSubmitted(id: string): UpdateResult {
  const all = readAll()
  const idx = all.findIndex(p => p.id === id)
  if (idx < 0) return { project: null, persisted: false }
  if (all[idx].status === 'submitted') return { project: all[idx], persisted: true }

  const updated: Project = {
    ...all[idx],
    status: 'submitted',
    submittedAt: all[idx].submittedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const next = all.map((p, i) => (i === idx ? updated : p))
  const persisted = writeAll(next)
  if (persisted) syncUpsert(updated)
  return { project: updated, persisted }
}