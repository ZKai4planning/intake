export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { requireAdminAuth } from '@/lib/server/admin/requireAdminAuth'
import { deleteAgent } from '@/lib/server/admin/adminAgentsService'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdminAuth()
    await deleteAgent(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleRouteError(err)
  }
}
