// // import { NextRequest, NextResponse } from 'next/server'
// // import { lookupPostcode, PlanningDataError } from '@/lib/planningData'
// // import { CHAT_FUNNEL_SKILL } from '@/lib/chatSkill'

// // /**
// //  * POST /api/chat/ask
// //  * ─────────────────────
// //  * Runs the funnel skill against the LLM. When the model calls
// //  * lookup_council mid-conversation, we run the REAL postcode lookup
// //  * (same lookupPostcode() /api/planning-check uses) and — if it
// //  * succeeds — return the resolved postcode alongside the reply, so
// //  * the frontend can auto-launch the report question stepper without
// //  * asking the postcode question a second time.
// //  *
// //  * ENV VARS (.env.local):
// //  *   GROQ_API_KEY   — required
// //  *   GROQ_MODEL     — optional, defaults to llama-3.3-70b-versatile
// //  *   GROQ_BASE_URL  — optional, defaults to Groq's endpoint
// //  */

// // const BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1'
// // const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

// // type Role = 'system' | 'user' | 'assistant' | 'tool'

// // interface ChatMsg {
// //   role: Role
// //   content: string
// //   tool_call_id?: string
// //   tool_calls?: unknown[]
// // }

// // interface ResolvedPostcode {
// //   postcode: string
// //   council: string
// //   ward: string | null
// //   country: string
// // }

// // const TOOLS = [
// //   {
// //     type: 'function',
// //     function: {
// //       name: 'lookup_council',
// //       description:
// //         'Look up the real UK council, ward, and country for a postcode using live postcodes.io data. Call this before stating any council name or location-specific fact.',
// //       parameters: {
// //         type: 'object',
// //         properties: {
// //           postcode: { type: 'string', description: 'UK postcode, e.g. "SW19 4AB"' },
// //         },
// //         required: ['postcode'],
// //       },
// //     },
// //   },
// // ]

// // export async function POST(req: NextRequest) {
// //   const apiKey = process.env.GROQ_API_KEY
// //   if (!apiKey) {
// //     return NextResponse.json(
// //       { error: 'GROQ_API_KEY is not set on the server — add it to .env.local and restart the dev server.' },
// //       { status: 500 }
// //     )
// //   }

// //   const body = await req.json().catch(() => null)
// //   const query: string = typeof body?.query === 'string' ? body.query : ''
// //   const history: { role: 'user' | 'assistant'; content: string }[] = Array.isArray(body?.history)
// //     ? body.history
// //     : []

// //   if (!query.trim()) {
// //     return NextResponse.json({ error: 'query is required' }, { status: 400 })
// //   }

// //   const messages: ChatMsg[] = [
// //     { role: 'system', content: CHAT_FUNNEL_SKILL },
// //     ...history,
// //     { role: 'user', content: query },
// //   ]

// //   try {
// //     const { reply, resolvedPostcode } = await runConversationTurn(messages, apiKey)
// //     return NextResponse.json({ reply, resolvedPostcode })
// //   } catch (err) {
// //     console.error('[/api/chat/ask] error:', err)
// //     return NextResponse.json(
// //       { error: 'The assistant had trouble responding just now — please try again.' },
// //       { status: 502 }
// //     )
// //   }
// // }

// // /** One turn: ask the model, run any tool call it requests, ask again if needed. */
// // async function runConversationTurn(
// //   messages: ChatMsg[],
// //   apiKey: string
// // ): Promise<{ reply: string; resolvedPostcode?: ResolvedPostcode }> {
// //   const first = await groqCompletion(messages, apiKey, true)
// //   const firstMessage = first.choices?.[0]?.message

// //   if (!firstMessage?.tool_calls || firstMessage.tool_calls.length === 0) {
// //     let reply = firstMessage?.content ?? "Sorry, I didn't catch that — could you rephrase?"
// //     if (looksLikeCompoundQuestion(reply)) {
// //       reply = await selfCorrectCompoundQuestion(messages, reply, apiKey)
// //     }
// //     return { reply }
// //   }

// //   const toolResultMessages: ChatMsg[] = []
// //   let resolvedPostcode: ResolvedPostcode | undefined

// //   for (const call of firstMessage.tool_calls) {
// //     if (call.function?.name === 'lookup_council') {
// //       const { resultJson, resolved } = await runLookupCouncil(call.function.arguments)
// //       if (resolved) resolvedPostcode = resolved
// //       toolResultMessages.push({ role: 'tool', tool_call_id: call.id, content: resultJson })
// //     } else {
// //       toolResultMessages.push({
// //         role: 'tool',
// //         tool_call_id: call.id,
// //         content: JSON.stringify({ error: `Unknown tool: ${call.function?.name}` }),
// //       })
// //     }
// //   }

// //   const followUp: ChatMsg[] = [
// //     ...messages,
// //     { role: 'assistant', content: firstMessage.content ?? '', tool_calls: firstMessage.tool_calls },
// //     ...toolResultMessages,
// //   ]

// //   const second = await groqCompletion(followUp, apiKey, false)
// //   let reply = second.choices?.[0]?.message?.content ?? "Sorry, I didn't catch that — could you rephrase?"

// //   if (looksLikeCompoundQuestion(reply)) {
// //     reply = await selfCorrectCompoundQuestion(followUp, reply, apiKey)
// //   }

// //   return { reply, resolvedPostcode }
// // }

// // /**
// //  * Catches the loophole a model can exploit: joining two separate asks
// //  * into ONE grammatical sentence with only one "?" (e.g. "how big is it,
// //  * and also what's your postcode?"). A raw question-mark count misses
// //  * this — this checks for conjunction words tying two request-shaped
// //  * clauses together ahead of a single trailing "?".
// //  */
// // function looksLikeCompoundQuestion(text: string): boolean {
// //   const questionMarks = (text.match(/\?/g) || []).length
// //   if (questionMarks > 1) return true
// //   const compoundPattern =
// //     /\b(and also|as well as|and do you|and does|and did|and can|and could|, and)\b[^?]{0,80}\?/i
// //   return compoundPattern.test(text)
// // }

// // /** One extra LLM call, only when the compound-question pattern is detected, asking it to fix its own last message. */
// // async function selfCorrectCompoundQuestion(
// //   priorMessages: ChatMsg[],
// //   badReply: string,
// //   apiKey: string
// // ): Promise<string> {
// //   const correctionMessages: ChatMsg[] = [
// //     ...priorMessages,
// //     { role: 'assistant', content: badReply },
// //     {
// //       role: 'user',
// //       content:
// //         'That message asked more than one thing in a single sentence. Rewrite it to ask about only ONE thing — pick the single most useful one and drop the rest. Reply with only the corrected message, nothing else.',
// //     },
// //   ]
// //   try {
// //     const corrected = await groqCompletion(correctionMessages, apiKey, false)
// //     return corrected.choices?.[0]?.message?.content ?? badReply
// //   } catch {
// //     return badReply
// //   }
// // }

