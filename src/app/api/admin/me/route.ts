export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/server/admin/requireAdminAuth'
import { getAdminProfile } from '@/lib/server/admin/adminAuthService'
import { handleRouteError } from '@/lib/server/handleRouteError'

export async function GET() {
  try {
    const auth = requireAdminAuth()
    const admin = await getAdminProfile(auth.sub)
    return NextResponse.json({ admin })
  } catch (err) {
    return handleRouteError(err)
  }
}
