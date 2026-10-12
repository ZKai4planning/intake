export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/server/requireAuth'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { bookConsultation } from '@/lib/server/consultantService'

const bookConsultationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('consultation'),
    projectId: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
    timeSlotId: z.enum(['morning', 'afternoon']),
    notes: z.string().max(1000).optional(),
  }),
  z.object({
    type: z.literal('callback'),
    projectId: z.string().optional(),
    notes: z.string().max(1000).optional(),
  }),
])

export async function POST(req: Request) {
  try {
    const auth = requireAuth(req)
    const input = bookConsultationSchema.parse(await req.json())
    const booking = await bookConsultation(auth.sub, input)
    return NextResponse.json({ booking }, { status: 201 })
  } catch (err) {
    return handleRouteError(err)
  }
}
