// // ─── Auth flow types ──────────────────────────────────────────────

// export type AuthIntent = 'login' | 'signup'

// export interface SendOtpRequest {
//   email:  string
//   intent: AuthIntent
// }

// export interface SendOtpResponse {
//   success:   boolean
//   expiresIn: number   // seconds, e.g. 600
//   maskedEmail: string // e.g. "j***@example.com"
// }

// export interface VerifyOtpRequest {
//   email: string
//   code:  string       // 6-digit string
// }

// export interface VerifyOtpResponse {
//   success:     boolean
//   accessToken: string
//   user: {
//     id:        string
//     name:      string
//     email:     string
//     role:      'consumer' | 'b2b' | 'consultant' | 'admin'
//     createdAt: string
//   }
// }

// export interface ForgotPasswordRequest {
//   email: string
// }

// export interface ForgotPasswordResponse {
//   success:     boolean
//   maskedEmail: string
// }

// export interface ResetPasswordRequest {
//   email:    string
//   code:     string
//   password: string
// }

// // Form field states
// export type FieldState = 'idle' | 'valid' | 'error'

// export interface FormField<T = string> {
//   value:   T
//   state:   FieldState
//   message: string
// }


import type { ActorId } from './index'

// ─── Auth flow types ──────────────────────────────────────────────

export type AuthIntent = 'login' | 'signup'

export interface SendOtpRequest {
  email: string
}

export interface SendOtpResponse {
  success:     boolean
  expiresIn:   number
  maskedEmail: string
  // Which flow the server actually used — a brand-new email gets
  // 'signup', a known one gets 'login'. The client never sends this;
  // the server decides it by checking whether the account exists.
  intent:      AuthIntent
}

export interface VerifyOtpRequest {
  email: string
  code:  string
}

export interface VerifyOtpResponse {
  success:      boolean
  accessToken:  string
  mfaEnabled:   boolean
  user: {
    id:        string
    name:      string
    email:     string
    role:      'consumer' | 'b2b' | 'consultant' | 'admin'
    createdAt: string
    actorId?:  ActorId
    phone?:    string
    avatarUrl?: string
  }
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  success:     boolean
  maskedEmail: string
}

export interface ResetPasswordRequest {
  email:    string
  code:     string
  password: string
}

// ─── Profile ──────────────────────────────────────────────────────
// GET /api/auth/me and PATCH /api/auth/me — both require the
// accessToken cookie set by verify-otp. See src/lib/server/authService.ts.

export interface UserProfile {
  id:         string
  name:       string
  email:      string
  role:       'consumer' | 'b2b' | 'consultant' | 'admin'
  mfaEnabled: boolean
  avatarUrl:  string | null
  actorId?:   ActorId
  phone?:     string
  createdAt:  string
}

export interface UpdateMeRequest {
  name?:      string
  avatarUrl?: string | null
  actorId?:   ActorId
  phone?:     string
}

export interface MfaSetupResponse {
  secret:        string
  otpAuthUrl:    string
  qrCodeDataUrl: string | null
}

export interface MfaVerifyRequest {
  email:  string
  code:   string
  enable: boolean
}

export interface MfaVerifyResponse {
  success:     boolean
  mfaEnabled:  boolean
  backupCodes: string[]
}

export interface AuthSession {
  accessToken: string
  email:       string
  name:        string
  role:        string
  mfaEnabled:  boolean
}

export type FieldState = 'idle' | 'valid' | 'error'