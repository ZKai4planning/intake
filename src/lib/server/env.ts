/**
 * env.ts (server-only)
 * ─────────────────────
 * Config for the auth API routes under src/app/api/auth/*. This file
 * must never be imported from client components — it's only ever
 * imported by route handlers and other files under lib/server/, all of
 * which run exclusively on the server (Vercel serverless functions),
 * same as the original standalone Express backend did.
 *
 * Nothing here throws at import time — required-but-missing secrets
 * (JWT_SECRET, EMAIL_ENCRYPTION_KEY, etc.) are validated lazily, the
 * first time they're actually used, so a missing env var surfaces as
 * a clear error on the one request that needed it instead of crashing
 * the whole app (or the Vercel build) at module load.
 */

export const env = {
  isProd: process.env.NODE_ENV === 'production',

  // Used to build absolute links in emails (e.g. "Go to your dashboard").
  appOrigin:
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.FRONTEND_ORIGIN ??
    'http://localhost:3000',

  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',

  // Deliberately separate from jwtSecret above — the admin portal is a
  // fully separate identity system (its own table, its own login, its
  // own cookie). Signing admin tokens with a different secret means a
  // leaked customer JWT_SECRET can't be used to forge an admin session,
  // and vice versa.
  adminJwtSecret: process.env.ADMIN_JWT_SECRET ?? '',
  adminJwtExpiresIn: process.env.ADMIN_JWT_EXPIRES_IN ?? '12h', // shorter-lived than customer sessions — admin access should re-prompt more often

  // Same reasoning as adminJwtSecret — agentx is its own separate
  // identity system too, with its own secret so neither portal can
  // forge the other's session.
  agentJwtSecret: process.env.AGENT_JWT_SECRET ?? '',
  agentJwtExpiresIn: process.env.AGENT_JWT_EXPIRES_IN ?? '12h',

  otpTtlSeconds: Number(process.env.OTP_TTL_SECONDS ?? 600),
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS ?? 5),

  brevo: {
    // Transactional Email API (not SMTP relay) — developers.brevo.com/reference/sendtransacemail
    apiKey: process.env.BREVO_API_KEY ?? '',
    senderEmail: process.env.BREVO_SENDER_EMAIL ?? 'no-reply@ai4planning.com',
    senderName: process.env.BREVO_SENDER_NAME ?? 'AI4Planning',
  },

  revolut: {
    // Revolut gives you separate sandbox and production API hosts.
    // NOTE: this is the bare host — revolutClient.ts appends the
    // versioned path /api/1.0/orders itself (e.g.
    // https://merchant.revolut.com/api/1.0/orders). Don't include
    // a path here or you'll get a broken double path.
    baseUrl: process.env.REVOLUT_MERCHANT_API_BASE_URL ?? 'https://merchant.revolut.com',

    mode:
      (process.env.REVOLUT_MERCHANT_MODE ??
        ((process.env.REVOLUT_MERCHANT_API_BASE_URL ?? '').includes('sandbox') ? 'sandbox' : 'prod')) as
        | 'sandbox'
        | 'prod',

    secretKey: process.env.REVOLUT_MERCHANT_SECRET_KEY ?? '',
    publicKey: process.env.REVOLUT_MERCHANT_PUBLIC_KEY ?? '',
    // Was defaulting to '2024-09-01' — Revolut now rejects that version
    // with a 401 for this account's key. '2026-04-20' is the version
    // confirmed working via curl; override with REVOLUT_API_VERSION in
    // .env.local if Revolut issues a newer one later.
    apiVersion: process.env.REVOLUT_API_VERSION ?? '2026-04-20',
    webhookSigningSecret: process.env.REVOLUT_WEBHOOK_SIGNING_SECRET ?? '',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },

  security: {
    // 32-byte (64 hex char) keys — generate with:
    //   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    // Rotating either key invalidates every existing encrypted/hashed
    // email already stored (old rows won't decrypt / won't hash-match).
    emailEncryptionKey: process.env.EMAIL_ENCRYPTION_KEY ?? '',
    emailHashSecret: process.env.EMAIL_HASH_SECRET ?? '',
  },

  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    // Service role key — bypasses Row Level Security. Server-only,
    // NEVER prefix this with NEXT_PUBLIC_ or it'll ship to the browser.
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
}