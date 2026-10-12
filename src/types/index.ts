// // ── Navigation ────────────────────────────────────────────
// export interface NavItem {
//   label: string
//   href: string
//   isExternal?: boolean
// }

// export interface NavCTA {
//   label: string
//   href: string
//   variant: 'ghost' | 'primary'
// }

// // ── Goal / Search ─────────────────────────────────────────
// export type GoalId =
//   | 'ext'
//   | 'loft'
//   | 'windows'
//   | 'outbuilding'
//   | 'unsure'
//   | 'hmo'
//   | 'land'
//   | 'refusal'
//   | 'managed'
//   | 'b2b'

// export interface Goal {
//   id: GoalId
//   emoji: string
//   title: string
//   subtitle: string
//   flowId: string           // FA-01, FA-02 etc.
//   hgId: string             // HG-001 etc.
//   href: string             // e.g. /check/extension
//   priority: 'high' | 'medium'
//   userType: 'homeowner' | 'landlord' | 'developer' | 'professional' | 'all'
//   displayAs: 'card' | 'strip'
// }

// // ── Search ────────────────────────────────────────────────
// export interface SearchSuggestion {
//   goalId: GoalId
//   label: string
//   confidence: number       // 0–1
// }

// export interface SearchState {
//   query: string
//   suggestion: SearchSuggestion | null
//   isLoading: boolean
// }

// // ── API responses (add as you build) ─────────────────────
// export interface ApiResponse<T> {
//   data: T | null
//   error: string | null
//   status: number
// }

// // ── User / Auth ───────────────────────────────────────────
// export interface User {
//   id: string
//   name: string
//   email: string
//   role: 'consumer' | 'b2b' | 'consultant' | 'admin'
//   createdAt: string
// }

// export interface AuthState {
//   user: User | null
//   isLoading: boolean
//   isAuthenticated: boolean
// }

// ── Navigation ────────────────────────────────────────────
export interface NavItem {
  label: string
  href: string
  isExternal?: boolean
}

export interface NavCTA {
  label: string
  href: string
  variant: 'ghost' | 'primary'
}

// ── Goal / Search ───────────────────────────────────────────
export type GoalId =
  | 'ext'
  | 'loft'
  | 'windows'
  | 'outbuilding'
  | 'unsure'
  | 'hmo'
  | 'land'
  | 'refusal'
  | 'managed'
  | 'b2b'

export interface Goal {
  id: GoalId
  emoji: string
  title: string
  subtitle: string
  flowId: string           // FA-01, FA-02 etc.
  hgId: string              // HG-001 etc.
  href: string              // e.g. /check/extension
  priority: 'high' | 'medium'
  userType: 'homeowner' | 'landlord' | 'developer' | 'professional' | 'all'
  displayAs: 'card' | 'strip'
}

// ── Actor (workspace persona) ─────────────────────────────
/**
 * The "actor" is who the person is, not what they want to do.
 * Captured alongside the goal so the backend can spin up the
 * correct workspace (consumer dashboard vs B2B/consultant portal).
 */
export type ActorId =
  | 'homeowner'
  | 'landlord'
  | 'developer'
  | 'consultant'
  | 'architect'
  | 'business'
  | 'builder'
 

export interface Actor {
  id: ActorId
  emoji: string
  label: string
  description: string
  /** Keywords used for fuzzy / typo-tolerant matching from free text */
  keywords: string[]
  /** Which workspace template this actor provisions on signup */
  workspaceType: 'consumer' | 'professional' | 'enterprise'
}

// ── Search ──────────────────────────────────────────────────
export interface SearchSuggestion {
  goalId: GoalId
  label: string
  confidence: number       // 0–1
}

export interface ActorSuggestion {
  actorId: ActorId
  label: string
  confidence: number
  /** True when matched via fuzzy/typo correction rather than exact substring */
  wasCorrected: boolean
  /** The corrected token, e.g. "landlord" when user typed "landlrod" */
  correctedFrom?: string
}

export interface SearchState {
  query: string
  suggestion: SearchSuggestion | null
  actorSuggestion: ActorSuggestion | null
  selectedActor: ActorId | null
  isLoading: boolean
}

// ── API responses (add as you build) ───────────────────────
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

// ── User / Auth ───────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  role: 'consumer' | 'b2b' | 'consultant' | 'admin'
  createdAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}