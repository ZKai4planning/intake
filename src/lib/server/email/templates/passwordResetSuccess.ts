import { renderLayout, escapeHtml } from './layout'

export function passwordResetSuccessEmail(opts: { name: string }): { subject: string; html: string } {
  const firstName = opts.name.split(' ')[0] || 'there'

  const bodyHtml = `
    <h1 style="font-family:'Fraunces',Georgia,serif;font-size:22px;font-weight:600;margin:0 0 12px;color:#0A0E1A;">Your password was changed</h1>
    <p style="margin:0 0 4px;">Hi ${escapeHtml(firstName)} — this confirms your AI4Planning password was just reset.</p>
    <p style="margin:16px 0 0;padding:14px 16px;background-color:#FEF3C7;border-radius:8px;color:#0A0E1A;font-size:13px;">
      Wasn't you? Reset your password again immediately using "Forgot password" on the login page, and get in touch so we can look into it.
    </p>
  `

  return {
    subject: 'Your AI4Planning password was changed',
    html: renderLayout({ preheader: 'Your password was just changed.', bodyHtml }),
  }
}
