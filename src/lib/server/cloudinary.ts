import crypto from 'node:crypto'
import { env } from './env'
import { ApiError } from './apiError'

/**
 * Signed upload to Cloudinary's REST API — no cloudinary npm SDK
 * needed, it's one HTTP call. "Signed" here means we compute an HMAC
 * over the upload params using CLOUDINARY_API_SECRET server-side and
 * send that signature along; this proves the request came from our
 * server and wasn't tampered with, without ever exposing the API
 * secret to the browser (an unsigned/client-side upload would require
 * a public upload preset instead — this is the more locked-down of
 * the two options Cloudinary supports).
 *
 * docs: cloudinary.com/documentation/upload_images#generating_authentication_signatures
 */

const CLOUDINARY_UPLOAD_URL = (cloudName: string) => `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

function signParams(params: Record<string, string>, apiSecret: string): string {
  // Cloudinary's signature is over every param EXCEPT file/api_key/signature
  // itself, sorted alphabetically, joined as key=value&key=value, with the
  // api secret appended (not joined with &) before hashing.
  const toSign = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')

  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex')
}

/**
 * Uploads a base64 data-URL image (e.g. "data:image/jpeg;base64,...")
 * and returns its public HTTPS URL. Always uploads to the same
 * public_id for a given user (`avatars/user_<id>`) with `overwrite:
 * true` — re-uploading a new avatar replaces the old asset instead of
 * piling up an ever-growing set of orphaned images in the Cloudinary
 * account.
 */
export async function uploadAvatar(dataUrl: string, userId: string): Promise<string> {
  const { cloudName, apiKey, apiSecret } = env.cloudinary
  if (!cloudName || !apiKey || !apiSecret) {
    throw new ApiError(500, 'Image uploads are not configured', 'cloudinary_not_configured')
  }

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const folder = 'avatars'
  const publicId = `user_${userId}`

  const paramsToSign = { folder, public_id: publicId, timestamp, overwrite: 'true' }
  const signature = signParams(paramsToSign, apiSecret)

  const form = new FormData()
  form.append('file', dataUrl)
  form.append('api_key', apiKey)
  form.append('timestamp', timestamp)
  form.append('signature', signature)
  form.append('folder', folder)
  form.append('public_id', publicId)
  form.append('overwrite', 'true')

  const res = await fetch(CLOUDINARY_UPLOAD_URL(cloudName), { method: 'POST', body: form })
  const body = (await res.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } }

  if (!res.ok || !body.secure_url) {
    throw new ApiError(502, body.error?.message ?? 'Image upload failed', 'cloudinary_upload_failed')
  }

  return body.secure_url
}