// // /** Calls the REAL postcode → council lookup already used by /api/planning-check. */
// // async function runLookupCouncil(
// //   rawArgs: string
// // ): Promise<{ resultJson: string; resolved?: ResolvedPostcode }> {
// //   try {
// //     const args = JSON.parse(rawArgs || '{}')
// //     const postcode = typeof args.postcode === 'string' ? args.postcode : ''
// //     const location = await lookupPostcode(postcode)
// //     const resolved: ResolvedPostcode = {
// //       postcode: location.postcode,
// //       council: location.council,
// //       ward: location.ward ?? null,
// //       country: location.country,
// //     }
// //     return { resultJson: JSON.stringify(resolved), resolved }
// //   } catch (err) {
// //     return {
// //       resultJson: JSON.stringify({
// //         error:
// //           err instanceof PlanningDataError
// //             ? err.message
// //             : 'Postcode lookup failed — ask the person to double-check the postcode and try again.',
// //       }),
// //     }
// //   }
// // }

// // async function groqCompletion(messages: ChatMsg[], apiKey: string, withTools: boolean) {
// //   const res = await fetch(`${BASE_URL}/chat/completions`, {
// //     method: 'POST',
// //     headers: {
// //       'Content-Type': 'application/json',
// //       Authorization: `Bearer ${apiKey}`,
// //     },
// //     body: JSON.stringify({
// //       model: MODEL,
// //       messages,
// //       temperature: 0.3,
// //       ...(withTools ? { tools: TOOLS, tool_choice: 'auto' } : {}),
// //     }),
// //   })

// //   if (!res.ok) {
// //     const text = await res.text().catch(() => '')
// //     throw new Error(`LLM API error ${res.status}: ${text}`)
// //   }

// //   return res.json()
// // }


// import { NextRequest, NextResponse } from 'next/server'
// import { lookupPostcode, checkPlanningConstraints, PlanningDataError, type PlanningConstraint } from '@/lib/planningData'
// import { CHAT_FUNNEL_SKILL } from '@/lib/chatSkill'
// import { QUESTION_SLOTS } from '@/lib/questionSlots'

// /**
//  * POST /api/chat/ask
//  * ─────────────────────
//  * Runs the funnel skill against the LLM. When the model calls
//  * lookup_council mid-conversation, we run the REAL postcode lookup
//  * (same lookupPostcode() /api/planning-check uses) and — if it
//  * succeeds — return the resolved postcode alongside the reply, so
//  * the frontend can auto-launch the report question stepper without
//  * asking the postcode question a second time.
//  *
//  * When the model calls ask_choice instead of replying with plain
//  * text, we skip the usual second completion pass and return its
//  * prompt/options as resolvedChoice — the frontend renders that as
//  * tappable option chips (via NumberedCard) instead of a text bubble.
//  *
//  * ENV VARS (.env.local):
//  *   GROQ_API_KEY   — required
//  *   GROQ_MODEL     — optional, defaults to llama-3.3-70b-versatile
//  *   GROQ_BASE_URL  — optional, defaults to Groq's endpoint
//  */

// const BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1'
// const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'

// type Role = 'system' | 'user' | 'assistant' | 'tool'

// interface ChatMsg {
//   role: Role
//   content: string
//   tool_call_id?: string
//   tool_calls?: unknown[]
// }

// interface ResolvedPostcode {
//   postcode: string
//   council: string
//   ward: string | null
//   country: string
// }

// /**
//  * Every slot except postcode is directly resolvable from free chat text —
//  * postcode stays on its own dedicated lookup_council tool because it needs
//  * a live postcodes.io call, not just a value the model read off the text.
//  * Pulling straight from QUESTION_SLOTS (the same schema the stepper itself
//  * asks from) means a new slot added there — ownership, budget, whatever
//  * comes next — is resolvable from chat automatically: no new tool, no new
//  * handler, no new skill prose to remember to add.
//  */
// const RESOLVABLE_SLOTS = QUESTION_SLOTS.filter(q => q.id !== 'postcode')
// const SLOT_IDS = RESOLVABLE_SLOTS.map(q => q.id)

// function describeSlotsForPrompt(): string {
//   return RESOLVABLE_SLOTS.map(q => {
//     const values = q.options ? ` — allowed values: ${q.options.map(o => o.value).join(', ')}` : ' — free text'
//     return `- ${q.id}: "${q.prompt}"${values}`
//   }).join('\n')
// }

// const TOOLS = [
//   {
//     type: 'function',
//     function: {
//       name: 'lookup_council',
//       description:
//         'Look up the real UK council, ward, and country for a postcode using live postcodes.io data. Call this before stating any council name or location-specific fact.',
//       parameters: {
//         type: 'object',
//         properties: {
//           postcode: { type: 'string', description: 'UK postcode, e.g. "SW19 4AB"' },
//         },
//         required: ['postcode'],
//       },
//     },
//   },
//   {
//     type: 'function',
//     function: {
//       name: 'resolve_answer',
//       description:
//         "Record the answer to one of the site's fixed intake questions the moment it's clear from what the person has said — even if the guided question flow hasn't reached that question yet. This lets the site skip re-asking something already covered in free conversation. Call it once per turn for each slot that's newly clear or has changed. Available slots:\n" +
//         describeSlotsForPrompt(),
//       parameters: {
//         type: 'object',
//         properties: {
//           slotId: {
//             type: 'string',
//             enum: SLOT_IDS,
//             description: 'Which intake question this answers — must be one of the ids listed above.',
//           },
//           value: {
//             type: 'string',
//             description:
//               "The canonical value for that slot. For a slot with allowed values, this MUST be exactly one of them (never invent a new one). For a free-text slot, the person's own words.",
//           },
//         },
//         required: ['slotId', 'value'],
//       },
//     },
//   },
//   {
//     type: 'function',
//     function: {
//       name: 'ask_choice',
//       description:
//         'Ask the person a question that has a short set of natural options (2-6) — persona disambiguation, category picks, "which of these applies to you" branching. Call this INSTEAD OF writing the question as plain text whenever your next message is fundamentally a pick-one-of-these. Put the complete natural question, including any friendly lead-in, in prompt — that is exactly what gets shown, so do not also repeat it as your own message content. Put short tappable labels (a few words each) in options, in the order they should appear. Reserve plain text for genuinely open-ended asks (postcode, size, free description) where typing is the natural input. Call at most once per turn, and never alongside your own separate free-text question in the same reply.',
//       parameters: {
//         type: 'object',
//         properties: {
//           prompt: {
//             type: 'string',
//             description: 'The full question to show, phrased naturally — this is the only place the question text should appear.',
//           },
//           options: {
//             type: 'array',
//             items: { type: 'string' },
//             minItems: 2,
//             maxItems: 6,
//             description: '2-6 short option labels, in display order.',
//           },
//         },
//         required: ['prompt', 'options'],
//       },
//     },
//   },
//   {
//     type: 'function',
//     function: {
//       name: 'check_planning_constraints',
//       description:
//         'Check REAL, live planning constraints for a location using planning.data.gov.uk — flood risk, Green Belt, Area of Outstanding Natural Beauty, National Park, listed building, conservation area, scheduled monument, SSSI, ancient woodland, Tree Preservation Orders, air quality management area, and Article 4 direction. Call this right after lookup_council resolves coordinates, whenever a constraint status could change your advice (extensions, conversions, anything conservation/heritage/environment-adjacent). NEVER state or imply a constraint status (e.g. "you\'re not in a conservation area") without having called this first — that would be a guess dressed up as a fact. Only call once per postcode per conversation; reuse the earlier result if you already checked it.',
//       parameters: {
//         type: 'object',
//         properties: {
//           latitude: { type: 'number', description: 'From the coordinates lookup_council/postcodes.io returned for this postcode.' },
//           longitude: { type: 'number', description: 'From the coordinates lookup_council/postcodes.io returned for this postcode.' },
//         },
//         required: ['latitude', 'longitude'],
//       },
//     },
//   },
//   {
//     type: 'function',
//     function: {
//       name: 'suggest_partner_handoff',
//       description:
//         'Call this when the question genuinely needs a qualified professional AI4Planning can match them with — structural engineering, party wall matters, full architectural drawings, formal application submission, or anything Step 0.5\'s domain-boundary test rules out of scope for a chat answer. This renders a partner-connect card instead of you writing a vague "consult a professional" sentence yourself. Do not call it for ordinary planning questions this skill already handles — only genuine handoffs.',
//       parameters: {
//         type: 'object',
//         properties: {
//           reason: {
//             type: 'string',
//             description: 'One short, natural sentence explaining why a professional is the right next step here — this is shown to the person, so write it in your own conversational voice, not a generic disclaimer.',
//           },
//           specialism: {
//             type: 'string',
//             description: 'The kind of professional needed, e.g. "Structural engineer", "Party wall surveyor", "Architect".',
//           },
//         },
//         required: ['reason', 'specialism'],
//       },
//     },
//   },
// ]

