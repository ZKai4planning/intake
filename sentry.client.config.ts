import * as Sentry from '@sentry/nextjs'

/**
 * Browser-side Sentry init. Uses NEXT_PUBLIC_SENTRY_DSN (not SENTRY_DSN)
 * since this file ships to the client bundle — the DSN itself is safe
 * to expose (it's only good for *sending* events, not reading data),
 * but it must be the NEXT_PUBLIC_-prefixed var or Next.js won't inline
 * it into client code at build time.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  release: process.env.SENTRY_RELEASE ?? process.env.npm_package_version,

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Session Replay is off by default — turn on by setting both rates
  // above 0 once you actually want it; it adds bundle size and
  // captures DOM snapshots, worth deciding on deliberately rather than
  // defaulting to on.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
})
