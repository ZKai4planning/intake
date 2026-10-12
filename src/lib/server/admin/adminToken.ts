import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../env'

export interface AdminTokenPayload {
  sub:   string // admin_users.id
  email: string
  scope: 'admin' // present so an admin token can never be mistaken for/misused as a customer AuthTokenPayload even if someone tried passing one to the wrong verify function
}

export function signAdminToken(payload: Omit<AdminTokenPayload, 'scope'>): string {
  if (!env.adminJwtSecret) throw new Error('ADMIN_JWT_SECRET is not set')
  return jwt.sign({ ...payload, scope: 'admin' }, env.adminJwtSecret, { expiresIn: env.adminJwtExpiresIn } as SignOptions)
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  if (!env.adminJwtSecret) throw new Error('ADMIN_JWT_SECRET is not set')
  const payload = jwt.verify(token, env.adminJwtSecret) as AdminTokenPayload
  if (payload.scope !== 'admin') throw new Error('Not an admin token')
  return payload
}
