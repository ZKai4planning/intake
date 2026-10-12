export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/server/requireAuth'
import { handleRouteError } from '@/lib/server/handleRouteError'
import * as projectsService from '@/lib/server/projectsService'
import type { IntakeUpsertInput } from '@/lib/server/projectsService'

export async function GET(req: Request) {
  try {
    const auth = requireAuth(req)
    const projects = await projectsService.listProjectsForUser(auth.sub)
    return NextResponse.json({ projects })
  } catch (err) {
    return handleRouteError(err)
  }
}

// Loose on purpose — the frontend Project shape is still evolving and
// is validated client-side already; the server just needs an id to
// key the upsert on. See projectsService.ts's `data` blob note.
const upsertProjectSchema = z
  .object({ id: z.string().trim().min(1, 'id is required') })
  .passthrough()

export async function POST(req: Request) {
  try {
    const auth = requireAuth(req)
    const body = upsertProjectSchema.parse(await req.json())
    // upsertProjectSchema only validates `id`; the rest of the shape is
    // trusted from the client (see comment above). Not a runtime guarantee,
    // just satisfying the compiler for the loosely-validated passthrough body.
    const project = await projectsService.saveDraft(auth.sub, body as unknown as IntakeUpsertInput)
    return NextResponse.json({ project }, { status: 201 })
  } catch (err) {
    return handleRouteError(err)
  }
}