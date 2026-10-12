'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { listAgentUsers, type AgentUserRow } from '@/lib/agentxApi'

const PAGE_SIZE = 25

export default function AgentxUsersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [users, setUsers] = useState<AgentUserRow[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const handle = setTimeout(() => {
      listAgentUsers({ search: search || undefined, page, limit: PAGE_SIZE }).then(({ data, error: apiError }) => {
        if (apiError || !data) {
          setError(apiError ?? 'Failed to load users.')
          return
        }
        setError('')
        setUsers(data.users)
        setTotal(data.total)
      })
    }, 250)
    return () => clearTimeout(handle)
  }, [search, page])

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  return (
    <div>
      <h1 className="font-display text-[22px] text-[#E8F0FF] mb-1">Users</h1>
      <p className="text-[13px] text-[#5A6A8A] mb-5">
        {total.toLocaleString()} total — pick a user to view or create a project on their behalf.
      </p>

      <input
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1) }}
        placeholder="Search by name…"
        className="w-full max-w-[320px] rounded-[10px] border border-white/[0.08] bg-[#0F1525] px-3.5 py-2 text-[13.5px] text-[#E8F0FF] placeholder:text-[#3A4560] focus:outline-none focus:border-[#135BEC] transition-colors mb-4"
      />

      {error && <p className="text-[13px] text-[#F87171] mb-4">{error}</p>}

      <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.08] text-[11.5px] uppercase tracking-wide text-[#5A6A8A]">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <Link href={`/agentx/users/${u.id}`} className="text-[13.5px] text-[#E8F0FF] hover:text-[#135BEC] font-medium">
                    {u.name || '(no name)'}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[13.5px] text-[#A8B8D8]">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="text-[11.5px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A8B8D8]">{u.role}</span>
                </td>
                <td className="px-4 py-3 text-[13px] text-[#5A6A8A]">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-[13px] text-[#5A6A8A]">No users found.</td></tr>
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
