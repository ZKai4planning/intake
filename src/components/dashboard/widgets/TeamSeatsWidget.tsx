import { cn } from '@/lib/cn'

const TEAM = [
  { name: 'You',          role: 'Owner',  status: 'Active' },
  { name: 'Maria Lopez',  role: 'Member', status: 'Active' },
  { name: 'David Chen',   role: 'Member', status: 'Invited' },
]

export function TeamSeatsWidget({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-[#E8F0FF]">Team — 3 of 10 seats</h3>
        <button className="text-[12px] text-[#135BEC] hover:text-[#2A6BF0] font-medium">+ Invite</button>
      </div>
      <div className="space-y-2">
        {TEAM.map(m => (
          <div key={m.name} className="flex items-center justify-between p-2.5 rounded-[8px] bg-white/[0.02]">
            <div>
              <p className="text-[12.5px] text-[#E8F0FF]">{m.name}</p>
              <p className="text-[11px] text-[#5A6A8A]">{m.role}</p>
            </div>
            <span className={cn(
              'text-[10.5px] font-medium px-2 py-0.5 rounded-full',
              m.status === 'Active' ? 'bg-[rgba(19,91,236,0.1)] text-[#135BEC]' : 'bg-white/[0.05] text-[#A8B8D8]'
            )}>
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
