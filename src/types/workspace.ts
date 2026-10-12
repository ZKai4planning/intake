import type { ActorId } from './index'

/**
 * workspace.ts
 * ─────────────
 * IMPORTANT ARCHITECTURE NOTE:
 *
 * The "actor" (homeowner / landlord / developer / consultant / architect / business)
 * is a BACKEND concept. It is captured at signup and stored server-side in the
 * user's session/JWT. The frontend NEVER shows the word "actor" or asks
 * "which workspace do you want" — the user just logs in and sees their dashboard.
 *
 * This file defines the WORKSPACE CONFIG — the thing the dashboard actually
 * renders from. It's derived from the actor server-side, but the frontend
 * only ever consumes the resolved config, never the raw actor id directly
 * inside UI copy.
 *
 * Complexity tiers:
 *   simple       → homeowner: one property, plain-English, minimal chrome
 *   standard     → landlord: portfolio view, basic agent usage stats
 *   advanced     → developer: site-level tools, feasibility agents, multi-project
 *   professional → consultant / architect: client management, drafting agents, QA tools
 *   enterprise   → business/agency: team seats, API usage, bulk operations
 */

export type WorkspaceTier =
  | 'simple'
  | 'standard'
  | 'advanced'
  | 'professional'
  | 'enterprise'

export type WidgetId =
  | 'activeProjects'
  | 'quickCheck'
  | 'recentReports'
  | 'portfolioOverview'
  | 'tenancyAlerts'
  | 'siteFeasibility'
  | 'agentUsage'
  | 'clientList'
  | 'draftingQueue'
  | 'qaReviewQueue'
  | 'teamSeats'
  | 'apiUsage'
  | 'bulkImport'
  | 'billingSummary'
  | 'agentMarketplace'

export interface AgentDefinition {
  id:          string
  name:        string
  description: string
  /** Which workspace tiers can access this agent */
  minTier:     WorkspaceTier
  /** Usage-based or seat-based */
  costModel:   'per-run' | 'included' | 'addon'
  icon:        string
}

export interface WorkspaceConfig {
  tier:          WorkspaceTier
  /** Human label shown nowhere except internal admin tools / debugging */
  internalLabel: string
  /** What the dashboard greeting calls them — generic, not actor-specific wording */
  greetingNoun:  string
  widgets:       WidgetId[]
  /** Ordered list of agent IDs available in this workspace */
  availableAgents: string[]
  /** Max concurrent projects/properties before upsell prompts */
  projectLimit:  number | 'unlimited'
  /** Whether to show team/seat management */
  showTeamManagement: boolean
  /** Whether to show API/developer tools */
  showApiAccess: boolean
  /** Navigation sections specific to this workspace */
  navSections: { label: string; href: string; icon: string }[]
}

/**
 * Maps an ActorId (backend-only concept) to a WorkspaceConfig.
 * This mapping itself should ideally live server-side too — the function
 * here is a fallback/mirror so the frontend can render correctly when
 * the API returns `workspaceConfig` directly (preferred) or just `actorId`
 * (fallback, resolved client-side using this same logic).
 */
