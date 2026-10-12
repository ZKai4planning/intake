import { env } from '../env'

export const ADMIN_TOKEN_COOKIE = 'adminAccessToken'

export const ADMIN_TOKEN_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 12 * 60 * 60, // 12 hours, in seconds — matches adminJwtExpiresIn's default
}
