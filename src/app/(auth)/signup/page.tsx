
import SignupClient from './SignupClient'

interface PageProps {
  searchParams: {
    returnTo?: string
    goalId?: string
    actor?: string
  }
}

export default function SignupPage({ searchParams }: PageProps) {
  return (
    <SignupClient
      returnTo={searchParams.returnTo ?? '/dashboard'}
      goalId={searchParams.goalId ?? ''}
      actor={searchParams.actor ?? ''}
    />
  )
}