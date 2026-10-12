// 'use client'

// import { cn } from '@/lib/cn'
// import { useOtpInput } from '@/hooks/useOtpInput'

// interface OtpBoxesProps {
//   onComplete:  (code: string) => void
//   hasError?:   boolean
//   disabled?:   boolean
//   className?:  string
// }

// /**
//  * OtpBoxes
//  * ─────────
//  * Six individual input boxes for the 6-digit verification code.
//  *
//  * Behaviour:
//  *  - Auto-advances focus on digit entry
//  *  - Backspace clears and moves back
//  *  - Paste fills all 6 boxes instantly
//  *  - Shakes on error (CSS animation via hasError prop)
//  *  - Calls onComplete when all 6 digits are filled
//  */
// export function OtpBoxes({ onComplete, hasError, disabled, className }: OtpBoxesProps) {
//   const { digits, setRef, handleChange, handleKeyDown, handlePaste } =
//     useOtpInput(onComplete)

//   return (
//     <div
//       className={cn(
//         'flex gap-2 sm:gap-3 justify-center',
//         hasError && 'animate-[shake_0.4s_ease-in-out]',
//         className
//       )}
//       onPaste={handlePaste}
//       role="group"
//       aria-label="6-digit verification code"
//     >
//       {digits.map((digit, i) => (
//         <input
//           key={i}
//           ref={setRef(i)}
//           type="text"
//           inputMode="numeric"
//           pattern="\d*"
//           maxLength={1}
//           value={digit}
//           disabled={disabled}
//           aria-label={`Digit ${i + 1}`}
//           onChange={e => handleChange(i, e.target.value)}
//           onKeyDown={e => handleKeyDown(i, e)}
//           onFocus={e => e.target.select()}
//           className={cn(
//             // Size
//             'w-11 h-14 sm:w-13 sm:h-16',
//             // Layout
//             'flex items-center justify-center text-center',
//             // Typography
//             'font-display text-[22px] sm:text-[26px] font-normal text-[#E8F0FF]',
//             // Shape
//             'rounded-[12px] border outline-none',
//             // Default state
//             'bg-[#141C30]',
//             'transition-all duration-150',
//             // States
//             digit
//               ? 'border-[rgba(19,91,236,0.5)] shadow-[0_0_0_2px_rgba(19,91,236,0.12)]'
//               : 'border-white/[0.12]',
//             hasError
//               ? 'border-[rgba(248,113,113,0.6)] shadow-[0_0_0_2px_rgba(248,113,113,0.12)]'
//               : '',
//             'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.18)]',
//             disabled && 'opacity-50 cursor-not-allowed',
//             // Caret hidden — looks cleaner for single-digit boxes
//             'caret-transparent'
//           )}
//         />
//       ))}

//       <style jsx>{`
//         @keyframes shake {
//           0%, 100% { transform: translateX(0); }
//           20%       { transform: translateX(-6px); }
//           40%       { transform: translateX(6px); }
//           60%       { transform: translateX(-4px); }
//           80%       { transform: translateX(4px); }
//         }
//       `}</style>
//     </div>
//   )
// }


'use client'

import { cn } from '@/lib/cn'
import { useOtpInput } from '@/hooks/useOtpInput'

interface OtpBoxesProps {
  onComplete:  (code: string) => void
  hasError?:   boolean
  disabled?:   boolean
  className?:  string
}

/**
 * OtpBoxes
 * ─────────
 * Six individual input boxes for the 6-digit verification code.
 *
 * Behaviour:
 *  - Auto-advances focus on digit entry
 *  - Backspace clears and moves back
 *  - Paste fills all 6 boxes instantly
 *  - Shakes on error (CSS animation via hasError prop)
 *  - Calls onComplete when all 6 digits are filled
 */
export function OtpBoxes({ onComplete, hasError, disabled, className }: OtpBoxesProps) {
  const { digits, setRef, handleChange, handleKeyDown, handlePaste } =
    useOtpInput(onComplete)

  return (
    <div
      className={cn(
        'grid grid-cols-6 gap-1.5 xs:gap-2 sm:gap-3 w-full max-w-[300px] sm:max-w-[380px] mx-auto',
        hasError && 'animate-[shake_0.4s_ease-in-out]',
        className
      )}
      onPaste={handlePaste}
      role="group"
      aria-label="6-digit verification code"
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={setRef(i)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.select()}
          className={cn(
            // Size — width comes from the grid track, so it always
            // fits the available space instead of a fixed px value
            // that could overflow narrow screens.
            'w-full aspect-[3/4] min-w-0',
            // Layout
            'flex items-center justify-center text-center',
            // Typography
            'font-display text-[18px] xs:text-[20px] sm:text-[26px] font-normal text-[#E8F0FF]',
            // Shape
            'rounded-[10px] sm:rounded-[12px] border outline-none',
            // Default state
            'bg-[#141C30]',
            'transition-all duration-150',
            // States
            digit
              ? 'border-[rgba(19,91,236,0.5)] shadow-[0_0_0_2px_rgba(19,91,236,0.12)]'
              : 'border-white/[0.12]',
            hasError
              ? 'border-[rgba(248,113,113,0.6)] shadow-[0_0_0_2px_rgba(248,113,113,0.12)]'
              : '',
            'focus:border-[#135BEC] focus:shadow-[0_0_0_3px_rgba(19,91,236,0.18)]',
            disabled && 'opacity-50 cursor-not-allowed',
            // Caret hidden — looks cleaner for single-digit boxes
            'caret-transparent'
          )}
        />
      ))}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}