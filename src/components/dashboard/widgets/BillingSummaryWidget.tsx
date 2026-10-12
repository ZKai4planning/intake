import { cn } from '@/lib/cn'

export function BillingSummaryWidget({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5', className)}>
      <h3 className="text-[14px] font-semibold text-[#E8F0FF] mb-4">Billing this month</h3>
      <div className="flex items-end gap-2 mb-1">
        <p className="font-display text-[28px] text-[#E8F0FF]">£284</p>
        <span className="text-[11px] text-[#5A6A8A] mb-1.5">of £500 plan</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-4">
        <div className="h-full bg-[#135BEC] rounded-full" style={{ width: '57%' }} />
      </div>
      <button className="text-[12px] text-[#135BEC] hover:text-[#2A6BF0] font-medium">View invoices →</button>
    </div>
  )
}
