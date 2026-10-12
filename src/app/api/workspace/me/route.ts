export const runtime = 'nodejs'
// Reads request.headers directly (beyond what requireAuth already
// covers via cookies()) — force dynamic explicitly, same reasoning as
// consultant/availability.
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { requireAuth } from '@/lib/server/requireAuth'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { getWorkspaceMe } from '@/lib/server/workspaceService'
import { ACCESS_TOKEN_COOKIE } from '@/lib/server/cookies'

export async function GET(req: Request) {
  try {
    const auth = requireAuth(req)

    // Echo back the same bearer token the caller sent — this endpoint
    // doesn't mint a new one, it just needs to fill
    // WorkspaceSession.accessToken for frontend parity (see
    // workspaceService.ts). Same precedence as requireAuth: header first,
    // then the cookie.
    const header = req.headers.get('authorization')
    const token = header?.startsWith('Bearer ')
      ? header.slice('Bearer '.length)
      : cookies().get(ACCESS_TOKEN_COOKIE)?.value ?? ''

    const data = await getWorkspaceMe(auth.sub, token)

    // IMPORTANT: send `data` directly, not `{ data }` — see the long
    // comment on getWorkspaceMe in workspaceService.ts for why this
    // specific shape matters here more than it does on other routes.
    return NextResponse.json(data)
  } catch (err) {
    return handleRouteError(err)
  }
}
