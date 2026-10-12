/** Response shape for GET /api/workspace/me — deliberately unwrapped (no `{ data }` envelope), see workspaceService.ts for why that matters here specifically. */
export interface WorkspaceMeResponse {
  session: {
    email:       string
    name:        string
    accessToken: string
    mfaEnabled:  boolean
    role:        string
    actorId?:    string
    phone?:      string
  }
  usage: {
    projectsCount:           number
    submittedProjectsCount:  number
    reportsCount:            number
    consultantBookingsCount: number
    totalSpentGBP:           number
  }
}
