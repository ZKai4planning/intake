export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { requireAgentAuth } from '@/lib/server/agent/requireAgentAuth'
import { getAgentProfile } from '@/lib/server/agent/agentAuthService'
import { handleRouteError } from '@/lib/server/handleRouteError'

export async function GET() {
  try {
    const auth = requireAgentAuth()
    const agent = await getAgentProfile(auth.sub)
    return NextResponse.json({ agent })
  } catch (err) {
    return handleRouteError(err)
  }
}
