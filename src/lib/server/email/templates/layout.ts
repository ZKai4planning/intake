/**
 * Shared branded shell for every transactional email. Deliberately a
 * LIGHT background, not the app's actual dark navy UI (#0A0E1A) —
 * dark-background emails render inconsistently across clients (Outlook
 * in particular) and read as spammier to most inboxes. The brand blue
 * (#135BEC) and Fraunces/DM Sans font pair carry the identity instead,
 * same colors used throughout the actual product (see tailwind.config.ts).
 *
 * All styles are inline — email clients strip <style> blocks and most
 * CSS features unpredictably, so inline is the only reliable approach.
 */

const BRAND_BLUE = '#135BEC'
const INK = '#0A0E1A'
const INK_LIGHT = '#5A6A8A'
const BORDER = '#E5E9F2'
const FONT_STACK = "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
const DISPLAY_FONT_STACK = "'Fraunces', Georgia, 'Times New Roman', serif"

export interface LayoutOptions {
  /** Shown in the inbox preview line before the email is opened, hidden in the body. */
  preheader: string
  bodyHtml: string
}

export function renderLayout({ preheader, bodyHtml }: LayoutOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AI4Planning</title>
</head>
<body style="margin:0;padding:0;background-color:#F3F5FA;font-family:${FONT_STACK};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F3F5FA;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid ${BORDER};">

          <!-- Header -->
          <tr>
            <td style="background-color:${INK};padding:24px 32px;">
              <span style="font-family:${DISPLAY_FONT_STACK};font-size:20px;font-weight:600;color:#FFFFFF;letter-spacing:-0.01em;">
                AI4Planning
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;color:${INK};font-size:15px;line-height:1.6;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid ${BORDER};color:${INK_LIGHT};font-size:12px;line-height:1.5;">
              You're receiving this because it relates to your AI4Planning account or an enquiry you submitted.
              <br />AI4Planning &middot; Planning permission checks, made simple.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="border-radius:8px;background-color:${BRAND_BLUE};">
      <a href="${href}" style="display:inline-block;padding:12px 28px;font-family:${FONT_STACK};font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">
        ${escapeHtml(label)}
      </a>
    </td></tr>
  </table>`
}

/** The 6-digit-code display used by the OTP email — large, monospaced, letter-spaced for readability. */
export function codeBlock(code: string): string {
  return `<div style="margin:24px 0;padding:18px 0;background-color:#F3F5FA;border-radius:8px;text-align:center;">
    <span style="font-family:'Courier New',monospace;font-size:32px;font-weight:700;letter-spacing:0.3em;color:${INK};">
      ${escapeHtml(code)}
    </span>
  </div>`
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
