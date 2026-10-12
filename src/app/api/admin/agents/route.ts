export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { requireAdminAuth } from '@/lib/server/admin/requireAdminAuth'
import { listAgents, createAgent } from '@/lib/server/admin/adminAgentsService'

const createAgentSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
})

export async function GET() {
  try {
    requireAdminAuth()
    const agents = await listAgents()
    return NextResponse.json({ agents })
  } catch (err) {
    return handleRouteError(err)
  }
}

export async function POST(req: Request) {
  try {
    requireAdminAuth()
    const input = createAgentSchema.parse(await req.json())
    const agent = await createAgent(input)
    return NextResponse.json({ agent })
  } catch (err) {
    return handleRouteError(err)
  }
}
