import { env } from './env'

export const ACCESS_TOKEN_COOKIE = 'accessToken'

export const ACCESS_TOKEN_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days, in seconds (NextResponse cookies API uses seconds, not ms)
}
