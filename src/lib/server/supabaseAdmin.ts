import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from './env'

/**
 * Server-only Supabase client using the service role key, which
 * bypasses Row Level Security — appropriate here because every query
 * this backend makes is already gated by our own auth logic (email
 * OTP verification, JWT checks), same trust boundary the standalone
 * Express + Prisma backend had. Never import this from a client
 * component or anything that ends up in a client bundle.
 *
 * Built lazily (not at module load) so a missing env var surfaces as
 * a clear runtime error on the request that needed it, rather than
 * crashing `next build` or every route in the app.
 */
let client: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client

  const { url, serviceRoleKey } = env.supabase
  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  }

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}
