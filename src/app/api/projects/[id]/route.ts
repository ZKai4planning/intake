export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/server/requireAuth'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { ApiError } from '@/lib/server/apiError'
import * as projectsService from '@/lib/server/projectsService'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(req)
    const project = await projectsService.getProjectById(params.id)
    if (project.userId !== auth.sub) throw ApiError.forbidden('This project belongs to a different account')
    return NextResponse.json({ project })
  } catch (err) {
    return handleRouteError(err)
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(req)
    const project = await projectsService.getProjectById(params.id)
    if (project.userId !== auth.sub) throw ApiError.forbidden('This project belongs to a different account')
    await projectsService.deleteProject(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return handleRouteError(err)
  }
}