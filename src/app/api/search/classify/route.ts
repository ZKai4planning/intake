export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { classifyQuery } from '@/lib/server/search/searchService'

const classifySchema = z.object({
  query: z.string().trim().min(1).max(300),
})

export async function POST(req: Request) {
  try {
    const { query } = classifySchema.parse(await req.json())
    return NextResponse.json(classifyQuery(query))
  } catch (err) {
    return handleRouteError(err)
  }
}