// export async function POST(req: NextRequest) {
//   const apiKey = process.env.GROQ_API_KEY
//   if (!apiKey) {
//     return NextResponse.json(
//       { error: 'GROQ_API_KEY is not set on the server — add it to .env.local and restart the dev server.' },
//       { status: 500 }
//     )
//   }

//   const body = await req.json().catch(() => null)
//   const query: string = typeof body?.query === 'string' ? body.query : ''
//   const history: { role: 'user' | 'assistant'; content: string }[] = Array.isArray(body?.history)
//     ? body.history
//     : []

//   if (!query.trim()) {
//     return NextResponse.json({ error: 'query is required' }, { status: 400 })
//   }

//   const messages: ChatMsg[] = [
//     { role: 'system', content: CHAT_FUNNEL_SKILL },
//     ...history,
//     { role: 'user', content: query },
//   ]

//   try {
//     const { reply, resolvedPostcode, resolvedSlots, resolvedChoice, resolvedConstraints, resolvedPartnerHandoff } =
//       await runConversationTurn(messages, apiKey)
//     return NextResponse.json({
//       reply,
//       resolvedPostcode,
//       resolvedSlots,
//       resolvedChoice,
//       resolvedConstraints,
//       resolvedPartnerHandoff,
//     })
//   } catch (err) {
//     if (err instanceof RateLimitError) {
//       console.warn('[/api/chat/ask] rate limited:', err.retryAfterSeconds, 's')
//       return NextResponse.json(
//         {
//           error: `The assistant is at its usage limit for the moment — please try again in about ${formatWait(
//             err.retryAfterSeconds
//           )}.`,
//           retryAfterSeconds: err.retryAfterSeconds,
//         },
//         { status: 429 }
//       )
//     }

//     console.error('[/api/chat/ask] error:', err)
//     const detail = err instanceof Error ? err.message : String(err)
//     return NextResponse.json(
//       {
//         error: 'The assistant had trouble responding just now — please try again.',
//         // Only exposed outside production so you can see the real cause
//         // (e.g. a 429 rate limit) without digging through server logs.
//         ...(process.env.NODE_ENV !== 'production' ? { detail } : {}),
//       },
//       { status: 502 }
//     )
//   }
// }

// /** "11m19s" / "45s" — for the rate-limit message shown to the person. */
// function formatWait(totalSeconds: number): string {
//   const minutes = Math.floor(totalSeconds / 60)
//   const seconds = Math.round(totalSeconds % 60)
//   if (minutes === 0) return `${seconds}s`
//   return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`
// }

// /**
//  * One turn: ask the model, run whatever tools it requests, feed the
//  * results back, and repeat — up to MAX_TOOL_ROUNDS times — until it
//  * produces a plain-text reply (or hits a terminal tool like ask_choice
//  * / suggest_partner_handoff, which IS the reply for that turn).
//  *
//  * This is what actually lets the model chain real lookups — e.g.
//  * lookup_council to resolve coordinates, THEN check_planning_constraints
//  * against those coordinates, THEN answer citing both — instead of being
//  * limited to one round of tool calls before being forced to answer
//  * with whatever it had after the first round.
//  */
// const MAX_TOOL_ROUNDS = 4

// async function runConversationTurn(
//   messages: ChatMsg[],
//   apiKey: string
// ): Promise<{
//   reply: string
//   resolvedPostcode?: ResolvedPostcode
//   resolvedSlots?: Record<string, string>
//   resolvedChoice?: { prompt: string; options: string[] }
//   resolvedConstraints?: PlanningConstraint[]
//   resolvedPartnerHandoff?: { reason: string; specialism: string }
// }> {
//   let working = messages
//   let resolvedPostcode: ResolvedPostcode | undefined
//   let resolvedSlots: Record<string, string> | undefined
//   let resolvedChoice: { prompt: string; options: string[] } | undefined
//   let resolvedConstraints: PlanningConstraint[] | undefined
//   let resolvedPartnerHandoff: { reason: string; specialism: string } | undefined

//   for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
//     const completion = await groqCompletion(working, apiKey, true)
//     const message = completion.choices?.[0]?.message

//     if (!message?.tool_calls || message.tool_calls.length === 0) {
//       let reply = message?.content ?? "Sorry, I didn't catch that — could you rephrase?"
//       if (looksLikeCompoundQuestion(reply)) {
//         reply = await selfCorrectCompoundQuestion(working, reply, apiKey)
//       }
//       return { reply, resolvedPostcode, resolvedSlots, resolvedConstraints, resolvedPartnerHandoff }
//     }

//     const toolResultMessages: ChatMsg[] = []

//     for (const call of message.tool_calls) {
//       if (call.function?.name === 'lookup_council') {
//         const { resultJson, resolved } = await runLookupCouncil(call.function.arguments)
//         if (resolved) resolvedPostcode = resolved
//         toolResultMessages.push({ role: 'tool', tool_call_id: call.id, content: resultJson })
//       } else if (call.function?.name === 'check_planning_constraints') {
//         const { resultJson, resolved } = await runCheckPlanningConstraints(call.function.arguments)
//         if (resolved) resolvedConstraints = resolved
//         toolResultMessages.push({ role: 'tool', tool_call_id: call.id, content: resultJson })
//       } else if (call.function?.name === 'resolve_answer') {
//         const { resultJson, resolved } = runResolveAnswer(call.function.arguments)
//         if (resolved) resolvedSlots = { ...resolvedSlots, [resolved.slotId]: resolved.value }
//         toolResultMessages.push({ role: 'tool', tool_call_id: call.id, content: resultJson })
//       } else if (call.function?.name === 'ask_choice') {
//         const { resultJson, resolved } = runAskChoice(call.function.arguments)
//         if (resolved) resolvedChoice = resolved
//         toolResultMessages.push({ role: 'tool', tool_call_id: call.id, content: resultJson })
//       } else if (call.function?.name === 'suggest_partner_handoff') {
//         const { resultJson, resolved } = runSuggestPartnerHandoff(call.function.arguments)
//         if (resolved) resolvedPartnerHandoff = resolved
//         toolResultMessages.push({ role: 'tool', tool_call_id: call.id, content: resultJson })
//       } else {
//         toolResultMessages.push({
//           role: 'tool',
//           tool_call_id: call.id,
//           content: JSON.stringify({ error: `Unknown tool: ${call.function?.name}` }),
//         })
//       }
//     }

