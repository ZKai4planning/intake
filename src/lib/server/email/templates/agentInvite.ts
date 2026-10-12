import { renderLayout, button, escapeHtml } from './layout'
import { env } from '../../env'

/**
 * Sent when an admin provisions a new agentx account (see
 * adminAgentsService.createAgent). Carries the one-time temporary
 * password in plain text — acceptable here the same way a password-
 * reset email is: it's a single email to a known internal recipient,
 * expires functionally the moment they log in and are forced to set
 * their own password (must_reset_password), and is never logged or
 * stored anywhere after hashing.
 */
export function agentInviteEmail(opts: { name: string; email: string; tempPassword: string }): { subject: string; html: string } {
  const firstName = opts.name.split(' ')[0] || 'there'

  const bodyHtml = `
    <h1 style="font-family:'Fraunces',Georgia,serif;font-size:22px;font-weight:600;margin:0 0 12px;color:#0A0E1A;">You've been added to the AI4Planning agent portal</h1>
    <p style="margin:0 0 4px;">Hi ${escapeHtml(firstName)}, an admin has set up an agent account for you. Use these details to sign in — you'll be asked to choose your own password right away.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;width:100%;background-color:#F3F5FA;border-radius:8px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:13px;color:#5A6A8A;">Email</p>
          <p style="margin:0 0 14px;font-size:15px;font-weight:600;color:#0A0E1A;">${escapeHtml(opts.email)}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#5A6A8A;">Temporary password</p>
          <p style="margin:0;font-family:'Courier New',monospace;font-size:16px;font-weight:700;letter-spacing:0.05em;color:#0A0E1A;">${escapeHtml(opts.tempPassword)}</p>
        </td>
      </tr>
    </table>
    ${button('Sign in to the agent portal', `${env.appOrigin}/agentx/login`)}
    <p style="margin:0;color:#5A6A8A;font-size:13px;">This password only works for your first sign-in — you'll be prompted to set a new one immediately after.</p>
  `

  return {
    subject: 'Your AI4Planning agent account is ready',
    html: renderLayout({ preheader: `Your temporary password: ${opts.tempPassword}`, bodyHtml }),
  }
}
