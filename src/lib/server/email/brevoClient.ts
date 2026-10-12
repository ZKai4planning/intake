import * as Sentry from '@sentry/nextjs'
import { env } from '../env'

/**
 * Brevo's Transactional Email API (not the SMTP relay) —
 * developers.brevo.com/reference/sendtransacemail. One HTTP call, auth
 * via an `api-key` header rather than SMTP credentials — simpler to
 * wire up and doesn't need a persistent connection/transport, which
 * also suits a serverless function nicely (no connection pooling to
 * manage).
 *
 * Never throws into its caller — email delivery failing should never
 * break a signup, password reset, etc. Returns true/false; callers log
 * a warning on false and move on. If BREVO_API_KEY isn't set, this
 * returns false immediately without attempting a network call, so the
 * whole app still works end-to-end with email "delivery" just landing
 * in the server logs instead.
 *
 * This is designed to fail gracefully (the caller never sees the
 * failure), which means it can ALSO fail silently forever unless
 * something reports it — every failure is also sent to Sentry, same
 * as the backend, so a broken Brevo key doesn't go unnoticed.
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

export interface SendEmailInput {
  to: { email: string; name?: string }
  subject: string
  htmlContent: string
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  if (!env.brevo.apiKey) return false

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'api-key': env.brevo.apiKey,
      },
      body: JSON.stringify({
        sender: { email: env.brevo.senderEmail, name: env.brevo.senderName },
        to: [input.to],
        subject: input.subject,
        htmlContent: input.htmlContent,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.warn('[email] Brevo send failed', { status: res.status, body, to: input.to.email })
      Sentry.captureMessage('Brevo email send failed', {
        level: 'warning',
        tags: { module: 'email', provider: 'brevo' },
        extra: { status: res.status, subject: input.subject },
      })
      return false
    }
    return true
  } catch (err) {
    console.warn('[email] Brevo request failed', { err: err instanceof Error ? err.message : err, to: input.to.email })
    Sentry.captureException(err, { tags: { module: 'email', provider: 'brevo' }, extra: { subject: input.subject } })
    return false
  }
}
