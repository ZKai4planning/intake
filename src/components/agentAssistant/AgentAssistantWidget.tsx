// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { getAgentAction, type AgentAssistantSurface } from '@/lib/agentAssistant/actions'
// import { askAgentAssistant, executeAgentAssistantAction, type PendingConfirmation } from '@/lib/agentAssistant/client'
// import { AssistantOrb } from './AssistantOrb'

// interface AgentAssistantWidgetProps {
//   surface: AgentAssistantSurface
//   /**
//    * Values only the current page can supply (e.g. { userId } on an
//    * agentx user detail page). Sent to the model as known context (so
//    * it doesn't ask for something already on screen) AND used
//    * server-side to override anything the model guessed for the same
//    * key — see pickContextForTool in the ask route.
//    */
//   context?: Record<string, string>
// }

// interface DisplayMessage {
//   role: 'user' | 'assistant'
//   text: string
//   confirmation?: PendingConfirmation & { resolved?: 'confirmed' | 'cancelled' }
// }

// const PLACEHOLDER_BY_SURFACE: Record<AgentAssistantSurface, string> = {
//   customer: 'Ask me to start a project, show your reports…',
//   admin: 'Ask me to show stalled orders, create an agent…',
//   agentx: 'Ask me to create a project, search for a user…',
// }

// const EXAMPLE_BY_SURFACE: Record<AgentAssistantSurface, string> = {
//   customer: 'start a new project',
//   admin: 'show me stalled orders',
//   agentx: 'create a project for this user',
// }

// // How long the panel's fade/scale-out plays before it actually unmounts —
// // keep this in sync with the CSS transition-duration below.
// const CLOSE_ANIMATION_MS = 180
// // How long the "Redirecting…" message stays visible before the route
// // actually changes, so the completion is something you see, not something
// // that just happens.
// const REDIRECT_DELAY_MS = 900

// type ThinkingState = null | 'thinking' | 'working' | 'redirecting'

// export function AgentAssistantWidget({ surface, context = {} }: AgentAssistantWidgetProps) {
//   const router = useRouter()
//   const [open, setOpen] = useState(false)
//   const [closing, setClosing] = useState(false)
//   const [input, setInput] = useState('')
//   const [messages, setMessages] = useState<DisplayMessage[]>([])
//   const [thinking, setThinking] = useState<ThinkingState>(null)
//   const scrollRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
//   }, [messages, thinking])

//   function closeWithAnimation() {
//     setClosing(true)
//     setTimeout(() => {
//       setOpen(false)
//       setClosing(false)
//     }, CLOSE_ANIMATION_MS)
//   }

//   function navigateAfterDelay(path: string) {
//     setThinking('redirecting')
//     setTimeout(() => {
//       router.push(path)
//       closeWithAnimation()
//       setThinking(null)
//     }, REDIRECT_DELAY_MS)
//   }

//   async function handleSend(e: React.FormEvent) {
//     e.preventDefault()
//     const query = input.trim()
//     if (!query || thinking) return

//     const history = messages.map(m => ({ role: m.role, content: m.text }))
//     setMessages(prev => [...prev, { role: 'user', text: query }])
//     setInput('')
//     setThinking('thinking')

//     const { data, error } = await askAgentAssistant({ query, history, surface, context })

//     if (error || !data) {
//       setThinking(null)
//       setMessages(prev => [...prev, { role: 'assistant', text: error ?? 'Something went wrong — please try again.' }])
//       return
//     }

//     setMessages(prev => [...prev, { role: 'assistant', text: data.reply, confirmation: data.pendingConfirmation }])

//     if (data.action) {
//       const action = getAgentAction(surface, data.action.id)
//       if (action) {
//         navigateAfterDelay(action.buildPath(data.action!.params))
//         return
//       }
//     }

//     setThinking(null)
//   }

//   async function handleConfirm(messageIndex: number) {
//     const confirmation = messages[messageIndex].confirmation
//     if (!confirmation) return

//     setThinking('working')
//     const { data, error } = await executeAgentAssistantAction({ surface, tool: confirmation.tool, args: confirmation.args })

