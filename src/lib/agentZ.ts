import { pickVariant, randomSeed } from './variantSeed'

/**
 * agentZ.ts
 * ───────────
 * Mock "Agent Z" conversation engine for the eligibility wizard's Ask
 * Agent Z hooks (AgentActionButton, consultTrigger notes,
 * FileUploadArea missing-upload prompts). Built so the demo feels
 * real — a typing delay, contextual replies keyed off the field that
 * triggered it, a persisted transcript — without pretending there's a
 * live model or a human on the other end yet.
 *
 * ════════════════════════════════════════════════════════════════
 * API SWAP POINT — when the real backend exists, this is the one
 * function to replace: generateAgentReply(). Every call site already
 * awaits it as a Promise, so swapping the body for a real
 * `POST /api/agent/reply` (or a streaming call) doesn't touch any
 * caller. The conversation persistence (getConversation/appendMessage
 * below) can stay as-is or move server-side — either way the shape
 * (AgentConversation, AgentMessage) is a reasonable place to start a
 * real schema from.
 * ════════════════════════════════════════════════════════════════
 */

export interface AgentMessage {
  id: string
  role: 'agent' | 'user'
  text: string
  at: string
  /** Which field/section this message relates to, if any — shown as a small tag in the transcript. */
  fieldLabel?: string
}

export interface AgentConversation {
  projectId: string
  messages: AgentMessage[]
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'agentz_conversations'

function readAll(): AgentConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AgentConversation[]) : []
  } catch {
    return []
  }
}

function writeAll(conversations: AgentConversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    window.dispatchEvent(new CustomEvent('agentz:changed'))
  } catch {
    // ignore — same tradeoff as the other *Storage.ts mocks
  }
}

export function getConversation(projectId: string): AgentConversation | null {
  return readAll().find(c => c.projectId === projectId) ?? null
}

export function ensureConversation(projectId: string): AgentConversation {
  const existing = getConversation(projectId)
  if (existing) return existing
  const now = new Date().toISOString()
  const created: AgentConversation = { projectId, messages: [], createdAt: now, updatedAt: now }
  writeAll([...readAll(), created])
  return created
}

function nextMessageId(): string {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function appendMessage(
  projectId: string,
  message: Omit<AgentMessage, 'id' | 'at'>
): AgentConversation {
  const all = readAll()
  const idx = all.findIndex(c => c.projectId === projectId)
  const now = new Date().toISOString()
  const full: AgentMessage = { ...message, id: nextMessageId(), at: now }

  if (idx < 0) {
    const created: AgentConversation = { projectId, messages: [full], createdAt: now, updatedAt: now }
    writeAll([...all, created])
    return created
  }

  const updated: AgentConversation = { ...all[idx], messages: [...all[idx].messages, full], updatedAt: now }
  const next = [...all]
  next[idx] = updated
  writeAll(next)
  return updated
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

type Topic = 'tree' | 'flood' | 'hmo' | 'safety' | 'materials' | 'dimensions' | 'access' | 'heritage' | 'general'

function classifyTopic(text: string): Topic {
  const t = text.toLowerCase()
  if (t.includes('tree') || t.includes('hedge') || t.includes('bs5837')) return 'tree'
  if (t.includes('flood') || t.includes('drain') || t.includes('contamina')) return 'flood'
  if (t.includes('hmo') || t.includes('tenant') || t.includes('household') || t.includes('licens')) return 'hmo'
  if (t.includes('safety') || t.includes('gas') || t.includes('electric') || t.includes('epc') || t.includes('alarm')) return 'safety'
  if (t.includes('material') || t.includes('brick') || t.includes('render') || t.includes('roof')) return 'materials'
  if (t.includes('dimension') || t.includes('metre') || t.includes('height') || t.includes('width') || t.includes('area')) return 'dimensions'
  if (t.includes('access') || t.includes('parking') || t.includes('cycle')) return 'access'
  if (t.includes('listed') || t.includes('conservation') || t.includes('heritage')) return 'heritage'
  return 'general'
}

const REPLY_BANK: Record<Topic, string[]> = {
  tree: [
    "Got it — if there's a protected tree on or near the site, we'll usually need a BS5837 arboricultural report before submission. I've flagged this against your application; a specialist can arrange the survey.",
    "Noted. Trees within falling distance of the works typically need an arboricultural impact assessment — I've logged this so it's picked up alongside your application.",
  ],
  flood: [
    "Thanks — sites in Flood Zone 2 or 3 usually need a Flood Risk Assessment alongside a drainage strategy. I've added this to your application for follow-up.",
    "Noted on the flood risk question. If contamination is a possibility too, a Phase 1 desk study is often the next step — logged against your application.",
  ],
  hmo: [
    "Thanks — HMO and licensing questions usually come down to occupant numbers and shared-facility arrangements. I've logged your answer; a licensing specialist will review the specifics.",
    "Got it. Selective and additional licensing requirements vary a lot by council — I've flagged this so someone can confirm exactly what applies here.",
  ],
  safety: [
    "Noted — gas safety, EICR, and EPC documents are usually the first things a licence application asks for. I've logged which ones you still need; happy to help track them down.",
    "Thanks, that's logged. If any of those certificates are missing or out of date, that's usually quick to sort — flagged for follow-up.",
  ],
  materials: [
    "Got it — matching materials to the existing building is usually the safest route for approval. I've noted your answer; a consultant can confirm if match-existing conditions apply here.",
  ],
  dimensions: [
    "Thanks — exact dimensions matter for permitted development limits. I've logged what you've given so far; if anything's still approximate, a quick site measure usually resolves it.",
  ],
  access: [
    "Noted on access and parking. Changes to vehicle access sometimes need highways sign-off separately from planning — flagged for review.",
  ],
  heritage: [
    "Thanks — conservation area and listed building questions usually mean a heritage statement is needed alongside the application. I've logged this for a specialist to confirm.",
  ],
  general: [
    "Thanks, I've noted that against your application — someone from the team will follow up if anything needs a closer look.",
    "Got it, logged. If it turns out we need more detail here, we'll reach out before this holds anything up.",
  ],
}

/**
 * Generates a contextual mock reply with a simulated thinking delay.
 * See the file header — this is the one function to swap for a real
 * agent backend call later.
 */
export async function generateAgentReply(opts: {
  fieldLabel?: string
  context?: string
  userMessage?: string
}): Promise<string> {
  await wait(500 + Math.random() * 600)
  const topic = classifyTopic(`${opts.fieldLabel ?? ''} ${opts.context ?? ''} ${opts.userMessage ?? ''}`)
  const seed = `${opts.fieldLabel ?? ''}::${opts.context ?? ''}::${randomSeed()}`
  return pickVariant(seed, 'agent-reply', REPLY_BANK[topic])
}
