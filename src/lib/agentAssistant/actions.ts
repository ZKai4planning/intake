/**
 * agentAssistant/actions.ts
 * ───────────────────────────
 * The floating assistant (AgentAssistantWidget) is a thin chat UI over
 * one real capability: picking one of a small, fixed set of in-app
 * actions and navigating there. The LLM (same Groq setup /api/chat/ask
 * already uses) never gets to invent a destination — it can only pick
 * an `id` from the list below for the surface it's running on, which
 * is what makes this safe to let free-text drive: worst case, it
 * picks the wrong known page, never an arbitrary one.
 *
 * Some actions need a value only the *page the widget is mounted on*
 * can know (e.g. which user's project to create) — `contextParam`
 * marks that, and the model is told explicitly not to guess it. If
 * the client-side widget doesn't have that context on hand, `fallback`
 * is where it sends the person instead, with a short explanation.
 */

export type AgentAssistantSurface = 'customer' | 'admin' | 'agentx'

export interface AgentAction {
  id: string
  /** Shown to the LLM in the tool description so it knows when this is the right pick. */
  description: string
  /** Used in the canned confirmation line, e.g. "Opening your reports…" */
  confirmLabel: string
  /** Builds the destination path from already-known params. */
  buildPath: (params: Record<string, string>) => string
  /** Name of a param that must come from page context, never from the model's guess (e.g. a UUID). */
  contextParam?: string
  /** Where to send the person instead if contextParam isn't available on the current page. */
  fallback?: { path: string; note: string }
}

const CUSTOMER_ACTIONS: AgentAction[] = [
  {
    id: 'new_project',
    description: 'Start a brand-new planning application/project from scratch.',
    confirmLabel: 'a new project',
    buildPath: () => '/dashboard/new/intent',
  },
  {
    id: 'view_projects',
    description: 'View the list of existing projects/applications and their status.',
    confirmLabel: 'your projects',
    buildPath: () => '/dashboard/projects',
  },
  {
    id: 'view_reports',
    description: 'View, unlock, or download previously generated planning reports.',
    confirmLabel: 'your reports',
    buildPath: () => '/dashboard/reports',
  },
  {
    id: 'view_profile',
    description: 'View or edit account/profile settings.',
    confirmLabel: 'your profile',
    buildPath: () => '/dashboard/profile',
  },
  {
    id: 'view_home',
    description: 'Go back to the dashboard home/overview screen.',
    confirmLabel: 'your dashboard',
    buildPath: () => '/dashboard',
  },
]

const ADMIN_ACTIONS: AgentAction[] = [
  {
    id: 'view_dashboard',
    description: 'Go to the admin overview dashboard with key stats.',
    confirmLabel: 'the dashboard',
    buildPath: () => '/admin/dashboard',
  },
  {
    id: 'view_users',
    description: 'View, search, or manage customer accounts. Not for a "how many users" question — use get_admin_stats for that.',
    confirmLabel: 'users',
    buildPath: () => '/admin/users',
  },
  {
    id: 'view_orders',
    description: 'View orders/payments, including stalled or incomplete checkouts. Not for a "how many orders" question — use get_admin_stats or list_stalled_orders for that.',
    confirmLabel: 'orders',
    buildPath: () => '/admin/orders',
  },
  {
    id: 'view_bookings',
    description: 'View consultant booking requests.',
    confirmLabel: 'bookings',
    buildPath: () => '/admin/bookings',
  },
  {
    id: 'view_reports',
    description: 'View generated reports, including ones stalled at the paywall.',
    confirmLabel: 'reports',
    buildPath: () => '/admin/reports',
  },
  {
    id: 'view_cart',
    description: 'View items left in customer carts (abandoned checkouts).',
    confirmLabel: 'the cart',
    buildPath: () => '/admin/cart',
  },
  {
    id: 'view_agents',
    description: "View the current list of agentx accounts. Do NOT use this for a request to create/add a new agent — that's create_agent_account's job, even though this page also happens to show agents.",
    confirmLabel: 'agents',
    buildPath: () => '/admin/agents',
  },
]

const AGENTX_ACTIONS: AgentAction[] = [
  {
    id: 'view_users',
    description: 'View the list of customers this agent portal manages projects for. Not for a "how many users" question — use count_users for that.',
    confirmLabel: 'users',
    buildPath: () => '/agentx/users',
  },
]

export const AGENT_ACTIONS: Record<AgentAssistantSurface, AgentAction[]> = {
  customer: CUSTOMER_ACTIONS,
  admin: ADMIN_ACTIONS,
  agentx: AGENTX_ACTIONS,
}

export function getAgentAction(surface: AgentAssistantSurface, id: string): AgentAction | undefined {
  return AGENT_ACTIONS[surface].find(a => a.id === id)
}
