import { getSupabaseAdmin } from './supabaseAdmin'
import { ApiError } from './apiError'
import { decryptEmail } from './emailCrypto'
import { getQuestionRowIdsForTier } from './questionBankTierIndex'

export type ProjectStatus = 'draft' | 'submitted'

export interface QuestionAnswer {
  rowId: string
  value: string | string[] | null
  flaggedForUpsell?: boolean
}

export interface ProjectAddress {
  postcode: string
  line1:    string
  city:     string
  council:  string
}

export interface PurchaseItem { id: string; label: string; price: number }
export interface ProjectPurchase { items: PurchaseItem[]; total: number; paidAt: string }
export interface ConstraintResult { label: string; status: 'warning' | 'clear' }
export interface ConsultantBookingSnapshot { date: string; time: string; notes?: string; bookedAt: string }

export interface Project {
  id:                 string
  userId:             string
  actorId:            string
  tier:               string
  title:              string
  status:             ProjectStatus
  answeredCount:      number
  totalCount:         number
  answers:            Record<string, QuestionAnswer>
  createdAt:          string
  updatedAt:          string
  submittedAt?:       string
  address?:           ProjectAddress
  constraints?:       ConstraintResult[]
  purchase?:          ProjectPurchase
  consultantBooking?: ConsultantBookingSnapshot
  ownerEmail?:        string
  ownerName?:         string
  serviceId?:         string
  featureTitle?:      string
}

export interface IntakeUpsertInput {
  id:      string
  actorId: string
  tier:    string
  answers: Record<string, QuestionAnswer>
}

export interface ProjectPatchInput {
  address?:           ProjectAddress
  constraints?:       ConstraintResult[]
  purchase?:          ProjectPurchase
  consultantBooking?: ConsultantBookingSnapshot
  serviceId?:         string
  featureTitle?:      string
  status?:            'submitted'
}

interface DbProject {
  id: string; user_id: string; actor_id: string; tier: string; title: string; status: string
  answered_count: number; total_count: number; answers: unknown
  address: unknown; constraints: unknown; purchase: unknown; consultant_booking: unknown
  service_id: string | null; feature_title: string | null
  owner_email: string | null; owner_name: string | null
  created_at: string; updated_at: string; submitted_at: string | null
}

function countAnswered(answers: Record<string, QuestionAnswer>): number {
  return Object.values(answers).filter(a => {
    if (a.value === null || a.value === '') return false
    if (Array.isArray(a.value) && a.value.length === 0) return false
    return true
  }).length
}

/** First non-empty text answer becomes the project title, same heuristic as the frontend's deriveTitle(). */
function deriveTitle(tier: string, answers: Record<string, QuestionAnswer>): string {
  const rowIds = getQuestionRowIdsForTier(tier)
  for (const rowId of rowIds) {
    const a = answers[rowId]
    if (a && typeof a.value === 'string' && a.value.trim()) return a.value.trim().slice(0, 60)
  }
  return 'Untitled application'
}

function toApiProject(row: DbProject): Project {
  return {
    id: row.id,
    userId: row.user_id,
    actorId: row.actor_id,
    tier: row.tier,
    title: row.title,
    status: row.status as ProjectStatus,
    answeredCount: row.answered_count,
    totalCount: row.total_count,
    answers: (row.answers ?? {}) as Record<string, QuestionAnswer>,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    submittedAt: row.submitted_at ?? undefined,
    address: (row.address as ProjectAddress) ?? undefined,
    constraints: (row.constraints as ConstraintResult[]) ?? undefined,
    purchase: (row.purchase as ProjectPurchase) ?? undefined,
    consultantBooking: (row.consultant_booking as ConsultantBookingSnapshot) ?? undefined,
    ownerEmail: row.owner_email ? safeDecrypt(row.owner_email) : undefined,
    ownerName: row.owner_name ?? undefined,
    serviceId: row.service_id ?? undefined,
    featureTitle: row.feature_title ?? undefined,
  }
}

function safeDecrypt(encrypted: string): string {
  try { return decryptEmail(encrypted) } catch { return '(unable to decrypt)' }
}

