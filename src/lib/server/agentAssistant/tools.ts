import crypto from 'node:crypto'
import type { AgentAssistantSurface } from '@/lib/agentAssistant/actions'
import { listUsers } from '../admin/adminUsersService'
import { listOrders } from '../admin/adminOrdersService'
import { listReports } from '../admin/adminReportsService'
import { getDashboardStats } from '../admin/adminDashboardService'
import { createAgent as createAgentAccount, resendAgentInvite as resendAgentInviteByRow, listAgents } from '../admin/adminAgentsService'
import { saveDraft } from '../projectsService'
import { checkAssistantRateLimit } from './rateLimit'

export interface AssistantAuthCtx {
  surface: AgentAssistantSurface
  actorId: string
  actorEmail: string
}

type JsonSchema = Record<string, unknown>

export interface ReadTool {
  name: string
  description: string
  parameters: JsonSchema
  /** Runs immediately (no confirmation) and returns JSON fed straight back to the model as the tool result. */
  run: (args: Record<string, any>, ctx: AssistantAuthCtx) => Promise<unknown>
}

export interface WriteTool {
  name: string
  description: string
  parameters: JsonSchema
  /** Human-readable confirmation prompt shown to the person before this ever executes. */
  summarize: (args: Record<string, any>) => string
  /** Only ever called from /api/agent-assistant/execute, after the person has explicitly confirmed. */
  execute: (args: Record<string, any>, ctx: AssistantAuthCtx) => Promise<{ resultSummary: string; navigateTo?: string }>
}

// ── Admin tools ──────────────────────────────────────────────────

const adminSearchUsers: ReadTool = {
  name: 'search_users',
  description: "Search customer accounts by name. Use this to find a specific person before referencing or acting on their account.",
  parameters: {
    type: 'object',
    properties: { query: { type: 'string', description: 'Name (or part of it) to search for.' } },
    required: ['query'],
  },
  run: async args => {
    const { users, total } = await listUsers({ search: String(args.query ?? ''), limit: 5 })
    return { total, users: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })) }
  },
}

const adminListStalledOrders: ReadTool = {
  name: 'list_stalled_orders',
  description: 'List the most recent orders stuck at PENDING or FAILED — checkouts that started but never completed.',
  parameters: { type: 'object', properties: {} },
  run: async () => {
    const { orders, total } = await listOrders({ incompleteOnly: true, limit: 10 })
    return {
      total,
      orders: orders.map(o => ({
        merchantOrderRef: o.merchantOrderRef, status: o.status, amount: o.amount, currency: o.currency,
        userName: o.userName, userEmail: o.userEmail, createdAt: o.createdAt,
      })),
    }
  },
}

const adminListReportsNeedingFollowUp: ReadTool = {
  name: 'list_reports_needing_followup',
  description: 'List paid-tier reports that were generated but never unlocked — stalled at the paywall.',
  parameters: { type: 'object', properties: {} },
  run: async () => {
    const { reports, total } = await listReports({ status: 'incomplete' })
    return {
      total,
      reports: reports.slice(0, 10).map(r => ({ id: r.id, tier: r.tier, ownerName: r.ownerName, ownerEmail: r.ownerEmail, createdAt: r.createdAt })),
    }
  },
}

const adminGetStats: ReadTool = {
  name: 'get_admin_stats',
  description:
    "Get real counts across the whole app — total users, total orders, completed orders, total revenue, bookings, confirmed bookings, reports, cart items, stalled/incomplete orders, and reports needing follow-up. Use this for ANY 'how many' / count / total question — e.g. how many users, how many open orders, how many bookings — instead of navigating to the page that lists them.",
  parameters: { type: 'object', properties: {} },
  run: async () => getDashboardStats(),
}

const adminCreateAgentAccount: WriteTool = {
  name: 'create_agent_account',
  description:
    "Provision a new agentx (internal agent) account. Only call this once you have both a name and a real email address explicitly stated by the person — never invent either.",
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: "The new agent's full name." },
      email: { type: 'string', description: "The new agent's email address." },
    },
    required: ['name', 'email'],
  },
  summarize: args => `Create an agentx account for **${args.name}** (${args.email})? They'll get an email with a one-time temporary password.`,
  execute: async (args, ctx) => {
    await checkAssistantRateLimit({ tool: 'create_agent_account', actorId: ctx.actorId, windowMinutes: 60, maxCalls: 10 })
    const agent = await createAgentAccount({ name: String(args.name), email: String(args.email) })
    return {
      resultSummary: `Done — an invite with a temporary password has been sent to ${agent.email}.`,
      navigateTo: '/admin/agents',
    }
  },
}