//     // ask_choice / suggest_partner_handoff are terminal for this turn —
//     // their structured payload IS the reply. Continuing the loop would
//     // just have the model re-explain or duplicate it as free text, so
//     // return immediately rather than feeding these results back in.
//     if (resolvedChoice) {
//       return { reply: resolvedChoice.prompt, resolvedPostcode, resolvedSlots, resolvedChoice, resolvedConstraints }
//     }
//     if (resolvedPartnerHandoff) {
//       return {
//         reply: resolvedPartnerHandoff.reason,
//         resolvedPostcode,
//         resolvedSlots,
//         resolvedConstraints,
//         resolvedPartnerHandoff,
//       }
//     }

//     // Otherwise (lookup_council / check_planning_constraints / resolve_answer,
//     // alone or combined) feed the results back and loop — the model might
//     // chain straight into another tool call (e.g. council lookup then
//     // constraint check) before it's ready to actually answer.
//     working = [
//       ...working,
//       { role: 'assistant', content: message.content ?? '', tool_calls: message.tool_calls },
//       ...toolResultMessages,
//     ]
//   }

//   // Exhausted MAX_TOOL_ROUNDS without a final text reply — ask one more
//   // time with tools disabled so the model is forced to answer with
//   // whatever it's gathered so far, rather than looping indefinitely.
//   const final = await groqCompletion(working, apiKey, false)
//   let reply = final.choices?.[0]?.message?.content ?? "Sorry, I didn't catch that — could you rephrase?"
//   if (looksLikeCompoundQuestion(reply)) {
//     reply = await selfCorrectCompoundQuestion(working, reply, apiKey)
//   }
//   return { reply, resolvedPostcode, resolvedSlots, resolvedConstraints, resolvedPartnerHandoff }
// }

// /**
//  * Catches the loophole a model can exploit: joining two separate asks
//  * into ONE grammatical sentence with only one "?" (e.g. "how big is it,
//  * and also what's your postcode?"). A raw question-mark count misses
//  * this — this checks for conjunction words tying two request-shaped
//  * clauses together ahead of a single trailing "?".
//  */
// function looksLikeCompoundQuestion(text: string): boolean {
//   const questionMarks = (text.match(/\?/g) || []).length
//   if (questionMarks > 1) return true
//   const compoundPattern =
//     /\b(and also|as well as|and do you|and does|and did|and can|and could|, and)\b[^?]{0,80}\?/i
//   return compoundPattern.test(text)
// }

// /** One extra LLM call, only when the compound-question pattern is detected, asking it to fix its own last message. */
// async function selfCorrectCompoundQuestion(
//   priorMessages: ChatMsg[],
//   badReply: string,
//   apiKey: string
// ): Promise<string> {
//   const correctionMessages: ChatMsg[] = [
//     ...priorMessages,
//     { role: 'assistant', content: badReply },
//     {
//       role: 'user',
//       content:
//         'That message asked more than one thing in a single sentence. Rewrite it to ask about only ONE thing — pick the single most useful one and drop the rest. Reply with only the corrected message, nothing else.',
//     },
//   ]
//   try {
//     const corrected = await groqCompletion(correctionMessages, apiKey, false)
//     return corrected.choices?.[0]?.message?.content ?? badReply
//   } catch {
//     return badReply
//   }
// }

// /** Calls the REAL postcode → council lookup already used by /api/planning-check. */
// async function runLookupCouncil(
//   rawArgs: string
// ): Promise<{ resultJson: string; resolved?: ResolvedPostcode }> {
//   try {
//     const args = JSON.parse(rawArgs || '{}')
//     const postcode = typeof args.postcode === 'string' ? args.postcode : ''
//     const location = await lookupPostcode(postcode)
//     const resolved: ResolvedPostcode = {
//       postcode: location.postcode,
//       council: location.council,
//       ward: location.ward ?? null,
//       country: location.country,
//     }
//     // The tool result also carries the coordinates (not part of
//     // ResolvedPostcode, which is only what the frontend needs for its
//     // "Got it — that's in <council>" ack) — this is what lets the model
//     // chain straight into check_planning_constraints in the same turn
//     // without asking the person for anything more.
//     return {
//       resultJson: JSON.stringify({
//         ...resolved,
//         latitude: location.coordinates.latitude,
//         longitude: location.coordinates.longitude,
//       }),
//       resolved,
//     }
//   } catch (err) {
//     return {
//       resultJson: JSON.stringify({
//         error:
//           err instanceof PlanningDataError
//             ? err.message
//             : 'Postcode lookup failed — ask the person to double-check the postcode and try again.',
//       }),
//     }
//   }
// }

// /** Calls the REAL planning.data.gov.uk constraint check — same data source /api/planning-check's report generation already relies on, now available mid-chat too. */
// async function runCheckPlanningConstraints(
//   rawArgs: string
// ): Promise<{ resultJson: string; resolved?: PlanningConstraint[] }> {
//   try {
//     const args = JSON.parse(rawArgs || '{}')
//     const latitude = Number(args.latitude)
//     const longitude = Number(args.longitude)
//     if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
//       return { resultJson: JSON.stringify({ error: 'latitude and longitude must both be numbers.' }) }
//     }
//     const constraints = await checkPlanningConstraints({ latitude, longitude })
//     return { resultJson: JSON.stringify({ constraints }), resolved: constraints }
//   } catch (err) {
//     return {
//       resultJson: JSON.stringify({
//         error:
//           err instanceof PlanningDataError
//             ? err.message
//             : 'Constraint check failed — try again, or answer without it and say the check could not be completed.',
//       }),
//     }
//   }
// }

// /**
//  * Validates the model's slotId/value against QUESTION_SLOTS — no external
//  * call needed. Rejects an unknown slotId, and for an options-type slot,
//  * rejects any value that isn't one of its canonical option values (the
//  * model is never allowed to invent one, same guarantee /api/chat/questions
//  * already gives reportContent.ts elsewhere).
//  */
// function runResolveAnswer(rawArgs: string): { resultJson: string; resolved?: { slotId: string; value: string } } {
//   try {
//     const args = JSON.parse(rawArgs || '{}')
//     const slotId = typeof args.slotId === 'string' ? args.slotId : ''
//     const value = typeof args.value === 'string' ? args.value.trim() : ''

//     const slot = RESOLVABLE_SLOTS.find(q => q.id === slotId)
//     if (!slot) {
//       return { resultJson: JSON.stringify({ error: `Unknown slotId: ${slotId}` }) }
//     }
//     if (!value) {
//       return { resultJson: JSON.stringify({ error: 'value must not be empty' }) }
//     }
//     if (slot.options && !slot.options.some(o => o.value === value)) {
//       return {
//         resultJson: JSON.stringify({
//           error: `Invalid value "${value}" for slot "${slotId}". Allowed: ${slot.options.map(o => o.value).join(', ')}`,
//         }),
//       }
//     }

