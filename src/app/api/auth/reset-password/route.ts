export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import * as authService from '@/lib/server/authService'
import { handleRouteError } from '@/lib/server/handleRouteError'

const resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().trim().length(6, 'Enter the 6-digit code'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: Request) {
  try {
    const { email, code, password } = resetPasswordSchema.parse(await req.json())
    const result = await authService.resetPassword(email, code, password)
    return NextResponse.json(result)
  } catch (err) {
    return handleRouteError(err)
  }
}
