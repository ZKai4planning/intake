import { NextRequest, NextResponse } from 'next/server'
import { getQuestionsForTier, getQuestionsUpTo } from '@/lib/reportTiers'
import { CHAT_QUESTIONS_SKILL } from '@/lib/questionSkill'
import { ACTORS } from '@/lib/actors'
import { GOALS } from '@/lib/goals'
import type { ChatQuestion, ReportTierId, TierAnswers } from '@/types/reportTiers'
import type { ActorId, GoalId } from '@/types'

/**
 * POST /api/chat/questions
 * ───────────────────────────
 * Given a target tier + who's asking + what's already answered, returns
 * the remaining intake questions for that tier — reordered, phrased for
 * the actor/goal, and with irrelevant non-required ones dropped — by
 * asking the LLM to tailor the fixed canonical schema in
 * lib/questionSlots.ts (see lib/questionSkill.ts for its exact rules).
 *
 * Every question id and option value returned is guaranteed to be one
 * that already existed in the candidate list — the LLM can only
 * reorder/reword/drop-if-optional, never invent new fields. This is
 * what keeps reportContent.ts (which reads answers by these exact
 * keys) working unchanged.
 *
 * Falls back to the untailored candidate list — same behaviour as
 * before this change — if GROQ_API_KEY isn't set, the LLM call fails,
 * or its response doesn't parse. The chat never breaks because of this
 * endpoint; it just loses per-actor phrasing until the call succeeds
 * again.
 *
 * ENV VARS (.env.local): same as /api/chat/ask — GROQ_API_KEY (required
 * for tailoring), GROQ_MODEL / GROQ_BASE_URL (optional).
 */

const BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1'
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'

interface RequestBody {
  mode?: 'tier' | 'upTo'
  tier?: ReportTierId
  actorId?: ActorId | null
  goalId?: GoalId | 'unsure' | null
  answers?: TierAnswers
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as RequestBody | null
  const tier = body?.tier
  const mode: 'tier' | 'upTo' = body?.mode === 'upTo' ? 'upTo' : 'tier'
  const actorId = body?.actorId ?? null
  const goalId = body?.goalId ?? null
  const answers: TierAnswers = body?.answers && typeof body.answers === 'object' ? body.answers : {}

  if (!tier) {
    return NextResponse.json({ error: 'tier is required' }, { status: 400 })
  }

  const candidates = (mode === 'upTo' ? getQuestionsUpTo(tier) : getQuestionsForTier(tier)).filter(
    q => !(q.id in answers)
  )

  if (candidates.length === 0) {
    return NextResponse.json({ questions: [] })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    // No key configured — same behaviour as before this feature existed.
    return NextResponse.json({ questions: candidates })
  }

  try {
    const tailored = await tailorQuestions({ candidates, actorId, goalId, answers, apiKey })
    return NextResponse.json({ questions: tailored ?? candidates })
  } catch (err) {
    console.error('[/api/chat/questions] error:', err)
    return NextResponse.json({ questions: candidates })
  }
}

async function tailorQuestions(opts: {
  candidates: ChatQuestion[]
  actorId: ActorId | null
  goalId: GoalId | 'unsure' | null
  answers: TierAnswers
  apiKey: string
}): Promise<ChatQuestion[] | null> {
  const actor = opts.actorId ? ACTORS.find(a => a.id === opts.actorId) : undefined
  const goal = opts.goalId && opts.goalId !== 'unsure' ? GOALS.find(g => g.id === opts.goalId) : undefined

  const userPayload = {
    actor: actor ? { id: actor.id, label: actor.label, description: actor.description } : null,
    goal: goal ? { id: goal.id, title: goal.title, subtitle: goal.subtitle } : null,
    alreadyAnswered: opts.answers,
    candidateQuestions: opts.candidates.map(q => ({
      id: q.id,
      required: !!q.required,
      inputType: q.inputType,
      fallbackPrompt: q.prompt,
      fallbackShortLabel: q.shortLabel,
      placeholder: q.placeholder ?? null,
      hint: q.hint ?? null,
      options: q.options?.map(o => ({ value: o.value, fallbackLabel: o.label })) ?? null,
    })),
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opts.apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: CHAT_QUESTIONS_SKILL },
        { role: 'user', content: JSON.stringify(userPayload) },
      ],
    }),
  })

  if (!res.ok) return null
  const data = await res.json()
  const raw: string | undefined = data.choices?.[0]?.message?.content
  if (!raw) return null

  let parsed: { questions?: unknown[] }
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!Array.isArray(parsed.questions)) return null

  const byId = new Map(opts.candidates.map(q => [q.id, q]))
  const result: ChatQuestion[] = []
  const seen = new Set<string>()

  for (const item of parsed.questions as Record<string, unknown>[]) {
    const source = typeof item?.id === 'string' ? byId.get(item.id) : undefined
    if (!source || seen.has(source.id)) continue
    seen.add(source.id)

    const prompt = typeof item.prompt === 'string' && item.prompt.trim() ? item.prompt.trim() : source.prompt
    const shortLabel =
      typeof item.shortLabel === 'string' && item.shortLabel.trim() ? item.shortLabel.trim() : source.shortLabel
    const placeholder =
      typeof item.placeholder === 'string' && item.placeholder.trim() ? item.placeholder.trim() : source.placeholder

    let options = source.options
    if (source.options && Array.isArray(item.options)) {
      const labelByValue = new Map<string, string>()
      for (const o of item.options as Record<string, unknown>[]) {
        if (typeof o?.value === 'string' && typeof o?.label === 'string' && o.label.trim()) {
          labelByValue.set(o.value, o.label.trim())
        }
      }
      // Only accept the relabel if every canonical value from the
      // source is still present — never let the model silently drop
      // or invent an option value that reportContent.ts might rely on.
      const allValuesPresent = source.options.every(o => labelByValue.has(o.value))
      if (allValuesPresent) {
        options = source.options.map(o => ({ ...o, label: labelByValue.get(o.value) as string }))
      }
    }

    result.push({ ...source, prompt, shortLabel, placeholder, options })
  }

  // Safety net: any required candidate the model dropped gets appended
  // back, unmodified — required answers are never allowed to silently
  // disappear just because the model judged them less relevant.
  for (const q of opts.candidates) {
    if (q.required && !seen.has(q.id)) {
      result.push(q)
      seen.add(q.id)
    }
  }

  return result.length > 0 ? result : null
}