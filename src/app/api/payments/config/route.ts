// export const runtime = 'nodejs'

// import { NextResponse } from 'next/server'
// import { env } from '@/lib/server/env'

// export async function GET() {
//   return NextResponse.json({
//     success: true,
//     data: {
//       currency: 'GBP',
//       merchantName: 'AI4Planning',
//       mode: env.revolut.mode,
//       baseUrl: env.revolut.baseUrl,
//     },
//   })
// }

export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { env } from '@/lib/server/env'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      currency: 'GBP',
      merchantName: 'AI4Planning',
      mode: env.revolut.mode,
      baseUrl: env.revolut.baseUrl,
      publicKey: env.revolut.publicKey,
      configured: Boolean(env.revolut.secretKey && env.revolut.publicKey),
    },
  })
}
