export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminAuth } from '@/lib/server/admin/requireAdminAuth'
import { updateBookingStatus } from '@/lib/server/admin/adminBookingsService'
import { handleRouteError } from '@/lib/server/handleRouteError'

const updateSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed']),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdminAuth()
    const { status } = updateSchema.parse(await req.json())
    const booking = await updateBookingStatus(params.id, status)
    return NextResponse.json({ booking })
  } catch (err) {
    return handleRouteError(err)
  }
}
