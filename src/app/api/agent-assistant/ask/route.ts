export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { AGENT_ACTIONS, getAgentAction, type AgentAssistantSurface } from '@/lib/agentAssistant/actions'
import { READ_TOOLS, WRITE_TOOLS, type AssistantAuthCtx } from '@/lib/server/agentAssistant/tools'
import { requireAdminAuth } from '@/lib/server/admin/requireAdminAuth'
import { requireAgentAuth } from '@/lib/server/agent/requireAgentAuth'
import { requireAuth } from '@/lib/server/requireAuth'
import { ApiError } from '@/lib/server/apiError'

/**
 * POST /api/agent-assistant/ask
 * ────────────────────────────────
 * Powers the floating assistant on the customer dashboard, admin, and
 * agentx portals. Same Groq model as /api/chat/ask (the funnel chat),
 * but with three kinds of tool instead of the intake funnel skill:
 *
 *   1. take_action  — navigate to a known page (unchanged from before)
 *   2. read tools    — run immediately, result fed back to the model
 *                      (search_users, list_stalled_orders, …)
 *   3. write tools   — NEVER run here. The model can only *propose* one;
 *                      the route returns it as `pendingConfirmation` and
 *                      the actual mutation only happens if the person
 *                      explicitly confirms via /api/agent-assistant/execute.
 *
 * Runs up to MAX_ROUNDS model calls in a loop so the model can chain
 * read tools ("search_users" → reason over the result → propose
 * "create_project") before landing on a final answer or a proposal —
 * this is the part that makes it agentic rather than one-shot.
 *
 * ENV VARS (.env.local) — shared with /api/chat/ask:
 *   GROQ_API_KEY, GROQ_MODEL (optional), GROQ_BASE_URL (optional)
 */

const BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1'
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
const MAX_ROUNDS = 4

const SURFACES: AgentAssistantSurface[] = ['customer', 'admin', 'agentx']

type Role = 'system' | 'user' | 'assistant' | 'tool'

interface ChatMsg {
  role: Role
  content: string
  tool_call_id?: string
  tool_calls?: any[]
  name?: string
}

/** Every route here is behind the portal's own login already, via the browser session — this re-checks server-side so the endpoint itself can't be hit without one, now that it can read real customer/order/report data and propose real mutations. */
function requireSurfaceAuth(surface: AgentAssistantSurface, req: NextRequest): AssistantAuthCtx {
  if (surface === 'admin') {
    const admin = requireAdminAuth()
    return { surface, actorId: admin.sub, actorEmail: admin.email }
  }
  if (surface === 'agentx') {
    const agent = requireAgentAuth()
    return { surface, actorId: agent.sub, actorEmail: agent.email }
  }
  const user = requireAuth(req)
  return { surface, actorId: user.sub, actorEmail: user.email }
}

function buildSystemPrompt(surface: AgentAssistantSurface, context: Record<string, string>): string {
  const actions = AGENT_ACTIONS[surface]
  const navList = actions.map(a => `- ${a.id}: ${a.description}`).join('\n')
  const readList = READ_TOOLS[surface].map(t => `- ${t.name}: ${t.description}`).join('\n')
  const writeList = WRITE_TOOLS[surface].map(t => `- ${t.name}: ${t.description}`).join('\n')
  const contextLine = Object.keys(context).length
    ? `\n\nCurrent page context (already known, do not ask for these again): ${JSON.stringify(context)}`
    : ''

  return `You are an in-app assistant embedded in a UK property-planning product, on the ${surface} area of the site. You have three kinds of tool:

1. take_action — open one of these known pages (call with the id):
${navList || '(none available here)'}

2. Read tools — call these to look something up. Results are returned to you so you can reason over them before replying or acting:
${readList || '(none available here)'}

3. Action tools — these actually change something. Only call one when you have everything it needs, stated explicitly by the person or found via a read tool — never invent a value (especially ids). If something's missing, ask ONE short clarifying question in plain text instead of calling it:
${writeList || '(none available here)'}
${contextLine}

Rules:
- If the request asks "how many", "what's the count/number of", or any other request for a total/count, ALWAYS use a read tool that returns real numbers (e.g. get_admin_stats, count_users) and answer directly with that number in plain text. Never navigate to a page as a substitute for counting something — a page open is not an answer to "how many".
- If the request is to CREATE, ADD, PROVISION, or otherwise make something new, and a matching action tool exists above, use that action tool — even if a related take_action page also exists for viewing that same kind of thing. Opening the page that lists agents is not the same as creating one; never substitute a take_action for a create request just because the create tool needs details you don't have yet.
- Prefer a read tool to verify something before answering a factual question or calling an action tool.
- Call an action tool only when confident it matches the request — this is a proposal, not immediate execution, so slight over-eagerness is fine, but never fabricate required fields (like an id) that weren't stated or found via a read tool.
- If an action tool is missing required details (e.g. a name or email), do NOT navigate anywhere as a workaround — ask ONE short, direct question for exactly what's missing, then wait for the reply.
- Never invent a tool name that isn't listed above.
- Keep any plain-text reply to 1-3 short sentences.`
}

