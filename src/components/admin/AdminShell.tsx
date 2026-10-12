'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAdminMe, adminLogout, type AdminProfile } from '@/lib/adminApi'
import { AgentAssistantWidget } from '@/components/agentAssistant/AgentAssistantWidget'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/cart', label: 'Cart' },
  { href: '/admin/agents', label: 'Agents' },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [admin, setAdmin] = useState<AdminProfile | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let cancelled = false
    getAdminMe().then(({ data, error }) => {
      if (cancelled) return
      if (error || !data) {
        router.replace('/admin/login')
        return
      }
      setAdmin(data.admin)
      setChecked(true)
    })
    return () => { cancelled = true }
  }, [router])

  async function handleLogout() {
    await adminLogout()
    router.push('/admin/login')
  }

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <span className="w-5 h-5 rounded-full border-2 border-[#135BEC] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex">
      <aside className="w-[220px] shrink-0 border-r border-white/[0.08] bg-[#0F1525] flex flex-col">
        <div className="px-5 py-5 border-b border-white/[0.08]">
          <p className="text-[11px] font-semibold tracking-wide text-[#5A6A8A] uppercase">AI4Planning</p>
          <p className="text-[15px] font-semibold text-[#E8F0FF] mt-0.5">Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(item => {
            const active = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? 'block px-3 py-2 rounded-[8px] text-[13.5px] font-medium bg-[rgba(19,91,236,0.12)] text-[#135BEC]'
                    : 'block px-3 py-2 rounded-[8px] text-[13.5px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF] hover:bg-white/[0.05] transition-colors'
                }
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/[0.08]">
          <p className="px-3 text-[12.5px] text-[#5A6A8A] truncate mb-2">{admin?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-[8px] text-[13.5px] font-medium text-[#A8B8D8] hover:text-[#F87171] hover:bg-white/[0.05] transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-8 py-7">{children}</main>

      <AgentAssistantWidget surface="admin" />
    </div>
  )
}
