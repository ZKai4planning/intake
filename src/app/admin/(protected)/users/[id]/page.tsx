'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  getAdminUser, updateAdminUser, deleteAdminUser,
  listAdminReports, listAdminOrders,
  type AdminUserRow, type AdminReportRow, type AdminOrderRow,
} from '@/lib/adminApi'

const ROLES = ['consumer', 'b2b', 'consultant', 'admin'] as const

function ReportStatusBadge({ r }: { r: AdminReportRow }) {
  if (r.unlockedAt) return <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[rgba(52,211,153,0.12)] text-[#34D399]">unlocked</span>
  if (r.needsFollowUp) return <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[rgba(251,191,36,0.12)] text-[#FBBF24]">needs follow-up</span>
  return <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A8B8D8]">free tier</span>
}

function OrderStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    COMPLETED: 'bg-[rgba(52,211,153,0.12)] text-[#34D399]',
    PROCESSING: 'bg-[rgba(19,91,236,0.12)] text-[#135BEC]',
    PENDING: 'bg-[rgba(251,191,36,0.12)] text-[#FBBF24]',
    FAILED: 'bg-[rgba(255,107,107,0.12)] text-[#F87171]',
  }
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${colors[status] ?? 'bg-white/[0.06] text-[#A8B8D8]'}`}>{status}</span>
}

export default function AdminUserDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()

  const [user, setUser] = useState<AdminUserRow | null>(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState<string>('consumer')
  const [phone, setPhone] = useState('')

  const [reports, setReports] = useState<AdminReportRow[] | null>(null)
  const [orders, setOrders] = useState<AdminOrderRow[] | null>(null)

  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    getAdminUser(params.id).then(({ data, error: apiError }) => {
      if (apiError || !data) {
        setError(apiError ?? 'Failed to load user.')
        return
      }
      setUser(data.user)
      setName(data.user.name)
      setRole(data.user.role)
      setPhone(data.user.phone ?? '')
    })
    listAdminReports({ userId: params.id, limit: 50 }).then(({ data }) => setReports(data?.reports ?? []))
    listAdminOrders({ userId: params.id, limit: 50 }).then(({ data }) => setOrders(data?.orders ?? []))
  }, [params.id])

  async function handleSave() {
    setIsSaving(true)
    setError('')
    const { data, error: apiError } = await updateAdminUser(params.id, {
      name: name.trim(),
      role,
      phone: phone.trim() || undefined,
    })
    setIsSaving(false)

    if (apiError || !data) {
      setError(apiError ?? 'Failed to save changes.')
      return
    }
    setUser(data.user)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleDelete() {
    setIsDeleting(true)
    const { error: apiError } = await deleteAdminUser(params.id)
    setIsDeleting(false)

    if (apiError) {
      setError(apiError)
      return
    }
    router.push('/admin/users')
  }

  if (error && !user) {
    return <p className="text-[13px] text-[#F87171]">{error}</p>
  }

  if (!user) {
    return <p className="text-[13px] text-[#5A6A8A]">Loading…</p>
  }

  const needsFollowUpReports = (reports ?? []).filter(r => r.needsFollowUp)
  const needsFollowUpOrders = (orders ?? []).filter(o => o.needsFollowUp)

  return (
    <div className="max-w-[680px]">
      <Link href="/admin/users" className="text-[13px] text-[#5A6A8A] hover:text-[#E8F0FF] transition-colors">← Back to users</Link>

      <h1 className="font-display text-[22px] text-[#E8F0FF] mt-3 mb-1">{user.name || '(no name)'}</h1>
      <p className="text-[13.5px] text-[#5A6A8A] mb-6">{user.email}</p>

      {(needsFollowUpReports.length > 0 || needsFollowUpOrders.length > 0) && (
        <div className="rounded-[14px] border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.05)] p-4 mb-6">
          <p className="text-[13px] font-semibold text-[#FBBF24]">
            Needs follow-up: {needsFollowUpReports.length} unpaid report{needsFollowUpReports.length === 1 ? '' : 's'}, {needsFollowUpOrders.length} stalled checkout{needsFollowUpOrders.length === 1 ? '' : 's'}
          </p>
        </div>
      )}

      <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 space-y-4">
        <div>
          <label className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-[10px] border border-white/[0.08] bg-[#0A0E1A] px-3.5 py-2.5 text-[14px] text-[#E8F0FF] focus:outline-none focus:border-[#135BEC] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full rounded-[10px] border border-white/[0.08] bg-[#0A0E1A] px-3.5 py-2.5 text-[14px] text-[#E8F0FF] focus:outline-none focus:border-[#135BEC] transition-colors"
          >
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[12.5px] font-medium text-[#A8B8D8] mb-1.5">Phone</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Not set"
            className="w-full rounded-[10px] border border-white/[0.08] bg-[#0A0E1A] px-3.5 py-2.5 text-[14px] text-[#E8F0FF] placeholder:text-[#3A4560] focus:outline-none focus:border-[#135BEC] transition-colors"
          />
        </div>

        {error && <p className="text-[13px] text-[#F87171]" role="alert">{error}</p>}
        {saved && <p className="text-[13px] text-[#135BEC]">Saved.</p>}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 rounded-[10px] bg-[#135BEC] text-white text-[13.5px] font-semibold hover:bg-[#2A6BF0] disabled:opacity-50 transition-colors"
        >
          {isSaving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 mt-4">
        <p className="text-[13.5px] font-semibold text-[#E8F0FF] mb-3">Reports</p>
        {reports === null ? (
          <p className="text-[12.5px] text-[#5A6A8A]">Loading…</p>
        ) : reports.length === 0 ? (
          <p className="text-[12.5px] text-[#5A6A8A]">No reports generated by this user.</p>
        ) : (
          <div className="space-y-2">
            {reports.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-1.5">
                <div className="min-w-0">
                  <p className="text-[12.5px] text-[#E8F0FF] font-mono truncate">{r.id}</p>
                  <p className="text-[11.5px] text-[#5A6A8A]">{r.tier} · {new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <ReportStatusBadge r={r} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 mt-4">
        <p className="text-[13.5px] font-semibold text-[#E8F0FF] mb-3">Orders</p>
        {orders === null ? (
          <p className="text-[12.5px] text-[#5A6A8A]">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="text-[12.5px] text-[#5A6A8A]">No orders from this user.</p>
        ) : (
          <div className="space-y-2">
            {orders.map(o => (
              <div key={o.id} className="flex items-center justify-between gap-3 py-1.5">
                <div className="min-w-0">
                  <p className="text-[12.5px] text-[#E8F0FF] truncate">{o.merchantOrderRef}</p>
                  <p className="text-[11.5px] text-[#5A6A8A]">
                    {(o.amount / 100).toLocaleString(undefined, { style: 'currency', currency: o.currency })} · {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[14px] border border-[rgba(255,107,107,0.2)] bg-[rgba(255,107,107,0.04)] p-5 mt-4">
        <p className="text-[13.5px] font-medium text-[#E8F0FF] mb-1">Delete account</p>
        <p className="text-[12.5px] text-[#5A6A8A] mb-3">This permanently deletes the user and cannot be undone.</p>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 rounded-[10px] border border-[rgba(255,107,107,0.3)] text-[#F87171] text-[13.5px] font-semibold hover:bg-[rgba(255,107,107,0.08)] transition-colors"
          >
            Delete this user
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-[10px] bg-[#F87171] text-white text-[13.5px] font-semibold hover:bg-[#EF5555] disabled:opacity-50 transition-colors"
            >
              {isDeleting ? 'Deleting…' : 'Confirm delete'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={isDeleting}
              className="text-[13.5px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
