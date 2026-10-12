'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAdminDashboardStats, type AdminDashboardStats } from '@/lib/adminApi'

function StatCard({ label, value, href, warn }: { label: string; value: string; href?: string; warn?: boolean }) {
  const content = (
    <div
      className={
        warn
          ? 'rounded-[14px] border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.05)] p-5 h-full transition-colors hover:bg-[rgba(251,191,36,0.08)]'
          : 'rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5 h-full transition-colors hover:bg-white/[0.02]'
      }
    >
      <p className={warn ? 'text-[12.5px] text-[#FBBF24]' : 'text-[12.5px] text-[#5A6A8A]'}>{label}</p>
      <p className="text-[26px] font-semibold text-[#E8F0FF] mt-1">{value}</p>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminDashboardStats().then(({ data, error: apiError }) => {
      if (apiError || !data) {
        setError(apiError ?? 'Failed to load dashboard stats.')
        return
      }
      setStats(data)
    })
  }, [])

  return (
    <div>
      <h1 className="font-display text-[22px] text-[#E8F0FF] mb-1">Dashboard</h1>
      <p className="text-[13px] text-[#5A6A8A] mb-6">Overview across the whole app.</p>

      {error && <p className="text-[13px] text-[#F87171] mb-4">{error}</p>}

      {!stats && !error && (
        <p className="text-[13px] text-[#5A6A8A]">Loading…</p>
      )}

      {stats && (
        <>
          {(stats.incompleteOrdersCount > 0 || stats.reportsNeedingFollowUpCount > 0) && (
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#FBBF24] mb-2">Needs follow-up</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  label="Stalled checkouts"
                  value={stats.incompleteOrdersCount.toLocaleString()}
                  href="/admin/orders"
                  warn
                />
                <StatCard
                  label="Unpaid reports"
                  value={stats.reportsNeedingFollowUpCount.toLocaleString()}
                  href="/admin/reports"
                  warn
                />
                <StatCard
                  label="Abandoned carts"
                  value={stats.cartItemsCount.toLocaleString()}
                  href="/admin/cart"
                  warn
                />
              </div>
            </div>
          )}

          <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#5A6A8A] mb-2">Overview</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Users" value={stats.usersCount.toLocaleString()} href="/admin/users" />
            <StatCard label="Orders" value={stats.ordersCount.toLocaleString()} href="/admin/orders" />
            <StatCard label="Completed orders" value={stats.completedOrdersCount.toLocaleString()} />
            <StatCard label="Total revenue (GBP)" value={`£${stats.totalRevenueGBP.toLocaleString()}`} />
            <StatCard label="Bookings" value={stats.bookingsCount.toLocaleString()} href="/admin/bookings" />
            <StatCard label="Confirmed bookings" value={stats.confirmedBookingsCount.toLocaleString()} />
            <StatCard label="Reports" value={stats.reportsCount.toLocaleString()} href="/admin/reports" />
            <StatCard label="Cart items" value={stats.cartItemsCount.toLocaleString()} href="/admin/cart" />
          </div>
        </>
      )}
    </div>
  )
}
