export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { requireAgentAuth } from '@/lib/server/agent/requireAgentAuth'
import { listUsers } from '@/lib/server/admin/adminUsersService'
import { handleRouteError } from '@/lib/server/handleRouteError'

// Read-only from agentx — no PATCH/DELETE route here. An agent can see
// and act on projects for a user, but editing/deleting the account
// itself stays an admin-only capability (see /api/admin/users/[id]).
export async function GET(req: Request) {
  try {
    requireAgentAuth()
    const { searchParams } = new URL(req.url)
    const result = await listUsers({
      search: searchParams.get('search') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    })
    return NextResponse.json(result)
  } catch (err) {
    return handleRouteError(err)
  }
}
