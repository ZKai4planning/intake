export const runtime = 'nodejs'
export const revalidate = 900

import { NextResponse } from 'next/server'
import { getNews } from '@/lib/news'

/** GET /api/news?limit=10 — same data the ticker and /updates page use. */
export async function GET(req: Request) {
  const limit = Math.min(Math.max(Number(new URL(req.url).searchParams.get('limit')) || 12, 1), 50)
  const data = await getNews(limit)
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' },
  })
}
