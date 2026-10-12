import { cn } from '@/lib/cn'
import { AGENT_CATALOGUE } from '@/types/workspace'

interface AgentMarketplaceWidgetProps {
  availableAgents: string[]
  className?: string
}

export function AgentMarketplaceWidget({ availableAgents, className }: AgentMarketplaceWidgetProps) {
  const lockedAgents = Object.values(AGENT_CATALOGUE).filter(a => !availableAgents.includes(a.id))

  return (
    <div className={cn('rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5', className)}>
      <h3 className="text-[14px] font-semibold text-[#E8F0FF] mb-1">Agent marketplace</h3>
      <p className="text-[11.5px] text-[#5A6A8A] mb-4">Add more agents to your workspace</p>
      <div className="space-y-2">
        {lockedAgents.slice(0, 4).map(agent => (
          <div key={agent.id} className="flex items-center gap-3 p-2.5 rounded-[8px] bg-white/[0.02] opacity-70">
            <span className="w-7 h-7 rounded-[7px] bg-white/[0.05] flex items-center justify-center text-[#5A6A8A] text-[13px] shrink-0">🔒</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium text-[#A8B8D8] truncate">{agent.name}</p>
            </div>
            <button className="shrink-0 text-[10.5px] font-medium px-2.5 py-1 rounded-full bg-white/[0.06] text-[#A8B8D8] hover:bg-white/[0.1] transition-colors">
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
