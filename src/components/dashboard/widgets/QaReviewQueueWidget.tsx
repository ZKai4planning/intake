import { cn } from '@/lib/cn'

const QUEUE = [
  { id: '1', title: 'Eligibility report — 12 Maple Close', flagged: 1 },
  { id: '2', title: 'Design & access statement — Oak Avenue', flagged: 0 },
]

export function QaReviewQueueWidget({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5', className)}>
      <h3 className="text-[14px] font-semibold text-[#E8F0FF] mb-4">QA review queue</h3>
      <div className="space-y-2">
        {QUEUE.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-[10px] bg-white/[0.02]">
            <p className="text-[12.5px] text-[#E8F0FF]">{item.title}</p>
            {item.flagged > 0 ? (
              <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.12)] text-[#F59E0B]">
                {item.flagged} flagged
              </span>
            ) : (
              <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-[rgba(19,91,236,0.1)] text-[#135BEC]">Clear</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