export const ACTOR_WORKSPACE_MAP: Record<ActorId, WorkspaceConfig> = {
  homeowner: {
    tier:          'simple',
    internalLabel: 'Homeowner workspace',
    greetingNoun:  'project',
    widgets: ['activeProjects', 'quickCheck', 'recentReports'],
    availableAgents: ['planning-snapshot', 'document-checklist'],
    projectLimit:  3,
    showTeamManagement: false,
    showApiAccess: false,
    navSections: [
      { label: 'My projects', href: '/dashboard',          icon: 'home' },
      { label: 'Reports',     href: '/dashboard/reports',  icon: 'file' },
      { label: 'Get help',    href: '/dashboard/support',  icon: 'help' },
    ],
  },

  landlord: {
    tier:          'standard',
    internalLabel: 'Landlord workspace',
    greetingNoun:  'portfolio',
    widgets: ['portfolioOverview', 'tenancyAlerts', 'activeProjects', 'recentReports', 'agentUsage'],
    availableAgents: ['planning-snapshot', 'hmo-licence-check', 'document-checklist', 'compliance-monitor'],
    projectLimit:  25,
    showTeamManagement: false,
    showApiAccess: false,
    navSections: [
      { label: 'Portfolio',   href: '/dashboard',           icon: 'building' },
      { label: 'Compliance',  href: '/dashboard/compliance',icon: 'shield'   },
      { label: 'Reports',     href: '/dashboard/reports',   icon: 'file'     },
      { label: 'Get help',    href: '/dashboard/support',   icon: 'help'     },
    ],
  },

  developer: {
    tier:          'advanced',
    internalLabel: 'Developer workspace',
    greetingNoun:  'pipeline',
    widgets: ['siteFeasibility', 'activeProjects', 'agentUsage', 'recentReports', 'billingSummary'],
    availableAgents: [
      'planning-snapshot', 'site-feasibility', 'risk-assessment',
      'document-checklist', 'comparable-schemes', 'pre-app-strategy',
    ],
    projectLimit:  'unlimited',
    showTeamManagement: true,
    showApiAccess: false,
    navSections: [
      { label: 'Pipeline',    href: '/dashboard',            icon: 'layers'  },
      { label: 'Feasibility', href: '/dashboard/feasibility',icon: 'compass' },
      { label: 'Team',        href: '/dashboard/team',       icon: 'users'   },
      { label: 'Billing',     href: '/dashboard/billing',    icon: 'card'    },
      { label: 'Get help',    href: '/dashboard/support',    icon: 'help'    },
    ],
  },

  builder: {
    tier:          'advanced',
    internalLabel: 'Builder workspace',
    greetingNoun:  'jobs',
    widgets: ['activeProjects', 'draftingQueue', 'agentUsage', 'recentReports', 'billingSummary'],
    availableAgents: [
      'planning-snapshot', 'document-checklist', 'risk-assessment', 'comparable-schemes',
    ],
    projectLimit:  'unlimited',
    showTeamManagement: true,
    showApiAccess: false,
    navSections: [
      { label: 'Jobs',        href: '/dashboard',            icon: 'layers'  },
      { label: 'Drafting',    href: '/dashboard/drafting',   icon: 'edit'    },
      { label: 'Team',        href: '/dashboard/team',       icon: 'users'   },
      { label: 'Billing',     href: '/dashboard/billing',    icon: 'card'    },
      { label: 'Get help',    href: '/dashboard/support',    icon: 'help'    },
    ],
  },

  consultant: {
    tier:          'professional',
    internalLabel: 'Consultant workspace',
    greetingNoun:  'client workload',
    widgets: ['clientList', 'qaReviewQueue', 'agentUsage', 'recentReports', 'billingSummary'],
    availableAgents: [
      'planning-snapshot', 'site-feasibility', 'risk-assessment', 'qa-review',
      'document-drafting', 'appeal-strategy', 'pre-app-strategy', 'comparable-schemes',
    ],
    projectLimit:  'unlimited',
    showTeamManagement: true,
    showApiAccess: true,
    navSections: [
      { label: 'Clients',     href: '/dashboard',            icon: 'briefcase' },
      { label: 'QA queue',    href: '/dashboard/qa',         icon: 'check-sq'  },
      { label: 'Team',        href: '/dashboard/team',       icon: 'users'     },
      { label: 'API',         href: '/dashboard/api',        icon: 'code'      },
      { label: 'Billing',     href: '/dashboard/billing',    icon: 'card'      },
      { label: 'Get help',    href: '/dashboard/support',    icon: 'help'      },
    ],
  },

  architect: {
    tier:          'professional',
    internalLabel: 'Architect workspace',
    greetingNoun:  'project workload',
    widgets: ['clientList', 'draftingQueue', 'agentUsage', 'recentReports'],
    availableAgents: [
      'planning-snapshot', 'document-checklist', 'document-drafting',
      'design-compliance-check', 'comparable-schemes',
    ],
    projectLimit:  'unlimited',
    showTeamManagement: true,
    showApiAccess: false,
    navSections: [
      { label: 'Projects',    href: '/dashboard',            icon: 'briefcase' },
      { label: 'Drafting',    href: '/dashboard/drafting',   icon: 'edit'      },
      { label: 'Team',        href: '/dashboard/team',       icon: 'users'     },
      { label: 'Billing',     href: '/dashboard/billing',    icon: 'card'      },
      { label: 'Get help',    href: '/dashboard/support',    icon: 'help'      },
    ],
  },

  business: {
    tier:          'enterprise',
    internalLabel: 'Business workspace',
    greetingNoun:  'operations',
    widgets: ['bulkImport', 'apiUsage', 'teamSeats', 'agentUsage', 'agentMarketplace', 'billingSummary'],
    availableAgents: [
      'planning-snapshot', 'hmo-licence-check', 'document-checklist',
      'bulk-portfolio-check', 'compliance-monitor', 'api-webhook-agent',
    ],
    projectLimit:  'unlimited',
    showTeamManagement: true,
    showApiAccess: true,
    navSections: [
      { label: 'Operations',  href: '/dashboard',            icon: 'grid'    },
      { label: 'Bulk checks', href: '/dashboard/bulk',       icon: 'upload'  },
      { label: 'Team',        href: '/dashboard/team',       icon: 'users'   },
      { label: 'API',         href: '/dashboard/api',        icon: 'code'    },
      { label: 'Billing',     href: '/dashboard/billing',    icon: 'card'    },
      { label: 'Get help',    href: '/dashboard/support',    icon: 'help'    },
    ],
  },
}