function buildTools(surface: AgentAssistantSurface) {
  const takeAction = {
    type: 'function',
    function: {
      name: 'take_action',
      description: "Open a page in the product on the person's behalf.",
      parameters: {
        type: 'object',
        properties: { actionId: { type: 'string', enum: AGENT_ACTIONS[surface].map(a => a.id) } },
        required: ['actionId'],
      },
    },
  }
  const reads = READ_TOOLS[surface].map(t => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }))
  const writes = WRITE_TOOLS[surface].map(t => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }))
  return [takeAction, ...reads, ...writes]
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY is not set on the server — add it to .env.local and restart the dev server.' },
      { status: 500 }
    )
  }

  const body = await req.json().catch(() => null)
  const surface: AgentAssistantSurface = SURFACES.includes(body?.surface) ? body.surface : 'customer'

  let ctx: AssistantAuthCtx
  try {
    ctx = requireSurfaceAuth(surface, req)
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 401
    const message = err instanceof ApiError ? err.message : 'Not logged in.'
    return NextResponse.json({ error: message }, { status })
  }

  const query: string = typeof body?.query === 'string' ? body.query : ''
  const history: { role: 'user' | 'assistant'; content: string }[] = Array.isArray(body?.history) ? body.history : []
  const context: Record<string, string> = body?.context && typeof body.context === 'object' ? body.context : {}

  if (!query.trim()) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  const messages: ChatMsg[] = [
    { role: 'system', content: buildSystemPrompt(surface, context) },
    ...history,
    { role: 'user', content: query },
  ]
  const tools = buildTools(surface)

  try {
    for (let round = 0; round < MAX_ROUNDS; round++) {
      const result = await groqCompletion(messages, apiKey, tools)
      const message = result.choices?.[0]?.message

      if (!message?.tool_calls || message.tool_calls.length === 0) {
        return NextResponse.json({ reply: message?.content ?? "Sorry, I didn't catch that — could you rephrase?" })
      }

      // A write-tool proposal always wins the round and ends the loop —
      // nothing after a proposed mutation should get silently auto-chained.
      const writeCall = message.tool_calls.find((c: any) => WRITE_TOOLS[surface].some(t => t.name === c.function?.name))
      if (writeCall) {
        const tool = WRITE_TOOLS[surface].find(t => t.name === writeCall.function.name)!
        const args = parseArgs(writeCall.function.arguments)
        // Page context wins over anything the model guessed for the same key —
        // e.g. create_project's userId, when the current page already names one.
        const merged = { ...args, ...pickContextForTool(context) }
        return NextResponse.json({
          reply: message.content || 'One thing to confirm first:',
          pendingConfirmation: { tool: tool.name, args: merged, summary: tool.summarize(merged) },
        })
      }

      const navCall = message.tool_calls.find((c: any) => c.function?.name === 'take_action')
      const readCalls = message.tool_calls.filter((c: any) =>
        READ_TOOLS[surface].some(t => t.name === c.function?.name)
      )

      // Run any read calls this round regardless (cheap, and their results
      // might matter even if a navigate call also came back) — but a
      // navigate call still ends the loop once they're done.
      const toolResultMessages: ChatMsg[] = []
      for (const call of readCalls) {
        const tool = READ_TOOLS[surface].find(t => t.name === call.function.name)!
        const args = parseArgs(call.function.arguments)
        let resultJson: string
        try {
          resultJson = JSON.stringify(await tool.run(args, ctx))
        } catch (err) {
          resultJson = JSON.stringify({ error: err instanceof Error ? err.message : 'Tool failed.' })
        }
        toolResultMessages.push({ role: 'tool', tool_call_id: call.id, content: resultJson })
      }

      if (navCall) {
        const action = getAgentAction(surface, JSON.parse(navCall.function.arguments || '{}').actionId ?? '')
        if (action) {
          return NextResponse.json({ reply: `Opening ${action.confirmLabel} for you…`, action: { id: action.id, params: {} } })
        }
      }

      if (toolResultMessages.length === 0) {
        // Tool call(s) present but none we recognised (e.g. a malformed nav call with no match) — stop rather than loop forever.
        return NextResponse.json({ reply: "I couldn't quite match that to something I can do here — could you rephrase?" })
      }

      // Feed the read results back and let the model take the next step.
      messages.push({ role: 'assistant', content: message.content ?? '', tool_calls: message.tool_calls })
      messages.push(...toolResultMessages)
    }

    return NextResponse.json({ reply: "I looked into a few things but couldn't quite land on an answer — could you narrow that down a bit?" })
  } catch (err) {
    console.error('[/api/agent-assistant/ask] error:', err)
    return NextResponse.json({ error: 'The assistant had trouble responding just now — please try again.' }, { status: 502 })
  }
}

function parseArgs(raw: string): Record<string, any> {
  try {
    return JSON.parse(raw || '{}')
  } catch {
    return {}
  }
}

/** For any arg key that matches a key already known from page context, the context value wins — this is what lets create_project use the open user's id automatically instead of trusting whatever (if anything) the model guessed. */
function pickContextForTool(context: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const key of Object.keys(context)) {
    if (context[key]) out[key] = context[key]
  }
  return out
}

async function groqCompletion(messages: ChatMsg[], apiKey: string, tools: unknown[]) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.2, tools, tool_choice: 'auto' }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`LLM API error ${res.status}: ${text}`)
  }

  return res.json()
}
