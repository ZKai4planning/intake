'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { QuestionField } from '@/components/dashboard/questions/QuestionField'
import { getQuestionsForTier } from '@/lib/questions/questionBank'
import { getAgentProject, saveAgentDraft, submitAgentProject, deleteAgentProject, type AgentProject, type QuestionAnswer } from '@/lib/agentxApi'

const AUTOSAVE_DELAY_MS = 1200

export default function AgentxProjectPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  const [project, setProject] = useState<AgentProject | null>(null)
  const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({})
  const [error, setError] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getAgentProject(params.id).then(({ data, error: apiError }) => {
      if (apiError || !data) {
        setError(apiError ?? 'Failed to load project.')
        return
      }
      setProject(data.project)
      setAnswers(data.project.answers)
    })
  }, [params.id])

  const questions = project ? getQuestionsForTier(project.tier) : []

  const persist = useCallback((nextAnswers: Record<string, QuestionAnswer>) => {
    if (!project) return
    setSaveState('saving')
    saveAgentDraft({
      userId: project.userId,
      id: project.id,
      actorId: project.actorId,
      tier: project.tier,
      answers: nextAnswers,
    }).then(({ data, error: apiError }) => {
      if (apiError || !data) {
        setError(apiError ?? 'Failed to save.')
        setSaveState('idle')
        return
      }
      setProject(data.project)
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1500)
    })
  }, [project])

  function handleChange(rowId: string, value: string | string[] | File[] | null) {
    // File uploads aren't wired up in the agent portal yet — a document
    // upload endpoint (Cloudinary or similar) would be needed to make
    // this real, same category of work as the profile avatar upload.
    // Everything else saves normally.
    if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
      setError("File upload questions aren't supported in the agent portal yet — skip this one for now.")
      return
    }

    const next = { ...answers, [rowId]: { rowId, value: value as string | string[] | null } }
    setAnswers(next)
    setError('')

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => persist(next), AUTOSAVE_DELAY_MS)
  }

  function handleSubmit() {
    if (!project) return
    setError('')
    submitAgentProject(project.id).then(({ data, error: apiError }) => {
      if (apiError || !data) {
        setError(apiError ?? 'Failed to submit.')
        return
      }
      setProject(data.project)
    })
  }

  async function handleDelete() {
    if (!project) return
    const { error: apiError } = await deleteAgentProject(project.id)
    if (apiError) {
      setError(apiError)
      return
    }
    router.push(`/agentx/users/${project.userId}`)
  }

  if (error && !project) return <p className="text-[13px] text-[#F87171]">{error}</p>
  if (!project) return <p className="text-[13px] text-[#5A6A8A]">Loading…</p>

  const answeredCount = Object.values(answers).filter(a => a.value !== null && a.value !== '' && !(Array.isArray(a.value) && a.value.length === 0)).length

  return (
    <div className="max-w-[640px]">
      <Link href={`/agentx/users/${project.userId}`} className="text-[13px] text-[#5A6A8A] hover:text-[#E8F0FF] transition-colors">← Back to user</Link>

      <div className="flex items-start justify-between mt-3 mb-1">
        <h1 className="font-display text-[22px] text-[#E8F0FF]">{project.title}</h1>
        <span className={
          project.status === 'submitted'
            ? 'text-[11.5px] font-medium px-2 py-0.5 rounded-full bg-[rgba(52,211,153,0.12)] text-[#34D399] shrink-0 ml-3'
            : 'text-[11.5px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A8B8D8] shrink-0 ml-3'
        }>
          {project.status}
        </span>
      </div>
      <p className="text-[13px] text-[#5A6A8A] mb-1">
        {project.ownerName} · {project.ownerEmail} · {project.tier} tier
      </p>
      <p className="text-[13px] text-[#5A6A8A] mb-6">
        {answeredCount} of {questions.length} answered
        {saveState === 'saving' && ' · saving…'}
        {saveState === 'saved' && ' · saved'}
      </p>

      {error && <p className="text-[13px] text-[#F87171] mb-4" role="alert">{error}</p>}

      <div className="space-y-5">
        {questions.map(q => (
          <div key={q.rowId} className="rounded-[14px] border border-white/[0.08] bg-[#0F1525] p-5">
            <QuestionField
              question={q}
              value={answers[q.rowId]?.value ?? null}
              onChange={val => handleChange(q.rowId, val)}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-6">
        {project.status !== 'submitted' && (
          <button
            onClick={handleSubmit}
            className="px-4 py-2.5 rounded-[10px] bg-[#135BEC] text-white text-[14px] font-semibold hover:bg-[#2A6BF0] transition-colors"
          >
            Mark as submitted
          </button>
        )}

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2.5 rounded-[10px] border border-[rgba(255,107,107,0.3)] text-[#F87171] text-[13.5px] font-semibold hover:bg-[rgba(255,107,107,0.08)] transition-colors"
          >
            Delete project
          </button>
        ) : (
          <>
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-[10px] bg-[#F87171] text-white text-[13.5px] font-semibold hover:bg-[#EF5555] transition-colors"
            >
              Confirm delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-[13.5px] font-medium text-[#A8B8D8] hover:text-[#E8F0FF] transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}
