import { renderLayout, button, escapeHtml } from './layout'
import { env } from '../../env'

export function reportGeneratedEmail(opts: { name: string; reportId: string; tierLabel: string }): { subject: string; html: string } {
  const firstName = opts.name.split(' ')[0] || 'there'

  const bodyHtml = `
    <h1 style="font-family:'Fraunces',Georgia,serif;font-size:22px;font-weight:600;margin:0 0 12px;color:#0A0E1A;">Your report is ready</h1>
    <p style="margin:0 0 4px;">Hi ${escapeHtml(firstName)} — your <strong>${escapeHtml(opts.tierLabel)}</strong> is ready to view, saved to your account so you can come back to it any time.</p>
    ${button('View your report', `${env.appOrigin}/dashboard/reports/${encodeURIComponent(opts.reportId)}`)}
  `

  return {
    subject: `Your ${opts.tierLabel} is ready`,
    html: renderLayout({ preheader: `Your ${opts.tierLabel} is ready to view.`, bodyHtml }),
  }
}
