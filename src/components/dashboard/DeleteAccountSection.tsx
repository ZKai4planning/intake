'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { deleteMe } from '@/lib/api'
import { clearLocalUserData } from '@/lib/clearLocalUserData'
import { cn } from '@/lib/cn'

interface DeleteAccountSectionProps {
  /** The name shown on the profile card — what the user must paste back to confirm. */
  accountName: string
}

/**
 * DeleteAccountSection
 * ───────────────────────
 * Danger-zone card on /profile. Requires the user to paste back their
 * exact displayed account name before the Delete button unlocks —
 * same pattern as GitHub's repo-delete confirmation. This is meant to
 * prevent accidental clicks, not to be a security boundary — the real
 * server-side delete endpoint should still re-check auth/password as
 * appropriate.
 */
export function DeleteAccountSection({ accountName }: DeleteAccountSectionProps) {
  const router = useRouter()
  const { show } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const isMatch = confirmText === accountName

  function closeModal() {
    if (isDeleting) return
    setIsOpen(false)
    setConfirmText('')
  }

  async function handleConfirmDelete() {
    if (!isMatch || isDeleting) return
    setIsDeleting(true)
    try {
      const { error } = await deleteMe()
      if (error) {
        show(error, 'error')
        setIsDeleting(false)
        return
      }
      clearLocalUserData()
      router.push('/login')
    } catch {
      show('Something went wrong deleting your account. Try again.', 'error')
      setIsDeleting(false)
    }
  }

  return (
    <>
      <section className="rounded-[14px] border border-[rgba(255,107,107,0.2)] bg-[rgba(255,107,107,0.04)] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-[#E8F0FF]">Delete account</p>
            <p className="text-[11.5px] text-[#5A6A8A] mt-0.5">
              Permanently delete your account and all associated data. This can&rsquo;t be undone.
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="shrink-0 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-[#FF6B6B] bg-[rgba(255,107,107,0.08)] hover:bg-[rgba(255,107,107,0.14)] transition-colors"
          >
            Delete account
          </button>
        </div>
      </section>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-[420px] rounded-[16px] border border-[rgba(255,107,107,0.25)] bg-[#0F1525] p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-full bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.3)] flex items-center justify-center mb-4">
              <span className="text-[18px]" aria-hidden="true">⚠️</span>
            </div>

            <h2 id="delete-account-title" className="font-display text-[19px] text-[#E8F0FF] mb-1.5">
              Are you sure?
            </h2>
            <p className="text-[13px] text-[#A8B8D8] leading-relaxed mb-5">
              This will permanently delete your account, workspace, and all data linked to it.
              There&rsquo;s no way to undo this.
            </p>

            <p className="text-[11px] font-semibold tracking-[0.05em] uppercase text-[#5A6A8A] mb-1.5">
              Type your account name to confirm
            </p>

            <div className="flex items-center justify-between gap-2 rounded-[10px] bg-[#141C30] border border-white/[0.1] px-3.5 py-2.5 mb-3">
              <code className="text-[13px] text-[#E8F0FF] font-mono truncate">{accountName}</code>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(accountName)
                    show('Copied to clipboard', 'success')
                  } catch {
                    // clipboard access denied — user can still select/copy manually
                  }
                }}
                className="shrink-0 text-[11px] font-medium text-[#135BEC] hover:text-[#2A6BF0] transition-colors"
              >
                Copy
              </button>
            </div>

            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder={accountName}
              autoFocus
              className={cn(
                'w-full rounded-[10px] px-3.5 py-2.5 mb-5',
                'bg-[#141C30] text-[#E8F0FF] text-[14px] font-sans',
                'placeholder:text-[#3A4560]',
                'border outline-none transition-all duration-150',
                confirmText && !isMatch
                  ? 'border-[rgba(248,113,113,0.6)]'
                  : 'border-white/[0.12] focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.15)]'
              )}
            />

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={closeModal}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold text-[#A8B8D8] border border-white/[0.12] hover:border-white/[0.25] hover:text-[#E8F0FF] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={!isMatch || isDeleting}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold transition-colors',
                  !isMatch || isDeleting
                    ? 'bg-white/[0.06] text-[#5A6A8A] cursor-not-allowed'
                    : 'bg-[#FF6B6B] text-white hover:bg-[#ff5252]'
                )}
              >
                {isDeleting ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
