import { renderLayout, codeBlock, escapeHtml } from './layout'

export type OtpPurposeLabel = 'login' | 'signup' | 'reset_password'

const COPY: Record<OtpPurposeLabel, { subject: string; heading: string; blurb: string }> = {
  login: {
    subject: 'Your AI4Planning login code',
    heading: 'Log in to AI4Planning',
    blurb: 'Enter this code to finish logging in.',
  },
  signup: {
    subject: 'Your AI4Planning verification code',
    heading: "Let's verify it's you",
    blurb: 'Enter this code to finish creating your account.',
  },
  reset_password: {
    subject: 'Your AI4Planning password reset code',
    heading: 'Reset your password',
    blurb: "Enter this code to set a new password. If you didn't request this, you can safely ignore this email.",
  },
}

export function otpEmail(opts: { code: string; purpose: OtpPurposeLabel; expiresMinutes: number }): { subject: string; html: string } {
  const copy = COPY[opts.purpose]

  const bodyHtml = `
    <h1 style="font-family:'Fraunces',Georgia,serif;font-size:22px;font-weight:600;margin:0 0 12px;color:#0A0E1A;">${escapeHtml(copy.heading)}</h1>
    <p style="margin:0 0 4px;">${escapeHtml(copy.blurb)}</p>
    ${codeBlock(opts.code)}
    <p style="margin:0;color:#5A6A8A;font-size:13px;">This code expires in ${opts.expiresMinutes} minutes. Didn't request this? You can ignore this email.</p>
  `

  return {
    subject: copy.subject,
    html: renderLayout({ preheader: `Your code: ${opts.code}`, bodyHtml }),
  }
}
