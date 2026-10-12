'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { listAdminCartItems, type AdminCartItemRow } from '@/lib/adminApi'

const PAGE_SIZE = 25

export default function AdminCartPage() {
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<AdminCartItemRow[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    listAdminCartItems({ page, limit: PAGE_SIZE }).then(({ data, error: apiError }) => {
      if (apiError || !data) {
        setError(apiError ?? 'Failed to load cart items.')
        return
      }
      setError('')
      setItems(data.items)
      setTotal(data.total)
    })
  }, [page])

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  return (
    <div>
      <h1 className="font-display text-[22px] text-[#E8F0FF] mb-1">Cart</h1>
      <p className="text-[13px] text-[#5A6A8A] mb-5">
        {total.toLocaleString()} items across all users — read-only. Every row here started checkout but never
        finished, so this list doubles as your abandoned-cart follow-up queue.
      </p>

      {error && <p className="text-[13px] text-[#F87171] mb-4">{error}</p>}

      <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.08] text-[11.5px] uppercase tracking-wide text-[#5A6A8A]">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Report</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Added</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={`${item.userId}-${item.reportId}-${i}`} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-[13.5px]">
                  <Link href={`/admin/users/${item.userId}`} className="text-[#E8F0FF] hover:text-[#135BEC] font-medium">
                    {item.userName || '(no name)'}
                  </Link>
                  {item.userEmail && <p className="text-[11.5px] text-[#5A6A8A]">{item.userEmail}</p>}
                </td>
                <td className="px-4 py-3 text-[13.5px] text-[#E8F0FF]">{item.label}</td>
                <td className="px-4 py-3 text-[13.5px] text-[#A8B8D8]">{item.tier}</td>
                <td className="px-4 py-3 text-[13.5px] text-[#A8B8D8]">£{item.priceGBP}</td>
                <td className="px-4 py-3 text-[13px] text-[#5A6A8A]">{new Date(item.addedAt).toLocaleString()}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[13px] text-[#5A6A8A]">No cart items found.</td></tr>
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