//     setMessages(prev => {
//       const next = [...prev]
//       next[messageIndex] = { ...next[messageIndex], confirmation: { ...confirmation, resolved: 'confirmed' } }
//       return next
//     })

//     if (error || !data) {
//       setThinking(null)
//       setMessages(prev => [...prev, { role: 'assistant', text: error ?? 'That action failed — please try again.' }])
//       return
//     }

//     setMessages(prev => [...prev, { role: 'assistant', text: data.resultSummary }])

//     if (data.navigateTo) {
//       navigateAfterDelay(data.navigateTo)
//     } else {
//       setThinking(null)
//     }
//   }

//   function handleCancel(messageIndex: number) {
//     setMessages(prev => {
//       const next = [...prev]
//       const confirmation = next[messageIndex].confirmation
//       if (confirmation) next[messageIndex] = { ...next[messageIndex], confirmation: { ...confirmation, resolved: 'cancelled' } }
//       return next
//     })
//     setMessages(prev => [...prev, { role: 'assistant', text: 'Okay, cancelled — nothing was changed.' }])
//   }

//   const thinkingLabel = thinking === 'working' ? 'Working...' : thinking === 'redirecting' ? 'Taking you there...' : thinking === 'thinking' ? 'Thinking...' : null

//   return (
//     <>
//       {open && (
//         <div
//           className="fixed bottom-24 right-5 z-50 w-[360px] max-w-[calc(100vw-40px)] rounded-[16px] border border-white/[0.08] bg-[#0F1525] shadow-2xl flex flex-col overflow-hidden transition-all duration-[180ms] ease-out"
//           style={{ height: 460, opacity: closing ? 0 : 1, transform: closing ? 'translateY(8px) scale(0.98)' : 'translateY(0) scale(1)' }}
//         >
//           <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
//             <div className="flex items-center gap-2.5">
//               <AssistantOrb size={22} state={thinking ?? 'idle'} />
//               <p className="text-[13.5px] font-semibold text-[#E8F0FF]">AI4Planning Assistant</p>
//             </div>
//             <button
//               onClick={closeWithAnimation}
//               aria-label="Close assistant"
//               className="text-[#5A6A8A] hover:text-[#E8F0FF] transition-colors text-[18px] leading-none"
//             >
//               ×
//             </button>
//           </div>

//           <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2.5">
//             {messages.length === 0 && (
//               <p className="text-[12.5px] text-[#5A6A8A]">Try “{EXAMPLE_BY_SURFACE[surface]}”.</p>
//             )}
//             {messages.map((m, i) => (
//               <div key={i}>
//                 <div
//                   className={
//                     m.role === 'user'
//                       ? 'ml-auto max-w-[85%] rounded-[12px] rounded-br-[4px] bg-[#135BEC] text-white text-[13px] px-3 py-2'
//                       : 'mr-auto max-w-[85%] rounded-[12px] rounded-bl-[4px] bg-white/[0.06] text-[#E8F0FF] text-[13px] px-3 py-2'
//                   }
//                 >
//                   {m.text}
//                 </div>