//     return { resultJson: JSON.stringify({ slotId, value }), resolved: { slotId, value } }
//   } catch {
//     return { resultJson: JSON.stringify({ error: 'Could not parse resolve_answer arguments.' }) }
//   }
// }

// /**
//  * Validates the model's ask_choice arguments — a non-empty prompt and
//  * 2-6 non-empty option labels, de-duplicated and trimmed. No external
//  * call needed; this is the same kind of shape-guard runResolveAnswer
//  * does for slot values, just for an ad-hoc choice question instead of
//  * a fixed intake slot.
//  */
// function runAskChoice(rawArgs: string): {
//   resultJson: string
//   resolved?: { prompt: string; options: string[] }
// } {
//   try {
//     const args = JSON.parse(rawArgs || '{}')
//     const prompt = typeof args.prompt === 'string' ? args.prompt.trim() : ''
//     const rawOptions = Array.isArray(args.options) ? args.options : []
//     const options = Array.from(
//       new Set(
//         rawOptions
//           .filter((o: unknown): o is string => typeof o === 'string')
//           .map((o: string) => o.trim())
//           .filter(Boolean)
//       )
//     )

//     if (!prompt) {
//       return { resultJson: JSON.stringify({ error: 'prompt must not be empty' }) }
//     }
//     if (options.length < 2 || options.length > 6) {
//       return {
//         resultJson: JSON.stringify({
//           error: `options must have between 2 and 6 entries (got ${options.length})`,
//         }),
//       }
//     }

//     return { resultJson: JSON.stringify({ prompt, options }), resolved: { prompt, options } }
//   } catch {
//     return { resultJson: JSON.stringify({ error: 'Could not parse ask_choice arguments.' }) }
//   }
// }

// /** Validates the model's suggest_partner_handoff arguments — non-empty reason and specialism, no external call needed. */
// function runSuggestPartnerHandoff(rawArgs: string): {
//   resultJson: string
//   resolved?: { reason: string; specialism: string }
// } {
//   try {
//     const args = JSON.parse(rawArgs || '{}')
//     const reason = typeof args.reason === 'string' ? args.reason.trim() : ''
//     const specialism = typeof args.specialism === 'string' ? args.specialism.trim() : ''

//     if (!reason || !specialism) {
//       return { resultJson: JSON.stringify({ error: 'reason and specialism must both be non-empty.' }) }
//     }

//     return { resultJson: JSON.stringify({ reason, specialism }), resolved: { reason, specialism } }
//   } catch {
//     return { resultJson: JSON.stringify({ error: 'Could not parse suggest_partner_handoff arguments.' }) }
//   }
// }

// /** Thrown when Groq is rate-limited for long enough that retrying now can't help. */
// class RateLimitError extends Error {
//   retryAfterSeconds: number
//   constructor(retryAfterSeconds: number) {
//     super(`Rate limited — try again in ${retryAfterSeconds}s`)
//     this.name = 'RateLimitError'
//     this.retryAfterSeconds = retryAfterSeconds
//   }
// }

// /**
//  * Groq's 429 body includes a message like "Please try again in 11m19.104s"
//  * for daily/hourly token caps — that's the authoritative wait time, not
//  * the standard `Retry-After` header (which Groq doesn't reliably send for
//  * these). Falls back to the header, then null if neither is present.
//  */
// function parseRetryAfterSeconds(res: Response, bodyText: string): number | null {
//   const match = bodyText.match(/try again in\s+(?:(\d+)h)?\s*(?:(\d+)m)?\s*([\d.]+)s/i)
//   if (match) {
//     const hours = Number(match[1] || 0)
//     const minutes = Number(match[2] || 0)
//     const seconds = Number(match[3] || 0)
//     return Math.ceil(hours * 3600 + minutes * 60 + seconds)
//   }
//   const header = res.headers.get('retry-after')
//   if (header && !Number.isNaN(Number(header))) return Number(header)
//   return null
// }

// async function groqCompletion(messages: ChatMsg[], apiKey: string, withTools: boolean, attempt = 0): Promise<any> {
//   const res = await fetch(`${BASE_URL}/chat/completions`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${apiKey}`,
//     },
//     body: JSON.stringify({
//       model: MODEL,
//       messages,
//       temperature: 0.3,
//       ...(withTools ? { tools: TOOLS, tool_choice: 'auto' } : {}),
//     }),
//   })

//   if (res.status === 429) {
//     const text = await res.text().catch(() => '')
//     const retryAfterSeconds = parseRetryAfterSeconds(res, text)

//     // A short throttle (a few seconds) is worth a couple of quick retries —
//     // that's the request-per-second limit, and it clears fast. A long wait
//     // (minutes) means a daily/hourly token cap has been hit — no amount of
//     // retrying in the next few seconds will fix that, so fail fast with an
//     // honest message instead of burning more calls against a wait we can't
//     // beat.
//     if (retryAfterSeconds !== null && retryAfterSeconds > 5) {
//       throw new RateLimitError(retryAfterSeconds)
//     }

//     if (attempt < 2) {
//       const waitMs = attempt === 0 ? 500 : 1500
//       await new Promise(r => setTimeout(r, waitMs))
//       return groqCompletion(messages, apiKey, withTools, attempt + 1)
//     }

//     throw new RateLimitError(retryAfterSeconds ?? 30)
//   }

//   if (!res.ok) {
//     const text = await res.text().catch(() => '')
//     throw new Error(`LLM API error ${res.status}: ${text}`)
//   }

//   return res.json()
// }


import { NextRequest, NextResponse } from 'next/server'
import { lookupPostcode, checkPlanningConstraints, PlanningDataError, type PlanningConstraint } from '@/lib/planningData'
import { CHAT_FUNNEL_SKILL } from '@/lib/chatSkill'
import { QUESTION_SLOTS } from '@/lib/questionSlots'

/**
 * POST /api/chat/ask
 * ─────────────────────
 * Runs the funnel skill against the LLM. When the model calls
 * lookup_council mid-conversation, we run the REAL postcode lookup
 * (same lookupPostcode() /api/planning-check uses) and — if it
 * succeeds — return the resolved postcode alongside the reply, so
 * the frontend can auto-launch the report question stepper without
 * asking the postcode question a second time.
 *
 * When the model calls ask_choice instead of replying with plain
 * text, we skip the usual second completion pass and return its
 * prompt/options as resolvedChoice — the frontend renders that as
 * tappable option chips (via NumberedCard) instead of a text bubble.
 *
 * ENV VARS (.env.local):
 *   GROQ_API_KEY   — required
 *   GROQ_MODEL     — optional, defaults to llama-3.3-70b-versatile
 *   GROQ_BASE_URL  — optional, defaults to Groq's endpoint
 */

const BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1'
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'

type Role = 'system' | 'user' | 'assistant' | 'tool'

interface ChatMsg {
  role: Role
  content: string
  tool_call_id?: string
  tool_calls?: unknown[]
}

interface ResolvedPostcode {
  postcode: string
  council: string
  ward: string | null
  country: string
}