const adminResendAgentInvite: WriteTool = {
  name: 'resend_agent_invite',
  description: "Re-issue a temporary password and resend the invite email to an existing agentx account, identified by email.",
  parameters: {
    type: 'object',
    properties: { email: { type: 'string', description: 'The agent account email to resend the invite to.' } },
    required: ['email'],
  },
  summarize: args => `Resend the invite email to **${args.email}** with a fresh temporary password?`,
  execute: async (args, ctx) => {
    const email = String(args.email).trim().toLowerCase()
    await checkAssistantRateLimit({ tool: 'resend_agent_invite', actorId: ctx.actorId, windowMinutes: 60, maxCalls: 10 })
    await checkAssistantRateLimit({
      tool: 'resend_agent_invite',
      actorId: ctx.actorId,
      windowMinutes: 60,
      maxCalls: 3,
      targetField: { key: 'email', value: email },
    })
    const agents = await listAgents()
    const match = agents.find(a => a.email.toLowerCase() === email)
    if (!match) return { resultSummary: `I couldn't find an agent account with the email ${email}.` }
    await resendAgentInviteByRow(match.id)
    return { resultSummary: `Done — a new temporary password has been sent to ${email}.`, navigateTo: '/admin/agents' }
  },
}

// ── Agentx tools ─────────────────────────────────────────────────

const agentxSearchUsers: ReadTool = {
  name: 'search_users',
  description: "Search the customers this agent portal manages projects for, by name. Use this to resolve WHICH user's project to create when the page context doesn't already say.",
  parameters: {
    type: 'object',
    properties: { query: { type: 'string', description: 'Name (or part of it) to search for.' } },
    required: ['query'],
  },
  run: async args => {
    const { users, total } = await listUsers({ search: String(args.query ?? ''), limit: 5 })
    return { total, users: users.map(u => ({ id: u.id, name: u.name, email: u.email })) }
  },
}

const agentxCountUsers: ReadTool = {
  name: 'count_users',
  description: "Get the total number of customers this agent portal manages. Use this for a 'how many users/customers' question instead of navigating to the users list.",
  parameters: { type: 'object', properties: {} },
  run: async () => {
    const { total } = await listUsers({ limit: 1 })
    return { totalUsers: total }
  },
}

const agentxCreateProject: WriteTool = {
  name: 'create_project',
  description:
    "Create a new project/application for a specific customer. If the current page context already names a user, its id is used automatically — do not ask for it again in that case. Otherwise, call search_users first to find the right person and pass their id as userId. Never invent a userId. actorId and tier are optional — sensible defaults are used if omitted.",
  parameters: {
    type: 'object',
    properties: {
      userId: { type: 'string', description: 'The id of an existing user, from page context or a prior search_users call. Required unless the page context already supplies one.' },
      userName: { type: 'string', description: "The user's display name, ONLY if already known (e.g. from search_users), purely so the confirmation message reads naturally. Never fabricate this." },
      actorId: { type: 'string', enum: ['homeowner', 'landlord', 'developer', 'consultant', 'architect', 'business', 'builder'], description: 'Who the project is for. Defaults to homeowner if not stated.' },
      tier: { type: 'string', enum: ['simple', 'standard', 'advanced', 'professional', 'enterprise'], description: 'Eligibility question set. Defaults to standard if not stated.' },
    },
    required: [],
  },
  summarize: args => {
    const who = args.userName ? String(args.userName) : args.userId ? `user ${String(args.userId).slice(0, 8)}…` : 'this user'
    const tier = args.tier ?? 'standard'
    const actor = args.actorId ?? 'homeowner'
    return `Create a new **${tier}** project (${actor}) for **${who}**?`
  },
  execute: async args => {
    if (!args.userId) return { resultSummary: "I don't have a specific user to create this for — open their page first, or tell me their name so I can search." }
    const project = await saveDraft(String(args.userId), {
      id: crypto.randomUUID(),
      actorId: (args.actorId as any) ?? 'homeowner',
      tier: (args.tier as any) ?? 'standard',
      answers: {},
    })
    return { resultSummary: 'Done — the project has been created.', navigateTo: `/agentx/projects/${project.id}` }
  },
}

// ── Registries ───────────────────────────────────────────────────

export const READ_TOOLS: Record<AgentAssistantSurface, ReadTool[]> = {
  customer: [],
  admin: [adminSearchUsers, adminListStalledOrders, adminListReportsNeedingFollowUp, adminGetStats],
  agentx: [agentxSearchUsers, agentxCountUsers],
}

export const WRITE_TOOLS: Record<AgentAssistantSurface, WriteTool[]> = {
  customer: [],
  admin: [adminCreateAgentAccount, adminResendAgentInvite],
  agentx: [agentxCreateProject],
}

export function findReadTool(surface: AgentAssistantSurface, name: string): ReadTool | undefined {
  return READ_TOOLS[surface].find(t => t.name === name)
}

export function findWriteTool(surface: AgentAssistantSurface, name: string): WriteTool | undefined {
  return WRITE_TOOLS[surface].find(t => t.name === name)
}
