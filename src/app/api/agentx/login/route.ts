export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { agentLogin } from '@/lib/server/agent/agentAuthService'
import { AGENT_TOKEN_COOKIE, AGENT_TOKEN_COOKIE_OPTS } from '@/lib/server/agent/agentCookies'

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(req: Request) {
  try {
    const { email, password } = loginSchema.parse(await req.json())
    const { token, agent } = await agentLogin(email, password)

    const res = NextResponse.json({ success: true, agent })
    res.cookies.set(AGENT_TOKEN_COOKIE, token, AGENT_TOKEN_COOKIE_OPTS)
    return res
  } catch (err) {
    return handleRouteError(err)
  }
}
