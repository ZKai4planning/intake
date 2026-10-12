import * as Sentry from '@sentry/nextjs'

/**
 * All of this app's API routes explicitly set `runtime = 'nodejs'`
 * (see src/app/api/auth/*), so nothing here should actually hit the
 * edge runtime today. This file exists so Sentry is still initialized
 * correctly if that ever changes (e.g. a future middleware.ts) —
 * required by @sentry/nextjs's instrumentation.ts hook regardless.
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  release: process.env.SENTRY_RELEASE ?? process.env.npm_package_version,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
})
