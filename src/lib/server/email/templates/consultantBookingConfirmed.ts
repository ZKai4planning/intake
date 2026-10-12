import { renderLayout, escapeHtml } from './layout'

export function consultantBookingConfirmedEmail(opts: {
  name: string
  isCallback: boolean
  date?: string
  timeLabel?: string
}): { subject: string; html: string } {
  const firstName = opts.name.split(' ')[0] || 'there'

  const whenHtml = opts.isCallback
    ? `<p style="margin:0 0 4px;">We've got your callback request — someone from the team will ring you shortly.</p>`
    : `<p style="margin:0 0 4px;">You're booked in for:</p>
       <p style="margin:8px 0;padding:14px 16px;background-color:#F3F5FA;border-radius:8px;font-size:15px;font-weight:600;">
         ${escapeHtml(opts.date ?? '')} &middot; ${escapeHtml(opts.timeLabel ?? '')}
       </p>`

  const bodyHtml = `
    <h1 style="font-family:'Fraunces',Georgia,serif;font-size:22px;font-weight:600;margin:0 0 12px;color:#0A0E1A;">Booking confirmed</h1>
    <p style="margin:0 0 4px;">Hi ${escapeHtml(firstName)} —</p>
    ${whenHtml}
    <p style="margin:16px 0 0;color:#5A6A8A;font-size:13px;">Need to change anything? Just reply to this email.</p>
  `

  return {
    subject: opts.isCallback ? 'Your callback request is confirmed' : 'Your consultation is confirmed',
    html: renderLayout({ preheader: 'Your booking with AI4Planning is confirmed.', bodyHtml }),
  }
}
