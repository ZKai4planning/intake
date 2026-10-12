export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAgentAuth } from '@/lib/server/agent/requireAgentAuth'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { ApiError } from '@/lib/server/apiError'
import { intakeUpsertSchema } from '@/lib/server/projectsValidators'
import { listProjectsForUser, saveDraft } from '@/lib/server/projectsService'

// GET /api/agentx/projects?userId=... — a specific user's projects.
// (No "list every project across every user" mode — an agent works
// through a specific user, found via /api/agentx/users first.)
export async function GET(req: Request) {
  try {
    requireAgentAuth()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    if (!userId) throw ApiError.badRequest('userId query param is required')

    const projects = await listProjectsForUser(userId)
    return NextResponse.json({ projects })
  } catch (err) {
    return handleRouteError(err)
  }
}

// POST /api/agentx/projects — same body as the customer's own
// /api/intake/draft, plus a required `userId` naming whose project
// this is (the agent isn't the owner, so it can't come from the
// caller's own identity the way it does for the customer route).
const agentDraftSchema = intakeUpsertSchema.extend({
  userId: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    requireAgentAuth()
    const { userId, ...input } = agentDraftSchema.parse(await req.json())
    const project = await saveDraft(userId, input)
    return NextResponse.json({ project }, { status: 201 })
  } catch (err) {
    return handleRouteError(err)
  }
}
