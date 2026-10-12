export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import * as authService from '@/lib/server/authService'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_COOKIE_OPTS } from '@/lib/server/cookies'

const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().trim().length(6, 'Enter the 6-digit code'),
})

export async function POST(req: Request) {
  try {
    const { email, code } = verifyOtpSchema.parse(await req.json())
    const result = await authService.verifyOtp(email, code)

    const res = NextResponse.json(result)
    res.cookies.set(ACCESS_TOKEN_COOKIE, result.accessToken, ACCESS_TOKEN_COOKIE_OPTS)
    return res
  } catch (err) {
    return handleRouteError(err)
  }
}
