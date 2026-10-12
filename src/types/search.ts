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
  id:        GoalId
  emoji:     string
  title:     string
  subtitle:  string
  flowId:    string
  hgId:      string
  href:      string
  priority:  'high' | 'medium'
  userType:  'homeowner' | 'landlord' | 'developer' | 'professional' | 'all'
  displayAs: 'card' | 'strip'
}

export interface ActorSuggestion {
  actorId:        string
  label:          string
  confidence:     number
  wasCorrected:   boolean
  correctedFrom?: string
}

export interface ClassifyRequest {
  query: string
}

export interface ClassifyResponse {
  goalId:     GoalId | 'unsure'
  confidence: number
  label:      string
  actor:      ActorSuggestion | null
}
