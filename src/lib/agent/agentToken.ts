import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../server/env'

export interface AgentTokenPayload {
  sub:   string // agent_users.id
  email: string
  scope: 'agent'
}

export function signAgentToken(payload: Omit<AgentTokenPayload, 'scope'>): string {
  if (!env.agentJwtSecret) throw new Error('AGENT_JWT_SECRET is not set')
  return jwt.sign({ ...payload, scope: 'agent' }, env.agentJwtSecret, { expiresIn: env.agentJwtExpiresIn } as SignOptions)
}

export function verifyAgentToken(token: string): AgentTokenPayload {
  if (!env.agentJwtSecret) throw new Error('AGENT_JWT_SECRET is not set')
  const payload = jwt.verify(token, env.agentJwtSecret) as AgentTokenPayload
  if (payload.scope !== 'agent') throw new Error('Not an agent token')
  return payload
}