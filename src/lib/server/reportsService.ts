import { getSupabaseAdmin } from './supabaseAdmin'
import { ApiError } from './apiError'
import { encryptEmail, decryptEmail } from './emailCrypto'

/**
 * reportsService.ts
 * ───────────────────
 * Backend counterpart to src/lib/reportStorage.ts's localStorage
 * store — this is the piece that was missing (see the note on the
 * `reports` table in cart_payments_schema.sql). Reports generate for
 * free, no login required, so most of this uses optional auth: an
 * anonymous report is inserted with user_id null, then claimed (see
 * claimReports) once the person signs up/logs in.
 */

export interface ReportRecord {
  id: string
  tier: string
  answers: unknown
  content: unknown
  createdAt: string
  ownerEmail?: string
  ownerName?: string
  unlockedAt?: string
}

interface DbReport {
  id: string
  user_id: string | null
  tier: string
  answers: unknown
  content: unknown
  owner_email: string | null
  owner_name: string | null
  unlocked_at: string | null
  created_at: string
}

function toRecord(row: DbReport): ReportRecord {
  return {
    id: row.id,
    tier: row.tier,
    answers: row.answers,
    content: row.content,
    createdAt: row.created_at,
    ownerEmail: row.owner_email ? decryptEmail(row.owner_email) : undefined,
    ownerName: row.owner_name ?? undefined,
    unlockedAt: row.unlocked_at ?? undefined,
  }
}

/** JWT payloads only carry email/sub, not name — look it up for the owner-name snapshot. */
export async function getUserName(userId: string): Promise<string | undefined> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase.from('users').select('name').eq('id', userId).maybeSingle()
  return data?.name ?? undefined
}

export async function createReport(input: {
  id: string
  tier: string
  answers?: unknown
  content?: unknown
  userId?: string | null
  ownerEmail?: string
  ownerName?: string
}): Promise<ReportRecord> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('reports')
    .insert({
      id: input.id,
      user_id: input.userId ?? null,
      tier: input.tier,
      answers: input.answers,
      content: input.content,
      owner_email: input.ownerEmail ? encryptEmail(input.ownerEmail) : null,
      owner_name: input.ownerName ?? null,
    })
    .select('*')
    .single()

  if (error || !data) throw new ApiError(500, 'Failed to save that report', 'report_save_failed')
  return toRecord(data as DbReport)
}

/** Public lookup (no auth) — mirrors getPendingReport, needed for the anonymous view/download-gate flow. */
export async function getReport(id: string): Promise<ReportRecord | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('reports').select('*').eq('id', id).maybeSingle()
  if (error) throw new ApiError(500, 'Failed to load that report', 'report_lookup_failed')
  return data ? toRecord(data as DbReport) : null
}

export async function listMyReports(userId: string): Promise<ReportRecord[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new ApiError(500, 'Failed to load your reports', 'reports_list_failed')
  return (data as DbReport[]).map(toRecord)
}

/**
 * Attaches any of the given report ids that are still unclaimed
 * (user_id null) to the now-logged-in account — mirrors
 * claimPendingReports. Ids the caller doesn't actually own (already
 * claimed by someone else) are silently skipped rather than erroring,
 * same as the client-only version's behaviour.
 */
export async function claimReports(
  userId: string,
  ownerEmail: string,
  ownerName: string,
  ids: string[]
): Promise<ReportRecord[]> {
  if (ids.length === 0) return []
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('reports')
    .update({ user_id: userId, owner_email: encryptEmail(ownerEmail), owner_name: ownerName })
    .in('id', ids)
    .is('user_id', null)
    .select('*')

  if (error) throw new ApiError(500, 'Failed to claim your reports', 'report_claim_failed')
  return (data as DbReport[]).map(toRecord)
}

/** Marks a report unlocked after the (mock) checkout succeeds — see checkout/page.tsx's markReportUnlocked. */
export async function unlockReport(id: string): Promise<ReportRecord> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('reports')
    .update({ unlocked_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) throw ApiError.notFound('Report not found')
  return toRecord(data as DbReport)
}
