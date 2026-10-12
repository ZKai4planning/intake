import { cn } from '@/lib/cn'
import { AGENT_CATALOGUE } from '@/types/workspace'

interface AgentUsageWidgetProps {
  availableAgents: string[]
  className?: string
}

/**
 * AgentUsageWidget
 * ─────────────────
 * Shows which AI agents are available in this workspace tier and
 * a mock usage count for each — this is the "complexity surfaced
 * in the dashboard" piece you asked for. Higher tiers see more
 * agents automatically, driven purely by workspace.availableAgents.
 */
export function AgentUsageWidget({ availableAgents, className }: AgentUsageWidgetProps) {
  return (
    <div className={cn('rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5', className)}>
      <h3 className="text-[14px] font-semibold text-[#E8F0FF] mb-4">Your AI agents</h3>
      <div className="space-y-2">
        {availableAgents.map(id => {
          const agent = AGENT_CATALOGUE[id]
          if (!agent) return null
          return (
            <div key={id} className="flex items-center gap-3 p-2.5 rounded-[8px] bg-white/[0.02]">
              <span className="w-7 h-7 rounded-[7px] bg-[rgba(19,91,236,0.1)] flex items-center justify-center text-[#135BEC] text-[13px] shrink-0">
                ✦
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-medium text-[#E8F0FF] truncate">{agent.name}</p>
                <p className="text-[11px] text-[#5A6A8A] truncate">{agent.description}</p>
              </div>
              <span className={cn(
                'shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full',
                agent.costModel === 'included' ? 'bg-[rgba(19,91,236,0.1)] text-[#135BEC]' :
                agent.costModel === 'per-run'   ? 'bg-[rgba(0,212,255,0.1)] text-[#00D4FF]' :
                                                   'bg-[rgba(139,92,246,0.1)] text-[#8B5CF6]'
              )}>
                {agent.costModel}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
