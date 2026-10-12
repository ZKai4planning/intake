export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { requireAgentAuth } from '@/lib/server/agent/requireAgentAuth'
import { changeAgentPassword } from '@/lib/server/agent/agentAuthService'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: Request) {
  try {
    const auth = requireAgentAuth()
    const { currentPassword, newPassword } = changePasswordSchema.parse(await req.json())
    const agent = await changeAgentPassword(auth.sub, currentPassword, newPassword)
    return NextResponse.json({ success: true, agent })
  } catch (err) {
    return handleRouteError(err)
  }
}
