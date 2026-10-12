'use client'

import { cn } from '@/lib/cn'

interface MicButtonProps {
  isListening: boolean
  supported: boolean
  onClick: () => void
  className?: string
}

/**
 * MicButton
 * ─────────
 * Same look/behavior as the mic button in SearchBar.tsx, pulled out so
 * it can be dropped into other composers (chat, forms, etc.) alongside
 * `useVoiceInput`.
 */
export function MicButton({ isListening, supported, onClick, className }: MicButtonProps) {
  return (
    <>
      <button
        type="button"
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          onClick()
        }}
        disabled={!supported}
        aria-label={
          !supported
            ? 'Voice input not supported in this browser'
            : isListening ? 'Stop voice input' : 'Voice input'
        }
        title={!supported ? 'Voice input needs Chrome, Edge, or Safari' : undefined}
        aria-pressed={isListening}
        className={cn(
          'relative flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors',
          !supported && 'opacity-40 cursor-not-allowed',
          isListening ? 'bg-[#00D4FF] text-[#050A12]' : 'text-[#5A6A8A] hover:bg-white/[0.06]',
          className
        )}
      >
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-[#00D4FF]/40 animate-ping" aria-hidden="true" />
        )}
        {isListening ? (
          <span className="relative flex items-end gap-[2.5px] h-3.5" aria-hidden="true">
            {[0, 1, 2, 3].map(i => (
              <span
                key={i}
                className="w-[2.5px] rounded-full bg-[#050A12] mic-bar"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </span>
        ) : (
          <MicIcon />
        )}
      </button>

      <style jsx>{`
        .mic-bar {
          height: 100%;
          animation: micWave 0.9s ease-in-out infinite;
        }
        @keyframes micWave {
          0%, 100% { transform: scaleY(0.35); }
          50%      { transform: scaleY(1); }
        }
      `}</style>
    </>
  )
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3"/>
      <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>
    </svg>
  )
}
