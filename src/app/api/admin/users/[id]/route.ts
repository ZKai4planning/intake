export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminAuth } from '@/lib/server/admin/requireAdminAuth'
import { getUser, updateUser, deleteUser } from '@/lib/server/admin/adminUsersService'
import { handleRouteError } from '@/lib/server/handleRouteError'

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  role: z.enum(['consumer', 'b2b', 'consultant', 'admin']).optional(),
  phone: z.string().trim().min(1).optional(),
})

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdminAuth()
    const user = await getUser(params.id)
    return NextResponse.json({ user })
  } catch (err) {
    return handleRouteError(err)
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdminAuth()
    const patch = updateSchema.parse(await req.json())
    const user = await updateUser(params.id, patch)
    return NextResponse.json({ user })
  } catch (err) {
    return handleRouteError(err)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdminAuth()
    await deleteUser(params.id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleRouteError(err)
  }
}
