import { AgentxShell } from '@/components/agentx/AgentxShell'

export default function ProtectedAgentxLayout({ children }: { children: React.ReactNode }) {
  return <AgentxShell>{children}</AgentxShell>
}
