export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import type { AgentAssistantSurface } from '@/lib/agentAssistant/actions'
import { findWriteTool, type AssistantAuthCtx } from '@/lib/server/agentAssistant/tools'
import { logAssistantAction } from '@/lib/server/agentAssistant/auditLog'
import { requireAdminAuth } from '@/lib/server/admin/requireAdminAuth'
import { requireAgentAuth } from '@/lib/server/agent/requireAgentAuth'
import { requireAuth } from '@/lib/server/requireAuth'
import { ApiError } from '@/lib/server/apiError'

/**
 * POST /api/agent-assistant/execute
 * ────────────────────────────────────
 * The only place a write tool from tools.ts actually runs. /ask never
 * calls execute() itself — it only ever returns a `pendingConfirmation`
 * describing what it WOULD do. This route re-derives auth completely
 * independently (never trusts the client's `surface`/role claim) and
 * re-validates that the requested tool actually belongs to that
 * surface before running it, so nothing the model said earlier is
 * taken on faith here.
 */

const SURFACES: AgentAssistantSurface[] = ['customer', 'admin', 'agentx']

function requireSurfaceAuth(surface: AgentAssistantSurface, req: NextRequest): AssistantAuthCtx {
  if (surface === 'admin') {
    const admin = requireAdminAuth()
    return { surface, actorId: admin.sub, actorEmail: admin.email }
  }
  if (surface === 'agentx') {
    const agent = requireAgentAuth()
    return { surface, actorId: agent.sub, actorEmail: agent.email }
  }
  const user = requireAuth(req)
  return { surface, actorId: user.sub, actorEmail: user.email }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const surface: AgentAssistantSurface = SURFACES.includes(body?.surface) ? body.surface : 'customer'
  const toolName: string = typeof body?.tool === 'string' ? body.tool : ''
  const args: Record<string, unknown> = body?.args && typeof body.args === 'object' ? body.args : {}

  let ctx: AssistantAuthCtx
  try {
    ctx = requireSurfaceAuth(surface, req)
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401
    const message = err instanceof ApiError ? err.message : 'Not logged in.'
    return NextResponse.json({ error: message }, { status })
  }

  const tool = findWriteTool(surface, toolName)
  if (!tool) {
    return NextResponse.json({ error: `"${toolName}" isn't an action available here.` }, { status: 400 })
  }

  try {
    const { resultSummary, navigateTo } = await tool.execute(args, ctx)
    await logAssistantAction({ surface, actorId: ctx.actorId, actorEmail: ctx.actorEmail, tool: tool.name, args, resultSummary })
    return NextResponse.json({ resultSummary, navigateTo })
  } catch (err) {
    console.error('[/api/agent-assistant/execute] error:', err)
    const message = err instanceof ApiError ? err.message : 'That action failed — please try again.'
    const status = err instanceof ApiError ? err.status : 500
    return NextResponse.json({ error: message }, { status })
  }
}
