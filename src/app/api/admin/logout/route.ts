export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { ADMIN_TOKEN_COOKIE } from '@/lib/server/admin/adminCookies'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete(ADMIN_TOKEN_COOKIE)
  return res
}
