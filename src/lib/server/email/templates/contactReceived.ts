import { renderLayout, escapeHtml } from './layout'

export function contactReceivedEmail(opts: { name: string }): { subject: string; html: string } {
  const firstName = opts.name.split(' ')[0] || 'there'

  const bodyHtml = `
    <h1 style="font-family:'Fraunces',Georgia,serif;font-size:22px;font-weight:600;margin:0 0 12px;color:#0A0E1A;">We've got your message</h1>
    <p style="margin:0 0 4px;">Hi ${escapeHtml(firstName)} — thanks for reaching out. Someone from the team will get back to you shortly.</p>
  `

  return {
    subject: "We've received your enquiry — AI4Planning",
    html: renderLayout({ preheader: "Thanks for reaching out — we'll be in touch shortly.", bodyHtml }),
  }
}
