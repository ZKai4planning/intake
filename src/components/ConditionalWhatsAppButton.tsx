'use client'

import { usePathname } from 'next/navigation'
import WhatsAppButton from './whatsppp-button'

// The admin and agentx portals are internal tools with their own
// floating assistant (AgentAssistantWidget) — a customer-support
// WhatsApp button doesn't belong there and visually collides with it
// in the same bottom-right corner.
const HIDDEN_PREFIXES = ['/admin', '/agentx']

export default function ConditionalWhatsAppButton() {
  const pathname = usePathname()
  if (HIDDEN_PREFIXES.some(prefix => pathname?.startsWith(prefix))) return null
  return <WhatsAppButton />
}
