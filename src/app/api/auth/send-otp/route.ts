export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import * as authService from '@/lib/server/authService'
import { handleRouteError } from '@/lib/server/handleRouteError'

const sendOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
})

/**
 * One endpoint, no `intent` from the client: we look the email up
 * ourselves and issue a signup code for a new address or a login code
 * for a known one, in a single request. See authService.sendOtp.
 */
export async function POST(req: Request) {
  try {
    const { email } = sendOtpSchema.parse(await req.json())
    const result = await authService.sendOtp(email)
    return NextResponse.json(result)
  } catch (err) {
    return handleRouteError(err)
  }
}
