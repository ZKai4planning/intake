const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  // Required on Next 14 for instrumentation.ts (Sentry's server-init
  // hook) to actually run. Next 15+ enables this by default and the
  // flag becomes a no-op / can be removed.
  experimental: {
    instrumentationHook: true,
  },

  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ai4planning.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

// withSentryConfig wraps the build to upload source maps and set release
// metadata — see SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN in
// .env.local.example. It's safe to leave this wrapped even without
// those set: source map upload just gets skipped with a console notice,
// the app itself builds and runs completely normally either way.
module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: true, // suppress the Sentry CLI's build-time logging
  widenClientFileUpload: true,

  // Routes browser requests to Sentry through this app's own domain
  // (avoids ad-blockers dropping the request, and keeps it same-origin).
  tunnelRoute: '/monitoring',

  webpack: {
    treeshake: { removeDebugLogging: true }, // strips Sentry's own internal SDK logging from the client bundle
    automaticVercelMonitors: true, // wires up Vercel Cron Monitors automatically, no-op if you don't use Vercel Cron
  },
})
