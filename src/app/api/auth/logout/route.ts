export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { ACCESS_TOKEN_COOKIE } from '@/lib/server/cookies'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete(ACCESS_TOKEN_COOKIE)
  return res
}
