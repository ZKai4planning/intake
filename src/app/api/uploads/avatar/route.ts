export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/server/requireAuth'
import { handleRouteError } from '@/lib/server/handleRouteError'
import { uploadAvatar } from '@/lib/server/cloudinary'
import * as authService from '@/lib/server/authService'

// Resizing/compressing happens client-side before this ever gets
// called (see ProfilePage), but this is the actual enforced limit —
// never trust the client to have done that. ~7MB covers a resized
// JPEG data URL comfortably with headroom; also keeps us under
// Vercel's request body size limit for serverless functions.
const MAX_DATA_URL_LENGTH = 7_000_000

const uploadAvatarSchema = z.object({
  image: z
    .string()
    .startsWith('data:image/', 'Expected a base64 image data URL')
    .max(MAX_DATA_URL_LENGTH, 'Image is too large — try a smaller photo'),
})

export async function POST(req: Request) {
  try {
    const auth = requireAuth(req)
    const { image } = uploadAvatarSchema.parse(await req.json())

    const avatarUrl = await uploadAvatar(image, auth.sub)
    const profile = await authService.updateMe(auth.sub, { avatarUrl })

    return NextResponse.json(profile)
  } catch (err) {
    return handleRouteError(err)
  }
}
