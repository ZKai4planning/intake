import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from './env'

export interface AuthTokenPayload {
  sub: string // user id
  email: string
  role: 'consumer' | 'b2b' | 'consultant' | 'admin'
}

export function signAccessToken(payload: AuthTokenPayload): string {
  if (!env.jwtSecret) throw new Error('JWT_SECRET is not set')
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as SignOptions)
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  if (!env.jwtSecret) throw new Error('JWT_SECRET is not set')
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload
}
