export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { listGoals } from '@/lib/server/search/searchService'

export async function GET() {
  return NextResponse.json(listGoals())
}
