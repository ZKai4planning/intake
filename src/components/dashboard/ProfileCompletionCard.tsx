// 'use client'

// import { GuardedNavLink } from '@/components/dashboard/GuardedNavLink'

// interface ProfileCompletionCardProps {
//   phoneSet: boolean
//   mfaEnabled: boolean
// }

// /**
//  * ProfileCompletionCard
//  * ────────────────────────
//  * Lives at the bottom of the sidebar. Surfaces anything the account is
//  * still missing (phone number, 2FA) so it isn't just silently gated
//  * behind a one-time post-login redirect — if someone skips a step,
//  * this stays visible as a reminder until they finish it.
//  *
//  * The whole card is a single link to /profile, where every listed item
//  * can actually be completed. Renders nothing once everything is done.
//  */
// export function ProfileCompletionCard({ phoneSet, mfaEnabled }: ProfileCompletionCardProps) {
//   const items = [
//     { label: 'Add phone number', done: phoneSet },
//     { label: 'Enable two-factor auth', done: mfaEnabled },
//   ]

//   const doneCount = items.filter(i => i.done).length
//   const pct = Math.round((doneCount / items.length) * 100)

//   if (pct === 100) return null

//   const missing = items.filter(i => !i.done)

//   return (
//     <div className="px-3 pb-3">
//       <GuardedNavLink
//         href="/dashboard/profile"
//         className="group block rounded-[12px] border border-white/[0.08] bg-[#141C30] p-3.5 hover:border-[rgba(19,91,236,0.35)] transition-colors"
//       >
//         <div className="flex items-center justify-between mb-2.5">
//           <p className="text-[11.5px] font-semibold text-[#E8F0FF]">
//             Profile {pct}% complete
//           </p>
//           <svg
//             width="13"
//             height="13"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth={2}
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             className="text-[#5A6A8A] group-hover:text-[#135BEC] group-hover:translate-x-0.5 transition-all shrink-0"
//           >
//             <path d="M5 12h14" />
//             <path d="M12 5l7 7-7 7" />
//           </svg>
//         </div>

//         {/* Progress bar */}
//         <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-3">
//           <div
//             className="h-full rounded-full bg-[#135BEC] transition-all"
//             style={{ width: `${pct}%` }}
//           />
//         </div>

//         {/* Missing items */}
//         <ul className="space-y-1.5">
//           {missing.map(item => (
//             <li key={item.label} className="flex items-center gap-1.5 text-[11.5px] text-[#A8B8D8]">
//               <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" aria-hidden="true" />
//               {item.label}
//             </li>
//           ))}
//         </ul>
//       </GuardedNavLink>
//     </div>
//   )
// }


'use client'

import { GuardedNavLink } from '@/components/dashboard/GuardedNavLink'

interface ProfileCompletionCardProps {
  /** Always true once a session exists — kept as an explicit item so account creation itself counts toward the total. */
  accountCreated: boolean
  avatarSet: boolean
  phoneSet: boolean
  mfaEnabled: boolean
}

/**
 * ProfileCompletionCard
 * ────────────────────────
 * Lives at the bottom of the sidebar. Surfaces anything the account is
 * still missing (profile picture, phone number, 2FA) so it isn't just
 * silently gated behind a one-time post-login redirect — if someone
 * skips a step, this stays visible as a reminder until they finish it.
 *
 * Four equally-weighted items (25% each): account created, profile
 * picture, phone number, two-factor auth.
 *
 * The whole card is a single link to /profile, where every listed item
 * can actually be completed. Renders nothing once everything is done.
 */
export function ProfileCompletionCard({ accountCreated, avatarSet, phoneSet, mfaEnabled }: ProfileCompletionCardProps) {
  const items = [
    { label: 'Create account', done: accountCreated },
    { label: 'Add profile picture', done: avatarSet },
    { label: 'Add phone number', done: phoneSet },
    { label: 'Enable two-factor auth', done: mfaEnabled },
  ]

  const doneCount = items.filter(i => i.done).length
  const pct = Math.round((doneCount / items.length) * 100)

  if (pct === 100) return null

  const missing = items.filter(i => !i.done)

  return (
    <div className="px-3 pb-3">
      <GuardedNavLink
        href="/dashboard/profile"
        className="group block rounded-[12px] border border-white/[0.08] bg-[#141C30] p-3.5 hover:border-[rgba(19,91,236,0.35)] transition-colors"
      >
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[11.5px] font-semibold text-[#E8F0FF]">
            Profile {pct}% complete
          </p>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#5A6A8A] group-hover:text-[#135BEC] group-hover:translate-x-0.5 transition-all shrink-0"
          >
            <path d="M5 12h14" />
            <path d="M12 5l7 7-7 7" />
          </svg>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-[#135BEC] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Missing items */}
        <ul className="space-y-1.5">
          {missing.map(item => (
            <li key={item.label} className="flex items-center gap-1.5 text-[11.5px] text-[#A8B8D8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" aria-hidden="true" />
              {item.label}
            </li>
          ))}
        </ul>
      </GuardedNavLink>
    </div>
  )
}