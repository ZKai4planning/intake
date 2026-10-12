import { cookies } from 'next/headers'
import * as Sentry from '@sentry/nextjs'
import { ApiError } from '../apiError'
import { verifyAgentToken, type AgentTokenPayload } from './agentToken'
import { AGENT_TOKEN_COOKIE } from './agentCookies'

export function requireAgentAuth(): AgentTokenPayload {
  const token = cookies().get(AGENT_TOKEN_COOKIE)?.value
  if (!token) throw ApiError.unauthorized('Not logged in to the agent portal')

  try {
    const payload = verifyAgentToken(token)
    Sentry.setUser({ id: payload.sub, email: payload.email, role: 'agent' })
    Sentry.setTag('agent_portal', true)
    return payload
  } catch {
    throw ApiError.unauthorized('Agent session expired or invalid — please log in again')
  }
}
