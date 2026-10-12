import { cn } from '@/lib/cn'

const CLIENTS = [
  { id: '1', name: 'Sarah Thompson', project: 'Rear extension — Westminster', status: 'Awaiting drawings' },
  { id: '2', name: 'James Okafor',   project: 'HMO conversion — Hackney',    status: 'Report sent' },
  { id: '3', name: 'Priya Sharma',   project: 'Site appraisal — Croydon',    status: 'Pre-app submitted' },
]

export function ClientListWidget({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-[#E8F0FF]">Clients</h3>
        <button className="text-[12px] text-[#135BEC] hover:text-[#2A6BF0] font-medium">+ Add client</button>
      </div>
      <div className="space-y-2">
        {CLIENTS.map(c => (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-[10px] bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#135BEC] to-[#00D4FF] flex items-center justify-center text-[11px] font-bold text-[#050A12] shrink-0">
              {c.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium text-[#E8F0FF] truncate">{c.name}</p>
              <p className="text-[11px] text-[#5A6A8A] truncate">{c.project}</p>
            </div>
            <span className="shrink-0 text-[10.5px] text-[#A8B8D8] bg-white/[0.05] px-2 py-1 rounded-full">{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
