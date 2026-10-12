import { cn } from '@/lib/cn'

const SITES = [
  { id: '1', name: 'Land off Station Road', status: 'Feasibility report ready', risk: 'Medium', units: '8 units' },
  { id: '2', name: '14-16 High Street', status: 'Pre-app advice requested', risk: 'Low', units: '6 flats' },
]

export function SiteFeasibilityWidget({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5', className)}>
      <h3 className="text-[14px] font-semibold text-[#E8F0FF] mb-4">Site pipeline</h3>
      <div className="space-y-2.5">
        {SITES.map(s => (
          <div key={s.id} className="p-3 rounded-[10px] bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[13px] font-medium text-[#E8F0FF]">{s.name}</p>
              <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-[rgba(0,212,255,0.1)] text-[#00D4FF]">{s.units}</span>
            </div>
            <p className="text-[11.5px] text-[#A8B8D8]">{s.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
