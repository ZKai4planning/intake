import { cn } from '@/lib/cn'

export function ApiUsageWidget({ className }: { className?: string }) {
  const used = 6240, limit = 10000
  const pct = Math.round((used / limit) * 100)

  return (
    <div className={cn('rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-semibold text-[#E8F0FF]">API usage</h3>
        <span className="text-[11px] font-mono text-[#5A6A8A]">{used.toLocaleString()} / {limit.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden mb-3">
        <div className="h-full bg-[#00D4FF] rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11.5px] text-[#A8B8D8]">{pct}% of monthly quota used · resets in 12 days</p>
    </div>
  )
}
