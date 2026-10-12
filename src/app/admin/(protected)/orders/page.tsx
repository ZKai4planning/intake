'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { listAdminOrders, type AdminOrderRow } from '@/lib/adminApi'

const PAGE_SIZE = 25
const STATUSES = ['', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'INCOMPLETE'] as const

const STATUS_LABELS: Record<string, string> = {
  '': 'All statuses',
  INCOMPLETE: 'Needs follow-up (pending + failed)',
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    COMPLETED: 'bg-[rgba(52,211,153,0.12)] text-[#34D399]',
    PROCESSING: 'bg-[rgba(19,91,236,0.12)] text-[#135BEC]',
    PENDING: 'bg-[rgba(251,191,36,0.12)] text-[#FBBF24]',
    FAILED: 'bg-[rgba(255,107,107,0.12)] text-[#F87171]',
  }
  return (
    <span className={`text-[11.5px] font-medium px-2 py-0.5 rounded-full ${colors[status] ?? 'bg-white/[0.06] text-[#A8B8D8]'}`}>
      {status}
    </span>
  )
}

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [orders, setOrders] = useState<AdminOrderRow[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    listAdminOrders({ status: status || undefined, page, limit: PAGE_SIZE }).then(({ data, error: apiError }) => {
      if (apiError || !data) {
        setError(apiError ?? 'Failed to load orders.')
        return
      }
      setError('')
      setOrders(data.orders)
      setTotal(data.total)
    })
  }, [status, page])

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  return (
    <div>
      <h1 className="font-display text-[22px] text-[#E8F0FF] mb-1">Orders</h1>
      <p className="text-[13px] text-[#5A6A8A] mb-5">
        {total.toLocaleString()} total
        {status === 'INCOMPLETE' && ' — checkouts started but never completed. Reach out using the contact details below.'}
      </p>

      <select
        value={status}
        onChange={e => { setStatus(e.target.value); setPage(1) }}
        className="rounded-[10px] border border-white/[0.08] bg-[#0F1525] px-3.5 py-2 text-[13.5px] text-[#E8F0FF] focus:outline-none focus:border-[#135BEC] transition-colors mb-4"
      >
        {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>)}
      </select>

      {error && <p className="text-[13px] text-[#F87171] mb-4">{error}</p>}

      <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.08] text-[11.5px] uppercase tracking-wide text-[#5A6A8A]">
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Revolut ID</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-[13.5px] text-[#E8F0FF] font-medium">{o.merchantOrderRef}</td>
                <td className="px-4 py-3 text-[13.5px]">
                  {o.userId ? (
                    <Link href={`/admin/users/${o.userId}`} className="text-[#E8F0FF] hover:text-[#135BEC] font-medium">
                      {o.userName || '(no name)'}
                    </Link>
                  ) : (
                    <span className="text-[#5A6A8A]">guest</span>
                  )}
                  {o.userEmail && <p className="text-[11.5px] text-[#5A6A8A]">{o.userEmail}</p>}
                </td>
                <td className="px-4 py-3 text-[13.5px] text-[#A8B8D8]">
                  {(o.amount / 100).toLocaleString(undefined, { style: 'currency', currency: o.currency })}
                </td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-[12.5px] text-[#5A6A8A] font-mono">{o.revolutOrderId}</td>
                <td className="px-4 py-3 text-[13px] text-[#5A6A8A]">{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#5A6A8A]">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-[8px] text-[13px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF] hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">← Prev</button>
          <span className="text-[13px] text-[#5A6A8A]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page >= totalPages} className="px-3 py-1.5 rounded-[8px] text-[13px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF] hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Next →</button>
        </div>
      )}
    </div>
  )
}