/**
 * Every slot except postcode is directly resolvable from free chat text —
 * postcode stays on its own dedicated lookup_council tool because it needs
 * a live postcodes.io call, not just a value the model read off the text.
 * Pulling straight from QUESTION_SLOTS (the same schema the stepper itself
 * asks from) means a new slot added there — ownership, budget, whatever
 * comes next — is resolvable from chat automatically: no new tool, no new
 * handler, no new skill prose to remember to add.
 */
const RESOLVABLE_SLOTS = QUESTION_SLOTS.filter(q => q.id !== 'postcode')
const SLOT_IDS = RESOLVABLE_SLOTS.map(q => q.id)

function describeSlotsForPrompt(): string {
  return RESOLVABLE_SLOTS.map(q => {
    const values = q.options ? ` — allowed values: ${q.options.map(o => o.value).join(', ')}` : ' — free text'
    return `- ${q.id}: "${q.prompt}"${values}`
  }).join('\n')
}

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'lookup_council',
      description:
        'Look up the real UK council, ward, and country for a postcode using live postcodes.io data. Call this before stating any council name or location-specific fact.',
      parameters: {
        type: 'object',
        properties: {
          postcode: { type: 'string', description: 'UK postcode, e.g. "SW19 4AB"' },
        },
        required: ['postcode'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'resolve_answer',
      description:
        "Record the answer to one of the site's fixed intake questions the moment it's clear from what the person has said — even if the guided question flow hasn't reached that question yet. This lets the site skip re-asking something already covered in free conversation. Call it once per turn for each slot that's newly clear or has changed. Available slots:\n" +
        describeSlotsForPrompt(),
      parameters: {
        type: 'object',
        properties: {
          slotId: {
            type: 'string',
            enum: SLOT_IDS,
            description: 'Which intake question this answers — must be one of the ids listed above.',
          },
          value: {
            type: 'string',
            description:
              "The canonical value for that slot. For a slot with allowed values, this MUST be exactly one of them (never invent a new one). For a free-text slot, the person's own words.",
          },
        },
        required: ['slotId', 'value'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'ask_choice',
      description:
        'Ask the person a question that has a short set of natural options (2-6) — persona disambiguation, category picks, "which of these applies to you" branching. Call this INSTEAD OF writing the question as plain text whenever your next message is fundamentally a pick-one-of-these. Put the complete natural question, including any friendly lead-in, in prompt — that is exactly what gets shown, so do not also repeat it as your own message content. Put short tappable labels (a few words each) in options, in the order they should appear. Reserve plain text for genuinely open-ended asks (postcode, size, free description) where typing is the natural input. Call at most once per turn, and never alongside your own separate free-text question in the same reply.',
      parameters: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The full question to show, phrased naturally — this is the only place the question text should appear.',
          },
          options: {
            type: 'array',
            items: { type: 'string' },
            minItems: 2,
            maxItems: 6,
            description: '2-6 short option labels, in display order.',
          },
        },
        required: ['prompt', 'options'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_planning_constraints',
      description:
        'Check REAL, live planning constraints for a location using planning.data.gov.uk — flood risk, Green Belt, Area of Outstanding Natural Beauty, National Park, listed building, conservation area, scheduled monument, SSSI, ancient woodland, Tree Preservation Orders, air quality management area, and Article 4 direction. Call this right after lookup_council resolves coordinates, whenever a constraint status could change your advice (extensions, conversions, anything conservation/heritage/environment-adjacent). NEVER state or imply a constraint status (e.g. "you\'re not in a conservation area") without having called this first — that would be a guess dressed up as a fact. Only call once per postcode per conversation; reuse the earlier result if you already checked it.',
      parameters: {
        type: 'object',
        properties: {
          latitude: { type: 'number', description: 'From the coordinates lookup_council/postcodes.io returned for this postcode.' },
          longitude: { type: 'number', description: 'From the coordinates lookup_council/postcodes.io returned for this postcode.' },
        },
        required: ['latitude', 'longitude'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_partner_handoff',
      description:
        'Call this when the question genuinely needs a qualified professional AI4Planning can match them with — structural engineering, party wall matters, full architectural drawings, formal application submission, or anything Step 0.5\'s domain-boundary test rules out of scope for a chat answer. This renders a partner-connect card instead of you writing a vague "consult a professional" sentence yourself. Do not call it for ordinary planning questions this skill already handles — only genuine handoffs.',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'One short, natural sentence explaining why a professional is the right next step here — this is shown to the person, so write it in your own conversational voice, not a generic disclaimer.',
          },
          specialism: {
            type: 'string',
            description: 'The kind of professional needed, e.g. "Structural engineer", "Party wall surveyor", "Architect".',
          },
        },
        required: ['reason', 'specialism'],
      },
    },
  },
]

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY is not set on the server — add it to .env.local and restart the dev server.' },
      { status: 500 }
    )
  }

  const body = await req.json().catch(() => null)
  const query: string = typeof body?.query === 'string' ? body.query : ''
  const history: { role: 'user' | 'assistant'; content: string }[] = Array.isArray(body?.history)
    ? body.history
    : []

  if (!query.trim()) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  const messages: ChatMsg[] = [
    { role: 'system', content: CHAT_FUNNEL_SKILL },
    ...history,
    { role: 'user', content: query },
  ]

  try {
    const { reply, resolvedPostcode, resolvedSlots, resolvedChoice, resolvedConstraints, resolvedPartnerHandoff } =
      await runConversationTurn(messages, apiKey)
    return NextResponse.json({
      reply,
      resolvedPostcode,
      resolvedSlots,
      resolvedChoice,
      resolvedConstraints,
      resolvedPartnerHandoff,
    })
  } catch (err) {
    if (err instanceof RateLimitError) {
      console.warn('[/api/chat/ask] rate limited:', err.retryAfterSeconds, 's')
      return NextResponse.json(
        {
          error: `The assistant is at its usage limit for the moment — please try again in about ${formatWait(
            err.retryAfterSeconds
          )}.`,
          retryAfterSeconds: err.retryAfterSeconds,
        },
        { status: 429 }
      )
    }

    console.error('[/api/chat/ask] error:', err)
    const detail = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      {
        error: 'The assistant had trouble responding just now — please try again.',
        // Only exposed outside production so you can see the real cause
        // (e.g. a 429 rate limit) without digging through server logs.
        ...(process.env.NODE_ENV !== 'production' ? { detail } : {}),
      },
      { status: 502 }
    )
  }
}

