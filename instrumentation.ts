/**
 * Next.js's supported hook for server-startup instrumentation — this
 * file is auto-detected and run once when the server starts, before
 * any route handles a request. This is what makes Sentry's server-side
 * capture actually work here; without it, sentry.server.config.ts would
 * never get loaded.
 *
 * (Requires `experimental.instrumentationHook` in next.config.js on
 * Next 14 — already added there.)
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}
