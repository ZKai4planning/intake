import { cn } from '@/lib/cn'

const ALERTS = [
  { id: '1', property: '8 Birch Road', message: 'HMO licence expires in 14 days', severity: 'high' as const },
  { id: '2', property: '4 Elm Street', message: 'Gas safety certificate due for renewal', severity: 'medium' as const },
]

const SEVERITY_COLOR = { high: '#F87171', medium: '#F59E0B', low: '#00D4FF' }

export function TenancyAlertsWidget({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5', className)}>
      <h3 className="text-[14px] font-semibold text-[#E8F0FF] mb-4">Compliance alerts</h3>
      <div className="space-y-2.5">
        {ALERTS.map(a => (
          <div key={a.id} className="flex items-start gap-3 p-3 rounded-[10px] bg-white/[0.02]">
            <span
              className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
              style={{ background: SEVERITY_COLOR[a.severity] }}
            />
            <div className="flex-1">
              <p className="text-[12.5px] font-medium text-[#E8F0FF]">{a.property}</p>
              <p className="text-[11.5px] text-[#A8B8D8]">{a.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
