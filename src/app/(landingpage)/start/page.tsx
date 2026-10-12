import type { Metadata } from 'next'
import { ProjectIntakeChat } from '@/components/intake/ProjectIntakeChat'

export const metadata: Metadata = {
  title: 'Project Intake',
  description: 'Tell us about your property and what you would like to do. We work out the appropriate planning route.',
}

/**
 * /start — guided project intake chat. The homeowner "Get started" card on
 * the homepage lands here. See components/intake/ProjectIntakeChat.tsx.
 */
export default function StartPage() {
  return <ProjectIntakeChat />
}
