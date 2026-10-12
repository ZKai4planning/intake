// 'use client'

// import { useEffect, useState } from 'react'
// import { useParams, useSearchParams, useRouter } from 'next/navigation'
// import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'
// import { IntakeForm } from '@/components/dashboard/questions/IntakeForm'
// import { getWorkspaceConfig } from '@/types/workspace'
// import { getProject, saveDraft, submitProject, type Project } from '@/lib/projects'
// import type { ActorId } from '@/types'

// /**
//  * /dashboard/new/[draftId]
//  * ──────────────────────────
//  * Step 2 of the application flow, and also where a saved draft is
//  * resumed from — same route serves both, so there's a single source of
//  * truth instead of duplicating the form for "new" vs "continue".
//  *
//  * Resolution order for which actor/tier to render:
//  *   1. A mid-form revision (ActorRevisionBanner) for this session
//  *   2. The project already saved under this draftId (resuming)
//  *   3. The `?actor=` query param set by /dashboard/new/intent (brand new)
//  * If none apply (e.g. someone hand-edits the URL), bounce back to
//  * intent rather than rendering a form with no resolvable tier.
//  */
// export default function DraftApplicationPage() {
//   const params = useParams<{ draftId: string }>()
//   const searchParams = useSearchParams()
//   const router = useRouter()
//   const { guardedNavigate } = useUnsavedChangesGuard()

//   const draftId = params.draftId
//   const [existing, setExisting] = useState<Project | null | undefined>(undefined) // undefined = still loading
//   const [revisedActorId, setRevisedActorId] = useState<ActorId | null>(null)

//   useEffect(() => {
//     setExisting(getProject(draftId))
//   }, [draftId])

//   if (existing === undefined) {
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading application…</p>
//   }

//   const actorFromQuery = searchParams.get('actor') as ActorId | null
//   const actorId = revisedActorId ?? existing?.actorId ?? actorFromQuery ?? null
//   const workspace = actorId ? getWorkspaceConfig(actorId) : null

//   if (!actorId || !workspace) {
//     if (typeof window !== 'undefined') router.replace('/dashboard/new/intent')
//     return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
//   }

//   function handleBack() {
//     guardedNavigate('/dashboard')
//   }

//   return (
//     <div className="max-w-[640px] mx-auto">
//       <button
//         onClick={handleBack}
//         className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
//       >
//         ← Back to dashboard
//       </button>

//       <IntakeForm
//         tier={workspace.tier}
//         resolvedActorId={actorId}
//         initialAnswers={existing?.answers}
//         onActorRevised={setRevisedActorId}
//         onBack={handleBack}
//         onBookConsultation={() => router.push('/dashboard/consultation')}
//         onSaveDraft={({ answers }) => {
//           const { persisted } = saveDraft({ id: draftId, actorId, tier: workspace.tier, answers })
//           return persisted
//         }}
//         onSubmit={({ answers }) => {
//           const { persisted } = submitProject({ id: draftId, actorId, tier: workspace.tier, answers })
//           // Already persisted at this point — this is not a "leaving with
//           // unsaved changes" situation, so navigate directly rather than
//           // through guardedNavigate (which would otherwise pop a stale
//           // "leave without saving?" confirm, since IntakeForm hasn't
//           // cleared its own dirty flag yet when this callback runs).
//           if (persisted) router.push('/dashboard')
//           return persisted
//         }}
//       />
//     </div>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'
import { IntakeForm } from '@/components/dashboard/questions/IntakeForm'
import { getWorkspaceConfig } from '@/types/workspace'
import { getProject, saveDraft, submitProject, type Project } from '@/lib/projects'
import type { ActorId } from '@/types'

/**
 * /dashboard/new/[draftId]
 * ──────────────────────────
 * Step 2 of the application flow, and also where a saved draft is
 * resumed from — same route serves both, so there's a single source of
 * truth instead of duplicating the form for "new" vs "continue".
 *
 * Resolution order for which actor/tier to render:
 *   1. A mid-form revision (ActorRevisionBanner) for this session
 *   2. The project already saved under this draftId (resuming)
 *   3. The `?actor=` query param set by /dashboard/new/intent (brand new)
 * If none apply (e.g. someone hand-edits the URL), bounce back to
 * intent rather than rendering a form with no resolvable tier.
 */
export default function DraftApplicationPage() {
  const params = useParams<{ draftId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { guardedNavigate } = useUnsavedChangesGuard()

  const draftId = params.draftId
  const [existing, setExisting] = useState<Project | null | undefined>(undefined) // undefined = still loading
  const [revisedActorId, setRevisedActorId] = useState<ActorId | null>(null)

  useEffect(() => {
    setExisting(getProject(draftId))
  }, [draftId])

  if (existing === undefined) {
    return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Loading application…</p>
  }

  const actorFromQuery = searchParams.get('actor') as ActorId | null
  const actorId = revisedActorId ?? existing?.actorId ?? actorFromQuery ?? null
  const workspace = actorId ? getWorkspaceConfig(actorId) : null

  if (!actorId || !workspace) {
    if (typeof window !== 'undefined') router.replace('/dashboard/new/intent')
    return <p className="text-[13px] text-[#5A6A8A] text-center py-16">Redirecting…</p>
  }

  function handleBack() {
    guardedNavigate('/dashboard')
  }

  return (
    <div className="max-w-[640px] mx-auto">
      <button
        onClick={handleBack}
        className="text-[12.5px] text-[#5A6A8A] hover:text-[#A8B8D8] mb-5 inline-flex items-center gap-1.5"
      >
        ← Back to dashboard
      </button>

      <IntakeForm
        tier={workspace.tier}
        resolvedActorId={actorId}
        initialAnswers={existing?.answers}
        onActorRevised={setRevisedActorId}
        onBack={handleBack}
        onBookConsultation={() => router.push('/dashboard/consultation')}
        onSaveDraft={({ answers }) => {
          const { persisted } = saveDraft({ id: draftId, actorId, tier: workspace.tier, answers })
          return persisted
        }}
        onSubmit={({ answers }) => {
          const { persisted } = submitProject({ id: draftId, actorId, tier: workspace.tier, answers })
          // Already persisted at this point — this is not a "leaving with
          // unsaved changes" situation, so navigate directly rather than
          // through guardedNavigate (which would otherwise pop a stale
          // "leave without saving?" confirm, since IntakeForm hasn't
          // cleared its own dirty flag yet when this callback runs).
          //
          // Next step is address capture (auto-runs the constraint check),
          // then the free snapshot — not straight back to the dashboard.
          if (persisted) router.push(`/dashboard/new/${draftId}/address`)
          return persisted
        }}
      />
    </div>
  )
}