/** "11m19s" / "45s" — for the rate-limit message shown to the person. */
function formatWait(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.round(totalSeconds % 60)
  if (minutes === 0) return `${seconds}s`
  return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`
}

/**
 * One turn: ask the model, run whatever tools it requests, feed the
 * results back, and repeat — up to MAX_TOOL_ROUNDS times — until it
 * produces a plain-text reply (or hits a terminal tool like ask_choice
 * / suggest_partner_handoff, which IS the reply for that turn).
 *
 * This is what actually lets the model chain real lookups — e.g.
 * lookup_council to resolve coordinates, THEN check_planning_constraints
 * against those coordinates, THEN answer citing both — instead of being
 * limited to one round of tool calls before being forced to answer
 * with whatever it had after the first round.
 */
const MAX_TOOL_ROUNDS = 4

async function runConversationTurn(
  messages: ChatMsg[],
  apiKey: string
): Promise<{
  reply: string
  resolvedPostcode?: ResolvedPostcode
  resolvedSlots?: Record<string, string>
  resolvedChoice?: { prompt: string; options: string[] }
  resolvedConstraints?: PlanningConstraint[]
  resolvedPartnerHandoff?: { reason: string; specialism: string }
}> {
  let working = messages
  let resolvedPostcode: ResolvedPostcode | undefined
  let resolvedSlots: Record<string, string> | undefined
  let resolvedChoice: { prompt: string; options: string[] } | undefined
  let resolvedConstraints: PlanningConstraint[] | undefined
  let resolvedPartnerHandoff: { reason: string; specialism: string } | undefined

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const completion = await groqCompletion(working, apiKey, true)
    const message = completion.choices?.[0]?.message

    if (!message?.tool_calls || message.tool_calls.length === 0) {
      let reply = message?.content ?? "Sorry, I didn't catch that — could you rephrase?"
      if (looksLikeCompoundQuestion(reply)) {
        reply = await selfCorrectCompoundQuestion(working, reply, apiKey)
      }
      return { reply, resolvedPostcode, resolvedSlots, resolvedConstraints, resolvedPartnerHandoff }
    }

    const toolResultMessages: ChatMsg[] = []

    for (const call of message.tool_calls) {
      if (call.function?.name === 'lookup_council') {
        const { resultJson, resolved } = await runLookupCouncil(call.function.arguments)
        if (resolved) resolvedPostcode = resolved
        toolResultMessages.push({ role: 'tool', tool_call_id: call.id, content: resultJson })
      } else if (call.function?.name === 'check_planning_constraints') {
        const { resultJson, resolved } = await runCheckPlanningConstraints(call.function.arguments)
        if (resolved) resolvedConstraints = resolved
        toolResultMessages.push({ role: 'tool', tool_call_id: call.id, content: resultJson })
      } else if (call.function?.name === 'resolve_answer') {
        const { resultJson, resolved } = runResolveAnswer(call.function.arguments)
        if (resolved) resolvedSlots = { ...resolvedSlots, [resolved.slotId]: resolved.value }
        toolResultMessages.push({ role: 'tool', tool_call_id: call.id, content: resultJson })
      } else if (call.function?.name === 'ask_choice') {
        const { resultJson, resolved } = runAskChoice(call.function.arguments)
        if (resolved) resolvedChoice = resolved
        toolResultMessages.push({ role: 'tool', tool_call_id: call.id, content: resultJson })
      } else if (call.function?.name === 'suggest_partner_handoff') {
        const { resultJson, resolved } = runSuggestPartnerHandoff(call.function.arguments)
        if (resolved) resolvedPartnerHandoff = resolved
        toolResultMessages.push({ role: 'tool', tool_call_id: call.id, content: resultJson })
      } else {
        toolResultMessages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify({ error: `Unknown tool: ${call.function?.name}` }),
        })
      }
    }

    // ask_choice / suggest_partner_handoff are terminal for this turn —
    // their structured payload IS the reply. Continuing the loop would
    // just have the model re-explain or duplicate it as free text, so
    // return immediately rather than feeding these results back in.
    if (resolvedChoice) {
      return { reply: resolvedChoice.prompt, resolvedPostcode, resolvedSlots, resolvedChoice, resolvedConstraints }
    }
    if (resolvedPartnerHandoff) {
      return {
        reply: resolvedPartnerHandoff.reason,
        resolvedPostcode,
        resolvedSlots,
        resolvedConstraints,
        resolvedPartnerHandoff,
      }
    }

    // Otherwise (lookup_council / check_planning_constraints / resolve_answer,
    // alone or combined) feed the results back and loop — the model might
    // chain straight into another tool call (e.g. council lookup then
    // constraint check) before it's ready to actually answer.
    working = [
      ...working,
      { role: 'assistant', content: message.content ?? '', tool_calls: message.tool_calls },
      ...toolResultMessages,
    ]
  }

  // Exhausted MAX_TOOL_ROUNDS without a final text reply — ask one more
  // time with tools disabled so the model is forced to answer with
  // whatever it's gathered so far, rather than looping indefinitely.
  const final = await groqCompletion(working, apiKey, false)
  let reply = final.choices?.[0]?.message?.content ?? "Sorry, I didn't catch that — could you rephrase?"
  if (looksLikeCompoundQuestion(reply)) {
    reply = await selfCorrectCompoundQuestion(working, reply, apiKey)
  }
  return { reply, resolvedPostcode, resolvedSlots, resolvedConstraints, resolvedPartnerHandoff }
}

/**
 * Catches the loophole a model can exploit: joining two separate asks
 * into ONE grammatical sentence with only one "?" (e.g. "how big is it,
 * and also what's your postcode?"). A raw question-mark count misses
 * this — this checks for conjunction words tying two request-shaped
 * clauses together ahead of a single trailing "?".
 */
function looksLikeCompoundQuestion(text: string): boolean {
  const questionMarks = (text.match(/\?/g) || []).length
  if (questionMarks > 1) return true
  const compoundPattern =
    /\b(and also|as well as|and do you|and does|and did|and can|and could|, and)\b[^?]{0,80}\?/i
  return compoundPattern.test(text)
}

/** One extra LLM call, only when the compound-question pattern is detected, asking it to fix its own last message. */
async function selfCorrectCompoundQuestion(
  priorMessages: ChatMsg[],
  badReply: string,
  apiKey: string
): Promise<string> {
  const correctionMessages: ChatMsg[] = [
    ...priorMessages,
    { role: 'assistant', content: badReply },
    {
      role: 'user',
      content:
        'That message asked more than one thing in a single sentence. Rewrite it to ask about only ONE thing — pick the single most useful one and drop the rest. Reply with only the corrected message, nothing else.',
    },
  ]
  try {
    const corrected = await groqCompletion(correctionMessages, apiKey, false)
    return corrected.choices?.[0]?.message?.content ?? badReply
  } catch {
    return badReply
  }
}

/** Calls the REAL postcode → council lookup already used by /api/planning-check. */
async function runLookupCouncil(
  rawArgs: string
): Promise<{ resultJson: string; resolved?: ResolvedPostcode }> {
  try {
    const args = JSON.parse(rawArgs || '{}')
    const postcode = typeof args.postcode === 'string' ? args.postcode : ''
    const location = await lookupPostcode(postcode)
    const resolved: ResolvedPostcode = {
      postcode: location.postcode,
      council: location.council,
      ward: location.ward ?? null,
      country: location.country,
    }
    // The tool result also carries the coordinates (not part of
    // ResolvedPostcode, which is only what the frontend needs for its
    // "Got it — that's in <council>" ack) — this is what lets the model
    // chain straight into check_planning_constraints in the same turn
    // without asking the person for anything more.
    return {
      resultJson: JSON.stringify({
        ...resolved,
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
      }),
      resolved,
    }
  } catch (err) {
    return {
      resultJson: JSON.stringify({
        error:
          err instanceof PlanningDataError
            ? err.message
            : 'Postcode lookup failed — ask the person to double-check the postcode and try again.',
      }),
    }
  }
}

/** Calls the REAL planning.data.gov.uk constraint check — same data source /api/planning-check's report generation already relies on, now available mid-chat too. */
async function runCheckPlanningConstraints(
  rawArgs: string
): Promise<{ resultJson: string; resolved?: PlanningConstraint[] }> {
  try {
    const args = JSON.parse(rawArgs || '{}')
    const latitude = Number(args.latitude)
    const longitude = Number(args.longitude)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return { resultJson: JSON.stringify({ error: 'latitude and longitude must both be numbers.' }) }
    }
    const constraints = await checkPlanningConstraints({ latitude, longitude })
    return { resultJson: JSON.stringify({ constraints }), resolved: constraints }
  } catch (err) {
    return {
      resultJson: JSON.stringify({
        error:
          err instanceof PlanningDataError
            ? err.message
            : 'Constraint check failed — try again, or answer without it and say the check could not be completed.',
      }),
    }
  }
}

/**
 * Validates the model's slotId/value against QUESTION_SLOTS — no external
 * call needed. Rejects an unknown slotId, and for an options-type slot,
 * rejects any value that isn't one of its canonical option values (the
 * model is never allowed to invent one, same guarantee /api/chat/questions
 * already gives reportContent.ts elsewhere).
 */
function runResolveAnswer(rawArgs: string): { resultJson: string; resolved?: { slotId: string; value: string } } {
  try {
    const args = JSON.parse(rawArgs || '{}')
    const slotId = typeof args.slotId === 'string' ? args.slotId : ''
    const value = typeof args.value === 'string' ? args.value.trim() : ''

    const slot = RESOLVABLE_SLOTS.find(q => q.id === slotId)
    if (!slot) {
      return { resultJson: JSON.stringify({ error: `Unknown slotId: ${slotId}` }) }
    }
    if (!value) {
      return { resultJson: JSON.stringify({ error: 'value must not be empty' }) }
    }
    if (slot.options && !slot.options.some(o => o.value === value)) {
      return {
        resultJson: JSON.stringify({
          error: `Invalid value "${value}" for slot "${slotId}". Allowed: ${slot.options.map(o => o.value).join(', ')}`,
        }),
      }
    }

    return { resultJson: JSON.stringify({ slotId, value }), resolved: { slotId, value } }
  } catch {
    return { resultJson: JSON.stringify({ error: 'Could not parse resolve_answer arguments.' }) }
  }
}

/**
 * Validates the model's ask_choice arguments — a non-empty prompt and
 * 2-6 non-empty, de-duplicated, trimmed option labels.
 *
 * Built as an explicit accumulation loop rather than a
 * filter/map/Set/Array.from chain — that chain is exactly the shape
 * that can leave TS inferring `options` as `unknown[]` depending on how
 * it resolves the generic on an `any`-typed source array (`rawOptions`
 * comes from `JSON.parse`, so it starts as `any`), which then fails to
 * satisfy `resolved?: { options: string[] }` at the return statement.
 * The loop below has no such ambiguity: every value pushed onto
 * `options` is already narrowed to `string` at that point, so the
 * array's type is unambiguously `string[]` all the way through.
 */
function runAskChoice(rawArgs: string): {
  resultJson: string
  resolved?: { prompt: string; options: string[] }
} {
  try {
    const args = JSON.parse(rawArgs || '{}')
    const prompt = typeof args.prompt === 'string' ? args.prompt.trim() : ''
    const rawOptions: unknown[] = Array.isArray(args.options) ? args.options : []

    const seen = new Set<string>()
    const options: string[] = []
    for (const raw of rawOptions) {
      if (typeof raw !== 'string') continue
      const trimmed = raw.trim()
      if (!trimmed || seen.has(trimmed)) continue
      seen.add(trimmed)
      options.push(trimmed)
    }

    if (!prompt) {
      return { resultJson: JSON.stringify({ error: 'prompt must not be empty' }) }
    }
    if (options.length < 2 || options.length > 6) {
      return {
        resultJson: JSON.stringify({
          error: `options must have between 2 and 6 entries (got ${options.length})`,
        }),
      }
    }

    return { resultJson: JSON.stringify({ prompt, options }), resolved: { prompt, options } }
  } catch {
    return { resultJson: JSON.stringify({ error: 'Could not parse ask_choice arguments.' }) }
  }
}

/** Validates the model's suggest_partner_handoff arguments — non-empty reason and specialism, no external call needed. */
function runSuggestPartnerHandoff(rawArgs: string): {
  resultJson: string
  resolved?: { reason: string; specialism: string }
} {
  try {
    const args = JSON.parse(rawArgs || '{}')
    const reason = typeof args.reason === 'string' ? args.reason.trim() : ''
    const specialism = typeof args.specialism === 'string' ? args.specialism.trim() : ''

    if (!reason || !specialism) {
      return { resultJson: JSON.stringify({ error: 'reason and specialism must both be non-empty.' }) }
    }

    return { resultJson: JSON.stringify({ reason, specialism }), resolved: { reason, specialism } }
  } catch {
    return { resultJson: JSON.stringify({ error: 'Could not parse suggest_partner_handoff arguments.' }) }
  }
}

/** Thrown when Groq is rate-limited for long enough that retrying now can't help. */
class RateLimitError extends Error {
  retryAfterSeconds: number
  constructor(retryAfterSeconds: number) {
    super(`Rate limited — try again in ${retryAfterSeconds}s`)
    this.name = 'RateLimitError'
    this.retryAfterSeconds = retryAfterSeconds
  }
}

/**
 * Groq's 429 body includes a message like "Please try again in 11m19.104s"
 * for daily/hourly token caps — that's the authoritative wait time, not
 * the standard `Retry-After` header (which Groq doesn't reliably send for
 * these). Falls back to the header, then null if neither is present.
 */
function parseRetryAfterSeconds(res: Response, bodyText: string): number | null {
  const match = bodyText.match(/try again in\s+(?:(\d+)h)?\s*(?:(\d+)m)?\s*([\d.]+)s/i)
  if (match) {
    const hours = Number(match[1] || 0)
    const minutes = Number(match[2] || 0)
    const seconds = Number(match[3] || 0)
    return Math.ceil(hours * 3600 + minutes * 60 + seconds)
  }
  const header = res.headers.get('retry-after')
  if (header && !Number.isNaN(Number(header))) return Number(header)
  return null
}

async function groqCompletion(messages: ChatMsg[], apiKey: string, withTools: boolean, attempt = 0): Promise<any> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.3,
      ...(withTools ? { tools: TOOLS, tool_choice: 'auto' } : {}),
    }),
  })

  if (res.status === 429) {
    const text = await res.text().catch(() => '')
    const retryAfterSeconds = parseRetryAfterSeconds(res, text)

    // A short throttle (a few seconds) is worth a couple of quick retries —
    // that's the request-per-second limit, and it clears fast. A long wait
    // (minutes) means a daily/hourly token cap has been hit — no amount of
    // retrying in the next few seconds will fix that, so fail fast with an
    // honest message instead of burning more calls against a wait we can't
    // beat.
    if (retryAfterSeconds !== null && retryAfterSeconds > 5) {
      throw new RateLimitError(retryAfterSeconds)
    }

    if (attempt < 2) {
      const waitMs = attempt === 0 ? 500 : 1500
      await new Promise(r => setTimeout(r, waitMs))
      return groqCompletion(messages, apiKey, withTools, attempt + 1)
    }

    throw new RateLimitError(retryAfterSeconds ?? 30)
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`LLM API error ${res.status}: ${text}`)
  }

  return res.json()
}