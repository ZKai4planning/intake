export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import * as authService from '@/lib/server/authService'
import { handleRouteError } from '@/lib/server/handleRouteError'

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
})

export async function POST(req: Request) {
  try {
    const { email } = forgotPasswordSchema.parse(await req.json())
    const result = await authService.forgotPassword(email)
    return NextResponse.json(result)
  } catch (err) {
    return handleRouteError(err)
  }
}
