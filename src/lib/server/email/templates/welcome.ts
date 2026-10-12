import { renderLayout, button, escapeHtml } from './layout'
import { env } from '../../env'

export function welcomeEmail(opts: { name: string }): { subject: string; html: string } {
  const firstName = opts.name.split(' ')[0] || 'there'

  const bodyHtml = `
    <h1 style="font-family:'Fraunces',Georgia,serif;font-size:22px;font-weight:600;margin:0 0 12px;color:#0A0E1A;">Welcome to AI4Planning, ${escapeHtml(firstName)}</h1>
    <p style="margin:0 0 4px;">Your account is set up. From here you can check a project against real planning constraints — conservation areas, listed buildings, Article 4 directions, flood risk — in minutes, not weeks.</p>
    ${button('Go to your dashboard', `${env.appOrigin}/dashboard`)}
    <p style="margin:0;color:#5A6A8A;font-size:13px;">Questions? Just reply to this email.</p>
  `

  return {
    subject: 'Welcome to AI4Planning',
    html: renderLayout({ preheader: `Welcome, ${firstName} — your account is ready.`, bodyHtml }),
  }
}
