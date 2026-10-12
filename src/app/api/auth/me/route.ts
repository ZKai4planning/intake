export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import * as authService from '@/lib/server/authService'
import { requireAuth } from '@/lib/server/requireAuth'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { ACCESS_TOKEN_COOKIE } from '@/lib/server/cookies'

const updateMeSchema = z.object({
  name:      z.string().trim().min(1).max(120).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  actorId:   z.enum(['homeowner', 'landlord', 'developer', 'consultant', 'architect', 'business', 'builder']).optional(),
  phone:     z.string().trim().min(1).optional(),
})

export async function GET(req: Request) {
  try {
    const auth = requireAuth(req)
    const profile = await authService.getMe(auth.sub)
    return NextResponse.json(profile)
  } catch (err) {
    return handleRouteError(err)
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = requireAuth(req)
    const patch = updateMeSchema.parse(await req.json())
    const profile = await authService.updateMe(auth.sub, patch)
    return NextResponse.json(profile)
  } catch (err) {
    return handleRouteError(err)
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = requireAuth(req)
    await authService.deleteMe(auth.sub)

    const res = NextResponse.json({ success: true })
    res.cookies.delete(ACCESS_TOKEN_COOKIE)
    return res
  } catch (err) {
    return handleRouteError(err)
  }
}
