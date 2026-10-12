/**
 * mock.ts
 * ────────
 * Simulates all auth API calls locally with realistic delays.
 * The DEMO_OTP code is always "123456" — shown in the UI during dev.
 *
 * HOW TO SWITCH TO REAL API:
 *   In every auth page, change:
 *     import { sendOtpMock as sendOtp, ... } from '@/lib/mock'
 *   to:
 *     import { sendOtp, ... } from '@/lib/api'
 *
 * The function signatures are identical so no other changes are needed.
 */

import type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
} from '@/types/auth'

const DEMO_OTP      = '123456'
const DEMO_DELAY_MS = 900

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

function mask(email: string) {
  return email.replace(/^(.)(.*)(@.+)$/, (_: string, a: string, _b: string, c: string) => `${a}***${c}`)
}

// ── Persistent mock state (in-memory, resets on page refresh) ─────
const mockUsers: Record<string, { name: string; mfaEnabled: boolean }> = {}

// ─────────────────────────────────────────────────────────────────
export async function sendOtpMock(body: SendOtpRequest) {
  await delay(DEMO_DELAY_MS)
  console.log(`[mock] OTP sent to ${body.email} — use code: ${DEMO_OTP}`)
  return {
    data: {
      success:     true,
      expiresIn:   600,
      maskedEmail: mask(body.email),
    } as SendOtpResponse,
    error: null,
  }
}

// ─────────────────────────────────────────────────────────────────
export async function verifyOtpMock(body: VerifyOtpRequest) {
  await delay(DEMO_DELAY_MS)

  if (body.code !== DEMO_OTP) {
    return { data: null, error: 'Incorrect code. Hint: use 123456' }
  }

  // Create or recall user
  if (!mockUsers[body.email]) {
    mockUsers[body.email] = { name: body.email.split('@')[0], mfaEnabled: false }
  }

  const user = mockUsers[body.email]

  return {
    data: {
      success:      true,
      accessToken:  'mock-jwt-token-' + Date.now(),
      mfaEnabled:   user.mfaEnabled,   // ← key flag: determines MFA flow
      user: {
        id:        'usr_' + Math.random().toString(36).slice(2, 8),
        name:      user.name,
        email:     body.email,
        role:      'consumer' as const,
        createdAt: new Date().toISOString(),
      },
    } as VerifyOtpResponse & { mfaEnabled: boolean },
    error: null,
  }
}

// ─────────────────────────────────────────────────────────────────
export async function logoutMock() {
  await delay(300)
  console.log('[mock] logged out')
  return { data: { success: true }, error: null }
}

// ─────────────────────────────────────────────────────────────────
export async function forgotPasswordMock(body: ForgotPasswordRequest) {
  await delay(DEMO_DELAY_MS)
  console.log(`[mock] Password reset OTP sent to ${body.email} — use code: ${DEMO_OTP}`)
  return {
    data: {
      success:     true,
      maskedEmail: mask(body.email),
    } as ForgotPasswordResponse,
    error: null,
  }
}

// ─────────────────────────────────────────────────────────────────
export async function resetPasswordMock(_body: ResetPasswordRequest) {
  await delay(DEMO_DELAY_MS)
  if (_body.code !== DEMO_OTP) {
    return { data: null, error: 'Incorrect code. Hint: use 123456' }
  }
  return { data: { success: true }, error: null }
}

// ─────────────────────────────────────────────────────────────────
export async function setupMfaMock(_email: string) {
  await delay(500)
  // Returns a fake TOTP secret and QR code data URL
  const secret = 'JBSWY3DPEHPK3PXP'
  return {
    data: {
      secret,
      otpAuthUrl: `otpauth://totp/AI4Planning:${_email}?secret=${secret}&issuer=AI4Planning`,
      // A real QR code SVG would come from the backend
      // For the mock we return the secret to copy manually
      qrCodeDataUrl: null as null,
    },
    error: null,
  }
}

// ─────────────────────────────────────────────────────────────────
export async function verifyMfaMock(body: { email: string; code: string; enable: boolean }) {
  await delay(DEMO_DELAY_MS)
  // Accept any 6-digit code in mock
  if (!/^\d{6}$/.test(body.code)) {
    return { data: null, error: 'Enter a valid 6-digit code.' }
  }
  if (mockUsers[body.email]) {
    mockUsers[body.email].mfaEnabled = body.enable
  }
  return {
    data: {
      success:     true,
      mfaEnabled:  body.enable,
      backupCodes: ['A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2', 'M3N4-O5P6', 'Q7R8-S9T0'],
    },
    error: null,
  }
}

export { DEMO_OTP }