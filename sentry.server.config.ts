import * as Sentry from '@sentry/nextjs'

/**
 * Server-side Sentry init — ported from the backend's instrument.ts.
 * Loaded via instrumentation.ts (see NEXT_RUNTIME === 'nodejs' below),
 * which is Next.js's supported hook point for this, replacing the old
 * backend's `node -r ./instrument.js` preload flag.
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN, // no-ops safely if unset (e.g. local dev)
  environment: process.env.NODE_ENV ?? 'development',
  release: process.env.SENTRY_RELEASE ?? process.env.npm_package_version,

  // Profiling intentionally left out, same as the backend — no prebuilt
  // binaries for newer Node versions at the time that call was made.

  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Same scrubbing as the backend's instrument.ts — accessToken cookie
  // and any Authorization header should never leave this app in an
  // error report.
  beforeSend(event) {
    if (event.request?.headers) {
      delete (event.request.headers as Record<string, unknown>)['authorization']
      delete (event.request.headers as Record<string, unknown>)['cookie']
    }
    if (event.request?.cookies) delete event.request.cookies
    return event
  },

  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === 'http' && breadcrumb.data?.['headers']) {
      delete breadcrumb.data['headers']
    }
    return breadcrumb
  },
})
