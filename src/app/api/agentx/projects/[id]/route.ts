export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { requireAgentAuth } from '@/lib/server/agent/requireAgentAuth'
import { handleRouteError } from '@/lib/server/handleRouteError'


import { projectPatchSchema } from '@/lib/projectsValidators'
import { deleteProject, getProjectById, patchProject } from '@/lib/projectsService'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    requireAgentAuth()
    const project = await getProjectById(params.id)
    return NextResponse.json({ project })
  } catch (err) {
    return handleRouteError(err)
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    requireAgentAuth()
    const patch = projectPatchSchema.parse(await req.json())
    const project = await patchProject(params.id, patch)
    return NextResponse.json({ project })
  } catch (err) {
    return handleRouteError(err)
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    requireAgentAuth()
    await deleteProject(params.id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return handleRouteError(err)
  }
}