//                 {m.confirmation && (
//                   <div className="mr-auto max-w-[92%] mt-1.5 rounded-[12px] border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.06)] px-3 py-2.5">
//                     <p className="text-[12.5px] text-[#FBBF24] mb-2" dangerouslySetInnerHTML={{ __html: escapeThenBold(m.confirmation.summary) }} />
//                     {!m.confirmation.resolved ? (
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => handleConfirm(i)}
//                           disabled={!!thinking}
//                           className="px-3 py-1.5 rounded-[8px] bg-[#135BEC] text-white text-[12px] font-semibold hover:bg-[#2A6BF0] disabled:opacity-50 transition-colors"
//                         >
//                           Confirm
//                         </button>
//                         <button
//                           onClick={() => handleCancel(i)}
//                           disabled={!!thinking}
//                           className="px-3 py-1.5 rounded-[8px] text-[#A8B8D8] text-[12px] font-medium hover:text-[#E8F0FF] disabled:opacity-50 transition-colors"
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     ) : (
//                       <p className="text-[11.5px] text-[#5A6A8A] flex items-center gap-1.5">
//                         {m.confirmation.resolved === 'confirmed' ? (
//                           <>
//                             <CheckIcon /> Confirmed
//                           </>
//                         ) : (
//                           'Cancelled'
//                         )}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             ))}

//             {thinking && (
//               <div className="inline-flex items-center gap-2.5 rounded-full bg-[#161C2E] border border-white/[0.06] pl-1.5 pr-4 py-1.5">
//                 <AssistantOrb size={26} state={thinking} />
//                 <span className="text-[13px] text-[#C7D2E8]">{thinkingLabel}</span>
//               </div>
//             )}
//           </div>

//           <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3 border-t border-white/[0.06] shrink-0">
//             <input
//               value={input}
//               onChange={e => setInput(e.target.value)}
//               disabled={!!thinking}
//               placeholder={PLACEHOLDER_BY_SURFACE[surface]}
//               className="flex-1 rounded-[10px] border border-white/[0.08] bg-[#0A0E1A] px-3 py-2 text-[13px] text-[#E8F0FF] placeholder:text-[#3A4560] focus:outline-none focus:border-[#135BEC] transition-colors"
//             />
//             <button
//               type="submit"
//               disabled={!input.trim() || !!thinking}
//               className="px-3 py-2 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               Send
//             </button>
//           </form>
//         </div>
//       )}

//       <button
//         onClick={() => (open ? closeWithAnimation() : setOpen(true))}
//         aria-label={open ? 'Close assistant' : 'Open assistant'}
//         className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105"
//       >
//         {open ? (
//           <span className="w-14 h-14 rounded-full bg-[#135BEC] hover:bg-[#2A6BF0] text-white flex items-center justify-center transition-colors">
//             <span className="text-[24px] leading-none">×</span>
//           </span>
//         ) : (
//           <AssistantOrb size={56} state="idle" />
//         )}
//       </button>
//     </>
//   )
// }

// function CheckIcon() {
//   return (
//     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
//       <polyline points="20 6 9 17 4 12" />
//     </svg>
//   )
// }

// /** Escapes the confirmation text, then turns **bold** markers back into <strong> — the summary strings in tools.ts use markdown-style bold for the key details (name/email/tier). */
// function escapeThenBold(text: string): string {
//   const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
//   return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
// }


'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAgentAction, type AgentAssistantSurface } from '@/lib/agentAssistant/actions'
import { askAgentAssistant, executeAgentAssistantAction, type PendingConfirmation } from '@/lib/agentAssistant/client'
import { AssistantOrb } from './AssistantOrb'

interface AgentAssistantWidgetProps {
  surface: AgentAssistantSurface
  /**
   * Values only the current page can supply (e.g. { userId } on an
   * agentx user detail page). Sent to the model as known context (so
   * it doesn't ask for something already on screen) AND used
   * server-side to override anything the model guessed for the same
   * key — see pickContextForTool in the ask route.
   */
  context?: Record<string, string>
}

interface DisplayMessage {
  role: 'user' | 'assistant'
  text: string
  confirmation?: PendingConfirmation & { resolved?: 'confirmed' | 'cancelled' }
}

const PLACEHOLDER_BY_SURFACE: Record<AgentAssistantSurface, string> = {
  customer: 'Ask me to start a project, show your reports…',
  admin: 'Ask me to show stalled orders, create an agent…',
  agentx: 'Ask me to create a project, search for a user…',
}

const EXAMPLE_BY_SURFACE: Record<AgentAssistantSurface, string> = {
  customer: 'start a new project',
  admin: 'show me stalled orders',
  agentx: 'create a project for this user',
}

// How long the panel's fade/scale-out plays before it actually unmounts —
// keep this in sync with the CSS transition-duration below.
const CLOSE_ANIMATION_MS = 180
// How long the "Redirecting…" message stays visible before the route
// actually changes, so the completion is something you see, not something
// that just happens.
const REDIRECT_DELAY_MS = 900

type ThinkingState = null | 'thinking' | 'working' | 'redirecting'

/**
 * Only one AgentAssistantWidget is mounted per portal (in the shell —
 * Dashboardshell.tsx / AdminShell.tsx / AgentxShell.tsx), so any OTHER
 * page that wants to open it (e.g. a "Chat with the assistant" button
 * on a support page) can't just call a prop — there's no direct
 * reference to reach. A window event is the simplest way to reach the
 * one mounted instance from anywhere in the tree without prop-drilling
 * a ref through every shell.
 */
const OPEN_EVENT = 'agent-assistant:open'

interface OpenAgentAssistantDetail {
  /** Pre-fills the input box. Never sent automatically — the person still reviews and hits Send themselves, same as typing it by hand. */
  query?: string
}

/**
 * Opens the floating assistant panel from anywhere else in the app,
 * optionally pre-filling (never auto-sending) a starting question —
 * e.g. a "Get help" button elsewhere calling
 * `openAgentAssistant("how do I start a new project?")`.
 */
export function openAgentAssistant(query?: string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<OpenAgentAssistantDetail>(OPEN_EVENT, { detail: { query } }))
}

