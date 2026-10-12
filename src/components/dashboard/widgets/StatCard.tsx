import { cn } from '@/lib/cn'

interface StatCardProps {
  label: string
  value: string | number
  trend?: { value: string; positive: boolean }
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ label, value, trend, icon, className }: StatCardProps) {
  return (
    <div className={cn('rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-4', className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5A6A8A]">{label}</p>
        {icon && <span className="text-[#5A6A8A]">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <p className="font-display text-[26px] font-normal text-[#E8F0FF] leading-none">{value}</p>
        {trend && (
          <span className={cn('text-[11px] font-medium mb-1', trend.positive ? 'text-[#135BEC]' : 'text-[#F87171]')}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  )
}
