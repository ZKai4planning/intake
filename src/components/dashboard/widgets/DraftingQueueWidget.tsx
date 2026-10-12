import { cn } from '@/lib/cn'

const DRAFTS = [
  { id: '1', title: 'Floor plans — 12 Maple Close', stage: 'In progress', pct: 60 },
  { id: '2', title: 'Elevations — Oak Avenue',      stage: 'Review',      pct: 90 },
]

export function DraftingQueueWidget({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5', className)}>
      <h3 className="text-[14px] font-semibold text-[#E8F0FF] mb-4">Drafting queue</h3>
      <div className="space-y-3">
        {DRAFTS.map(d => (
          <div key={d.id}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[12.5px] text-[#E8F0FF]">{d.title}</p>
              <span className="text-[11px] text-[#5A6A8A]">{d.stage}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full bg-[#00D4FF] rounded-full" style={{ width: `${d.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
