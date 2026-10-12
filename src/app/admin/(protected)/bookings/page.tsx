'use client'

import { useEffect, useState } from 'react'
import { listAdminBookings, updateAdminBookingStatus, type AdminBookingRow } from '@/lib/adminApi'

const PAGE_SIZE = 25
const STATUSES = ['', 'confirmed', 'cancelled', 'completed']

export default function AdminBookingsPage() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [bookings, setBookings] = useState<AdminBookingRow[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  function load() {
    listAdminBookings({ status: status || undefined, page, limit: PAGE_SIZE }).then(({ data, error: apiError }) => {
      if (apiError || !data) {
        setError(apiError ?? 'Failed to load bookings.')
        return
      }
      setError('')
      setBookings(data.bookings)
      setTotal(data.total)
    })
  }

  useEffect(load, [status, page])

  async function handleStatusChange(id: string, newStatus: 'confirmed' | 'cancelled' | 'completed') {
    setUpdatingId(id)
    const { error: apiError } = await updateAdminBookingStatus(id, newStatus)
    setUpdatingId(null)
    if (apiError) {
      setError(apiError)
      return
    }
    load()
  }

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  return (
    <div>
      <h1 className="font-display text-[22px] text-[#E8F0FF] mb-1">Bookings</h1>
      <p className="text-[13px] text-[#5A6A8A] mb-5">{total.toLocaleString()} total</p>

      <select
        value={status}
        onChange={e => { setStatus(e.target.value); setPage(1) }}
        className="rounded-[10px] border border-white/[0.08] bg-[#0F1525] px-3.5 py-2 text-[13.5px] text-[#E8F0FF] focus:outline-none focus:border-[#135BEC] transition-colors mb-4"
      >
        {STATUSES.map(s => <option key={s} value={s}>{s || 'All statuses'}</option>)}
      </select>

      {error && <p className="text-[13px] text-[#F87171] mb-4">{error}</p>}

      <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.08] text-[11.5px] uppercase tracking-wide text-[#5A6A8A]">
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Date / slot</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Booked</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-[13.5px] text-[#E8F0FF] font-medium capitalize">{b.type}</td>
                <td className="px-4 py-3 text-[13.5px] text-[#A8B8D8]">{b.date ?? '—'} · {b.timeSlot}</td>
                <td className="px-4 py-3 text-[13.5px] text-[#A8B8D8]">{b.priceGBP > 0 ? `£${b.priceGBP}` : 'Free'}</td>
                <td className="px-4 py-3">
                  <select
                    value={b.status}
                    disabled={updatingId === b.id}
                    onChange={e => handleStatusChange(b.id, e.target.value as 'confirmed' | 'cancelled' | 'completed')}
                    className="rounded-[8px] border border-white/[0.08] bg-[#0A0E1A] px-2.5 py-1 text-[12.5px] text-[#E8F0FF] focus:outline-none focus:border-[#135BEC] transition-colors disabled:opacity-50"
                  >
                    <option value="confirmed">confirmed</option>
                    <option value="cancelled">cancelled</option>
                    <option value="completed">completed</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-[13px] text-[#5A6A8A]">{new Date(b.bookedAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[13px] text-[#5A6A8A]">No bookings found.</td></tr>
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
