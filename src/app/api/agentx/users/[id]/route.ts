export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { requireAgentAuth } from '@/lib/server/agent/requireAgentAuth'
import { getUser } from '@/lib/server/admin/adminUsersService'
import { listProjectsForUser } from '@/lib/server/projectsService'
import { handleRouteError } from '@/lib/server/handleRouteError'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    requireAgentAuth()
    const [user, projects] = await Promise.all([
      getUser(params.id),
      listProjectsForUser(params.id),
    ])
    return NextResponse.json({ user, projects })
  } catch (err) {
    return handleRouteError(err)
  }
}