/** Agent catalogue — full definitions referenced by ID above. */
export const AGENT_CATALOGUE: Record<string, AgentDefinition> = {
  'planning-snapshot': {
    id: 'planning-snapshot', name: 'Planning Snapshot',
    description: 'Quick free read on likely planning route for a property.',
    minTier: 'simple', costModel: 'included', icon: 'zap',
  },
  'document-checklist': {
    id: 'document-checklist', name: 'Document Checklist',
    description: 'Generates the exact documents needed for your application.',
    minTier: 'simple', costModel: 'included', icon: 'list',
  },
  'hmo-licence-check': {
    id: 'hmo-licence-check', name: 'HMO Licence Check',
    description: 'Determines licence type and change-of-use risk.',
    minTier: 'standard', costModel: 'per-run', icon: 'key',
  },
  'compliance-monitor': {
    id: 'compliance-monitor', name: 'Compliance Monitor',
    description: 'Tracks licence renewals and regulation changes across your portfolio.',
    minTier: 'standard', costModel: 'included', icon: 'shield',
  },
  'site-feasibility': {
    id: 'site-feasibility', name: 'Site Feasibility',
    description: 'Deep constraint and development-potential analysis for a site.',
    minTier: 'advanced', costModel: 'per-run', icon: 'compass',
  },
  'risk-assessment': {
    id: 'risk-assessment', name: 'Risk Assessment',
    description: 'Flags planning, heritage, and policy risks before you commit.',
    minTier: 'advanced', costModel: 'per-run', icon: 'alert-triangle',
  },
  'comparable-schemes': {
    id: 'comparable-schemes', name: 'Comparable Schemes',
    description: 'Finds and benchmarks similar consented developments nearby.',
    minTier: 'advanced', costModel: 'per-run', icon: 'bar-chart',
  },
  'pre-app-strategy': {
    id: 'pre-app-strategy', name: 'Pre-App Strategy',
    description: 'Drafts a pre-application advice strategy and officer brief.',
    minTier: 'advanced', costModel: 'addon', icon: 'compass',
  },
  'qa-review': {
    id: 'qa-review', name: 'QA Review Agent',
    description: 'Second-pass quality check on outgoing client reports.',
    minTier: 'professional', costModel: 'included', icon: 'check-sq',
  },
  'document-drafting': {
    id: 'document-drafting', name: 'Document Drafting',
    description: 'Drafts design & access statements and supporting documents.',
    minTier: 'professional', costModel: 'per-run', icon: 'edit',
  },
  'appeal-strategy': {
    id: 'appeal-strategy', name: 'Appeal Strategy',
    description: 'Builds an appeal or refusal-response strategy from case data.',
    minTier: 'professional', costModel: 'addon', icon: 'flag',
  },
  'design-compliance-check': {
    id: 'design-compliance-check', name: 'Design Compliance Check',
    description: 'Checks drawings against local design codes automatically.',
    minTier: 'professional', costModel: 'per-run', icon: 'ruler',
  },
  'bulk-portfolio-check': {
    id: 'bulk-portfolio-check', name: 'Bulk Portfolio Check',
    description: 'Runs planning checks across hundreds of addresses via CSV upload.',
    minTier: 'enterprise', costModel: 'per-run', icon: 'upload',
  },
  'api-webhook-agent': {
    id: 'api-webhook-agent', name: 'API & Webhook Agent',
    description: 'Pushes report results directly into your own systems.',
    minTier: 'enterprise', costModel: 'addon', icon: 'code',
  },
}

export function getWorkspaceConfig(actorId: ActorId): WorkspaceConfig {
  return ACTOR_WORKSPACE_MAP[actorId]
}