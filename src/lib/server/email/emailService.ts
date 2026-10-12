import { sendEmail } from './brevoClient'
import { env } from '../env'
import { otpEmail, type OtpPurposeLabel } from './templates/otp'
import { welcomeEmail } from './templates/welcome'
import { passwordResetSuccessEmail } from './templates/passwordResetSuccess'
import { reportGeneratedEmail } from './templates/reportGenerated'
import { consultantBookingConfirmedEmail } from './templates/consultantBookingConfirmed'
import { contactReceivedEmail } from './templates/contactReceived'
import { agentInviteEmail } from './templates/agentInvite'

/**
 * Every function here is fire-and-forget from the caller's point of
 * view: it never throws, and returns void. If Brevo isn't configured
 * (no BREVO_API_KEY) or the send fails, it logs instead — the signup/
 * login/reset flow that triggered the email still succeeds either way.
 * Callers should still `.catch()` when calling these from inside an
 * async chain, purely to stop an unhandled-rejection warning if
 * something unexpected throws — not because failure here should ever
 * surface to the end user.
 */

async function deliver(to: { email: string; name?: string }, template: { subject: string; html: string }, logContext: Record<string, unknown>) {
  const sent = await sendEmail({ to, subject: template.subject, htmlContent: template.html })
  if (sent) {
    console.info('[email] sent via Brevo', { to: to.email, subject: template.subject, ...logContext })
  } else {
    console.info('[email] NOT sent (Brevo not configured or send failed) — logging instead', {
      to: to.email,
      subject: template.subject,
      ...logContext,
      brevoConfigured: !!env.brevo.apiKey,
    })
  }
}

export async function sendOtpEmail(to: string, code: string, purpose: OtpPurposeLabel, expiresMinutes: number) {
  const template = otpEmail({ code, purpose, expiresMinutes })
  await deliver({ email: to }, template, { purpose, code: env.isProd ? '[redacted]' : code })
}

export async function sendWelcomeEmail(to: string, name: string) {
  await deliver({ email: to, name }, welcomeEmail({ name }), {})
}

export async function sendPasswordResetSuccessEmail(to: string, name: string) {
  await deliver({ email: to, name }, passwordResetSuccessEmail({ name }), {})
}

// ── Not used by the auth routes, ported for parity with the backend
// so the rest of the app (reports, consultant bookings, contact form)
// has these ready to call once those flows move over too. ──

export async function sendReportGeneratedEmail(to: string, name: string, reportId: string, tierLabel: string) {
  await deliver({ email: to, name }, reportGeneratedEmail({ name, reportId, tierLabel }), { reportId })
}

export async function sendConsultantBookingConfirmedEmail(
  to: string,
  name: string,
  opts: { isCallback: boolean; date?: string; timeLabel?: string }
) {
  await deliver({ email: to, name }, consultantBookingConfirmedEmail({ name, ...opts }), {})
}

export async function sendContactReceivedEmail(to: string, name: string) {
  await deliver({ email: to, name }, contactReceivedEmail({ name }), {})
}

/**
 * Sent once, right when an admin provisions a new agentx account —
 * see adminAgentsService.createAgent and its resendInvite sibling
 * (which calls this again with a freshly-generated temp password if
 * the original email never arrived or was lost).
 */
export async function sendAgentInviteEmail(to: string, name: string, tempPassword: string) {
  await deliver({ email: to, name }, agentInviteEmail({ name, email: to, tempPassword }), {})
}
