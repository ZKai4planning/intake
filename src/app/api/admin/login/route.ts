export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { adminLogin } from '@/lib/server/admin/adminAuthService'
import { ADMIN_TOKEN_COOKIE, ADMIN_TOKEN_COOKIE_OPTS } from '@/lib/server/admin/adminCookies'

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(req: Request) {
  try {
    const { email, password } = loginSchema.parse(await req.json())
    const { token, admin } = await adminLogin(email, password)

    const res = NextResponse.json({ success: true, admin })
    res.cookies.set(ADMIN_TOKEN_COOKIE, token, ADMIN_TOKEN_COOKIE_OPTS)
    return res
  } catch (err) {
    return handleRouteError(err)
  }
}
