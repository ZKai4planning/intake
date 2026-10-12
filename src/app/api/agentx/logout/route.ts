export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { AGENT_TOKEN_COOKIE } from '@/lib/server/agent/agentCookies'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete(AGENT_TOKEN_COOKIE)
  return res
}
