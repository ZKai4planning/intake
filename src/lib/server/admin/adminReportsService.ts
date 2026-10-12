import { getSupabaseAdmin } from '../supabaseAdmin'
import { ApiError } from '../apiError'
import { decryptEmail } from '../emailCrypto'
import { isPaidTier } from '@/lib/reportTiers'
import type { ReportTierId } from '@/types/reportTiers'

export interface AdminReportRow {
  id:         string
  userId:     string | null
  tier:       string
  ownerName:  string | null
  ownerEmail: string | null
  unlockedAt: string | null
  createdAt:  string
  /** Paid tier (RPT-002/003), generated, but never actually paid for — a stalled checkout worth following up on. */
  needsFollowUp: boolean
}

export interface AdminReportDetail extends AdminReportRow {
  answers: unknown
  content: unknown
}

interface DbReport {
  id: string; user_id: string | null; tier: string; owner_name: string | null; owner_email: string | null
  unlocked_at: string | null; created_at: string; answers: unknown; content: unknown
}

function safeDecryptEmail(encrypted: string | null): string | null {
  if (!encrypted) return null
  try {
    return decryptEmail(encrypted)
  } catch {
    return '(unable to decrypt)'
  }
}

function toAdminRow(row: DbReport): AdminReportRow {
  const paid = isPaidTier(row.tier as ReportTierId)
  return {
    id: row.id,
    userId: row.user_id,
    tier: row.tier,
    ownerName: row.owner_name,
    ownerEmail: safeDecryptEmail(row.owner_email),
    unlockedAt: row.unlocked_at,
    createdAt: row.created_at,
    needsFollowUp: paid && !row.unlocked_at,
  }
}

export interface ListReportsParams {
  tier?:   string
  userId?: string
  /** 'incomplete' — paid-tier reports generated but never unlocked (stalled checkout). */
  status?: 'incomplete'
  page?:  number
  limit?: number
}

export async function listReports(params: ListReportsParams): Promise<{ reports: AdminReportRow[]; total: number }> {
  const supabase = getSupabaseAdmin()
  const page = Math.max(params.page ?? 1, 1)
  // "incomplete" is filtered in-process (needs the tier→isPaidTier lookup, not a plain column) so pull a wider page for it.
  const limit = params.status === 'incomplete' ? 500 : Math.min(Math.max(params.limit ?? 25, 1), 100)
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('reports')
    .select('id, user_id, tier, owner_name, owner_email, unlocked_at, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)
  if (params.tier) query = query.eq('tier', params.tier)
  if (params.userId) query = query.eq('user_id', params.userId)
  if (params.status === 'incomplete') query = query.is('unlocked_at', null)

  const { data, error, count } = await query
  if (error) throw new ApiError(500, 'Failed to load reports', 'reports_list_failed')
  let reports = (data as DbReport[]).map(toAdminRow)
  if (params.status === 'incomplete') reports = reports.filter(r => r.needsFollowUp)
  return { reports, total: params.status === 'incomplete' ? reports.length : (count ?? 0) }
}

export async function getReport(id: string): Promise<AdminReportDetail> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('reports').select('*').eq('id', id).maybeSingle()
  if (error) throw new ApiError(500, 'Failed to load report', 'report_lookup_failed')
  if (!data) throw ApiError.notFound('Report not found')
  const row = data as DbReport
  return { ...toAdminRow(row), answers: row.answers, content: row.content }
}
