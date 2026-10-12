'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAgentUserWithProjects, type AgentUserRow, type AgentProject } from '@/lib/agentxApi'

export default function AgentxUserDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [user, setUser] = useState<AgentUserRow | null>(null)
  const [projects, setProjects] = useState<AgentProject[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    getAgentUserWithProjects(params.id).then(({ data, error: apiError }) => {
      if (apiError || !data) {
        setError(apiError ?? 'Failed to load user.')
        return
      }
      setUser(data.user)
      setProjects(data.projects)
    })
  }, [params.id])

  if (error && !user) return <p className="text-[13px] text-[#F87171]">{error}</p>
  if (!user) return <p className="text-[13px] text-[#5A6A8A]">Loading…</p>

  return (
    <div>
      <Link href="/agentx/users" className="text-[13px] text-[#5A6A8A] hover:text-[#E8F0FF] transition-colors">← Back to users</Link>

      <div className="flex items-center justify-between mt-3 mb-6">
        <div>
          <h1 className="font-display text-[22px] text-[#E8F0FF] mb-1">{user.name || '(no name)'}</h1>
          <p className="text-[13.5px] text-[#5A6A8A]">{user.email}</p>
        </div>
        <button
          onClick={() => router.push(`/agentx/projects/new?userId=${user.id}`)}
          className="px-4 py-2 rounded-[10px] bg-[#135BEC] text-white text-[13.5px] font-semibold hover:bg-[#2A6BF0] transition-colors"
        >
          + New project
        </button>
      </div>

      <h2 className="text-[13px] font-semibold text-[#A8B8D8] uppercase tracking-wide mb-3">Projects</h2>

      {projects.length === 0 ? (
        <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-6 text-center">
          <p className="text-[13.5px] text-[#5A6A8A]">No projects yet.</p>
        </div>
      ) : (
        <div className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11.5px] uppercase tracking-wide text-[#5A6A8A]">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Progress</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/agentx/projects/${p.id}`} className="text-[13.5px] text-[#E8F0FF] hover:text-[#135BEC] font-medium">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[13.5px] text-[#A8B8D8] capitalize">{p.tier}</td>
                  <td className="px-4 py-3 text-[13.5px] text-[#A8B8D8]">{p.answeredCount} / {p.totalCount}</td>
                  <td className="px-4 py-3">
                    <span className={
                      p.status === 'submitted'
                        ? 'text-[11.5px] font-medium px-2 py-0.5 rounded-full bg-[rgba(52,211,153,0.12)] text-[#34D399]'
                        : 'text-[11.5px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A8B8D8]'
                    }>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[#5A6A8A]">{new Date(p.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
