import { StatCard } from './StatCard'

export function PortfolioOverviewWidget({ className }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className ?? ''}`}>
      <StatCard label="Properties" value={12} />
      <StatCard label="Active checks" value={3} />
      <StatCard label="Licences expiring" value={2} trend={{ value: 'Action needed', positive: false }} />
      <StatCard label="Compliant" value="10/12" trend={{ value: '83%', positive: true }} />
    </div>
  )
}
