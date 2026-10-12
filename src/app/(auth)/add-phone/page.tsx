'use client'

import { Suspense } from 'react'
import AddPhoneContent from './AddPhoneContent'

export default function AddPhonePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0E1A]" />}>
      <AddPhoneContent />
    </Suspense>
  )
}