export function AgentAssistantWidget({ surface, context = {} }: AgentAssistantWidgetProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [thinking, setThinking] = useState<ThinkingState>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOpenEvent(e: Event) {
      const detail = (e as CustomEvent<OpenAgentAssistantDetail>).detail
      setClosing(false)
      setOpen(true)
      if (detail?.query) setInput(detail.query)
    }
    window.addEventListener(OPEN_EVENT, handleOpenEvent)
    return () => window.removeEventListener(OPEN_EVENT, handleOpenEvent)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  function closeWithAnimation() {
    setClosing(true)
    setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, CLOSE_ANIMATION_MS)
  }

  function navigateAfterDelay(path: string) {
    setThinking('redirecting')
    setTimeout(() => {
      router.push(path)
      closeWithAnimation()
      setThinking(null)
    }, REDIRECT_DELAY_MS)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const query = input.trim()
    if (!query || thinking) return

    const history = messages.map(m => ({ role: m.role, content: m.text }))
    setMessages(prev => [...prev, { role: 'user', text: query }])
    setInput('')
    setThinking('thinking')

    const { data, error } = await askAgentAssistant({ query, history, surface, context })

    if (error || !data) {
      setThinking(null)
      setMessages(prev => [...prev, { role: 'assistant', text: error ?? 'Something went wrong — please try again.' }])
      return
    }

    setMessages(prev => [...prev, { role: 'assistant', text: data.reply, confirmation: data.pendingConfirmation }])

    if (data.action) {
      const action = getAgentAction(surface, data.action.id)
      if (action) {
        navigateAfterDelay(action.buildPath(data.action!.params))
        return
      }
    }

    setThinking(null)
  }

  async function handleConfirm(messageIndex: number) {
    const confirmation = messages[messageIndex].confirmation
    if (!confirmation) return

    setThinking('working')
    const { data, error } = await executeAgentAssistantAction({ surface, tool: confirmation.tool, args: confirmation.args })

    setMessages(prev => {
      const next = [...prev]
      next[messageIndex] = { ...next[messageIndex], confirmation: { ...confirmation, resolved: 'confirmed' } }
      return next
    })

    if (error || !data) {
      setThinking(null)
      setMessages(prev => [...prev, { role: 'assistant', text: error ?? 'That action failed — please try again.' }])
      return
    }

    setMessages(prev => [...prev, { role: 'assistant', text: data.resultSummary }])

    if (data.navigateTo) {
      navigateAfterDelay(data.navigateTo)
    } else {
      setThinking(null)
    }
  }

  function handleCancel(messageIndex: number) {
    setMessages(prev => {
      const next = [...prev]
      const confirmation = next[messageIndex].confirmation
      if (confirmation) next[messageIndex] = { ...next[messageIndex], confirmation: { ...confirmation, resolved: 'cancelled' } }
      return next
    })
    setMessages(prev => [...prev, { role: 'assistant', text: 'Okay, cancelled — nothing was changed.' }])
  }

  const thinkingLabel = thinking === 'working' ? 'Working...' : thinking === 'redirecting' ? 'Taking you there...' : thinking === 'thinking' ? 'Thinking...' : null

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 w-[360px] max-w-[calc(100vw-40px)] rounded-[16px] border border-white/[0.08] bg-[#0F1525] shadow-2xl flex flex-col overflow-hidden transition-all duration-[180ms] ease-out"
          style={{ height: 460, opacity: closing ? 0 : 1, transform: closing ? 'translateY(8px) scale(0.98)' : 'translateY(0) scale(1)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2.5">
              <AssistantOrb size={22} state={thinking ?? 'idle'} />
              <p className="text-[13.5px] font-semibold text-[#E8F0FF]">AI4Planning Assistant</p>
            </div>
            <button
              onClick={closeWithAnimation}
              aria-label="Close assistant"
              className="text-[#5A6A8A] hover:text-[#E8F0FF] transition-colors text-[18px] leading-none"
            >
              ×
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2.5">
            {messages.length === 0 && (
              <p className="text-[12.5px] text-[#5A6A8A]">Try “{EXAMPLE_BY_SURFACE[surface]}”.</p>
            )}
            {messages.map((m, i) => (
              <div key={i}>
                <div
                  className={
                    m.role === 'user'
                      ? 'ml-auto max-w-[85%] rounded-[12px] rounded-br-[4px] bg-[#135BEC] text-white text-[13px] px-3 py-2'
                      : 'mr-auto max-w-[85%] rounded-[12px] rounded-bl-[4px] bg-white/[0.06] text-[#E8F0FF] text-[13px] px-3 py-2'
                  }
                >
                  {m.text}
                </div>

                {m.confirmation && (
                  <div className="mr-auto max-w-[92%] mt-1.5 rounded-[12px] border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.06)] px-3 py-2.5">
                    <p className="text-[12.5px] text-[#FBBF24] mb-2" dangerouslySetInnerHTML={{ __html: escapeThenBold(m.confirmation.summary) }} />
                    {!m.confirmation.resolved ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleConfirm(i)}
                          disabled={!!thinking}
                          className="px-3 py-1.5 rounded-[8px] bg-[#135BEC] text-white text-[12px] font-semibold hover:bg-[#2A6BF0] disabled:opacity-50 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleCancel(i)}
                          disabled={!!thinking}
                          className="px-3 py-1.5 rounded-[8px] text-[#A8B8D8] text-[12px] font-medium hover:text-[#E8F0FF] disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11.5px] text-[#5A6A8A] flex items-center gap-1.5">
                        {m.confirmation.resolved === 'confirmed' ? (
                          <>
                            <CheckIcon /> Confirmed
                          </>
                        ) : (
                          'Cancelled'
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {thinking && (
              <div className="inline-flex items-center gap-2.5 rounded-full bg-[#161C2E] border border-white/[0.06] pl-1.5 pr-4 py-1.5">
                <AssistantOrb size={26} state={thinking} />
                <span className="text-[13px] text-[#C7D2E8]">{thinkingLabel}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3 border-t border-white/[0.06] shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={!!thinking}
              placeholder={PLACEHOLDER_BY_SURFACE[surface]}
              className="flex-1 rounded-[10px] border border-white/[0.08] bg-[#0A0E1A] px-3 py-2 text-[13px] text-[#E8F0FF] placeholder:text-[#3A4560] focus:outline-none focus:border-[#135BEC] transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || !!thinking}
              className="px-3 py-2 rounded-[10px] bg-[#135BEC] text-white text-[13px] font-semibold hover:bg-[#2A6BF0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => (open ? closeWithAnimation() : setOpen(true))}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105"
      >
        {open ? (
          <span className="w-14 h-14 rounded-full bg-[#135BEC] hover:bg-[#2A6BF0] text-white flex items-center justify-center transition-colors">
            <span className="text-[24px] leading-none">×</span>
          </span>
        ) : (
          <AssistantOrb size={56} state="idle" />
        )}
      </button>
    </>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

/** Escapes the confirmation text, then turns **bold** markers back into <strong> — the summary strings in tools.ts use markdown-style bold for the key details (name/email/tier). */
function escapeThenBold(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}