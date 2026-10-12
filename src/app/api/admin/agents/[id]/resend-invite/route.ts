export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { requireAdminAuth } from '@/lib/server/admin/requireAdminAuth'
import { resendAgentInvite } from '@/lib/server/admin/adminAgentsService'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdminAuth()
    const agent = await resendAgentInvite(params.id)
    return NextResponse.json({ agent })
  } catch (err) {
    return handleRouteError(err)
  }
}
