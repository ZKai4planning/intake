'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

/**
 * App Router requires its own root <html>/<body> — Next.js's
 * global-error.tsx replaces the entire root layout when it triggers,
 * so it can't rely on anything from layout.tsx.
 *
 * This is the top-level catch-all for React render errors that
 * escape every other error boundary — Sentry's Next.js docs call this
 * out specifically since Next.js's own error handling swallows these
 * otherwise. Route-level errors (e.g. inside a page) should normally
 * be caught closer to the source with a local error.tsx instead; this
 * is the last resort.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ color: '#5A6A8A', fontSize: 14, marginBottom: 20 }}>
              We've been notified and are looking into it. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#135BEC',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