/**
 * Shared by both the customer's own save + agentx's on-behalf-of save
 * — `userId` is just "who this project belongs to," decided by the
 * caller (the route layer): a customer route passes their own auth.sub,
 * an agentx route passes whichever user the agent selected.
 */
async function upsert(userId: string, input: IntakeUpsertInput, status: ProjectStatus): Promise<Project> {
  const supabase = getSupabaseAdmin()

  const { data: user, error: userError } = await supabase.from('users').select('id, email, name').eq('id', userId).maybeSingle()
  if (userError) throw new ApiError(500, 'Failed to look up account', 'user_lookup_failed')
  if (!user) throw ApiError.notFound('User not found')

  const { data: existing, error: existingError } = await supabase.from('projects').select('id, user_id, submitted_at').eq('id', input.id).maybeSingle()
  if (existingError) throw new ApiError(500, 'Failed to look up project', 'project_lookup_failed')
  if (existing && existing.user_id !== userId) throw ApiError.forbidden('This project belongs to a different account')

  const now = new Date().toISOString()
  const row = {
    id: input.id,
    user_id: userId,
    actor_id: input.actorId,
    tier: input.tier,
    title: deriveTitle(input.tier, input.answers),
    status,
    answered_count: countAnswered(input.answers),
    total_count: getQuestionRowIdsForTier(input.tier).length,
    answers: input.answers,
    owner_email: user.email, // already encrypted — copied verbatim, not re-encrypted
    owner_name: user.name,
    ...(status === 'submitted' ? { submitted_at: existing?.submitted_at ?? now } : {}),
  }

  const { data, error } = await supabase.from('projects').upsert(row, { onConflict: 'id' }).select('*').single()
  if (error || !data) throw new ApiError(500, 'Failed to save project', 'project_save_failed')
  return toApiProject(data as DbProject)
}

/** Autosave — status stays/becomes 'draft'. */
export function saveDraft(userId: string, input: IntakeUpsertInput): Promise<Project> {
  return upsert(userId, input, 'draft')
}

/** Marks status 'submitted' and stamps submittedAt (first time only). */
export function submitIntake(userId: string, input: IntakeUpsertInput): Promise<Project> {
  return upsert(userId, input, 'submitted')
}

export async function listProjectsForUser(userId: string): Promise<Project[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false })
  if (error) throw new ApiError(500, 'Failed to load projects', 'projects_list_failed')
  return (data as DbProject[]).map(toApiProject)
}

/** No ownership check here by design — see the file header. Callers enforce their own authorization rules. */
export async function getProjectById(id: string): Promise<Project> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
  if (error) throw new ApiError(500, 'Failed to load project', 'project_lookup_failed')
  if (!data) throw ApiError.notFound('Project not found')
  return toApiProject(data as DbProject)
}

export async function patchProject(id: string, patch: ProjectPatchInput): Promise<Project> {
  const supabase = getSupabaseAdmin()

  const { data: existing, error: existingError } = await supabase.from('projects').select('status, submitted_at').eq('id', id).maybeSingle()
  if (existingError) throw new ApiError(500, 'Failed to look up project', 'project_lookup_failed')
  if (!existing) throw ApiError.notFound('Project not found')

  const { status, consultantBooking, ...rest } = patch
  const dbPatch: Record<string, unknown> = {
    ...(rest.address !== undefined ? { address: rest.address } : {}),
    ...(rest.constraints !== undefined ? { constraints: rest.constraints } : {}),
    ...(rest.purchase !== undefined ? { purchase: rest.purchase } : {}),
    ...(rest.serviceId !== undefined ? { service_id: rest.serviceId } : {}),
    ...(rest.featureTitle !== undefined ? { feature_title: rest.featureTitle } : {}),
    ...(consultantBooking !== undefined ? { consultant_booking: consultantBooking } : {}),
  }
  if (status === 'submitted' && existing.status !== 'submitted') {
    dbPatch.status = 'submitted'
    dbPatch.submitted_at = existing.submitted_at ?? new Date().toISOString()
  }

  const { data, error } = await supabase.from('projects').update(dbPatch).eq('id', id).select('*').single()
  if (error || !data) throw new ApiError(500, 'Failed to update project', 'project_update_failed')
  return toApiProject(data as DbProject)
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new ApiError(500, 'Failed to delete project', 'project_delete_failed')
}
