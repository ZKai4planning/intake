// 'use client'

// import { useState }      from 'react'
// import { cn }            from '@/lib/cn'
// import { CategoryRow }   from './CategoryRow'
// import {
//   CATEGORIES,
//   DEFAULT_CONSENT,
//   FULL_CONSENT,
//   type ConsentCategory,
//   type ConsentState,
// } from './cookie-consent.types'

// type Tab = 'settings' | 'about'

// interface CookieConsentProps {
//   /** Called when the user saves a choice. Store this in a cookie / localStorage. */
//   onConsent?: (consent: ConsentState) => void
// }

// /**
//  * CookieConsent
//  * ──────────────
//  * Self-contained banner. Renders as a fixed bottom-centre card.
//  * "Customise" expands an inline settings panel — no second modal.
//  *
//  * Placement: render once in app/layout.tsx, outside any Suspense boundary.
//  *
//  * @example
//  * // app/layout.tsx
//  * import { CookieConsent } from '@/components/cookie/CookieConsent'
//  * ...
//  * <CookieConsent onConsent={(c) => console.log(c)} />
//  */
// export function CookieConsent({ onConsent }: CookieConsentProps) {
//   const [visible,    setVisible]    = useState(true)
//   const [customise,  setCustomise]  = useState(false)
//   const [activeTab,  setActiveTab]  = useState<Tab>('settings')
//   const [consent,    setConsent]    = useState<ConsentState>(DEFAULT_CONSENT)

//   if (!visible) return null

//   function handleToggle(id: ConsentCategory, value: boolean) {
//     setConsent(prev => ({ ...prev, [id]: value }))
//   }

//   function handleAcceptAll() {
//     onConsent?.(FULL_CONSENT)
//     setVisible(false)
//   }

//   function handleRejectAll() {
//     onConsent?.(DEFAULT_CONSENT)
//     setVisible(false)
//   }

//   function handleAcceptSelection() {
//     onConsent?.(consent)
//     setVisible(false)
//   }

//   return (
//     /* Fixed overlay anchor */
//     <div className="fixed bottom-0 sm:bottom-5 right-0 sm:right-5 z-50 w-full sm:w-auto sm:max-w-[400px]">
//       <div
//         className={cn(
//           'w-full rounded-none sm:rounded-[20px] overflow-hidden',
//           'bg-[#0F1525] border border-white/[0.08]',
//           'shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]',
//         )}
//       >
//         {/* ── Top section ──────────────────────────────────────── */}
//         {!customise && (
//           <div className="px-6 pt-6 pb-5">
//             <div className="flex items-start justify-between mb-3">
//               <h2 className="font-display text-[18px] font-normal text-[#E8F0FF] leading-snug">
//                 We value your privacy
//               </h2>
//               {/* Cookie icon */}
//               <span className="text-[22px] mt-0.5" role="img" aria-label="cookie">🍪</span>
//             </div>
//             <p className="text-[13px] text-[#5A6A8A] leading-relaxed">
//               By clicking "Accept all cookies", you agree to the storing of cookies on your device
//               to enhance site navigation, analyse site usage, and assist in our marketing efforts.
//               Click "Customise" to personalise the types of cookies you'd like to allow.
//             </p>
//           </div>
//         )}

//         {/* ── Customise panel (inline, no second modal) ────────── */}
//         {customise && (
//           <div>
//             {/* Tabs */}
//             <div className="flex border-b border-white/[0.06] px-5">
//               {(['settings', 'about'] as Tab[]).map(tab => (
//                 <button
//                   key={tab}
//                   type="button"
//                   onClick={() => setActiveTab(tab)}
//                   className={cn(
//                     'py-3.5 px-1 mr-5 text-[13px] font-medium border-b-2 -mb-px transition-colors',
//                     activeTab === tab
//                       ? 'border-[#135BEC] text-[#E8F0FF]'
//                       : 'border-transparent text-[#5A6A8A] hover:text-[#A8B8D8]'
//                   )}
//                 >
//                   {tab === 'settings' ? 'Cookie settings' : 'About'}
//                 </button>
//               ))}
//             </div>

//             {/* Settings tab */}
//             {activeTab === 'settings' && (
//               <div className="px-5 max-h-[280px] overflow-y-auto">
//                 {CATEGORIES.map(cat => (
//                   <CategoryRow
//                     key={cat.id}
//                     category={cat}
//                     checked={consent[cat.id]}
//                     onChange={handleToggle}
//                   />
//                 ))}
//               </div>
//             )}

//             {/* About tab */}
//             {activeTab === 'about' && (
//               <div className="px-5 py-5">
//                 <p className="text-[13px] text-[#5A6A8A] leading-relaxed">
//                   Cookies are small text files placed on your device by websites you visit. They
//                   are widely used to make websites work efficiently and to provide information to
//                   website owners. See our{' '}
//                   <a href="/privacy" className="text-[#135BEC] hover:text-[#2A6BF0] transition-colors">
//                     cookie policy
//                   </a>{' '}
//                   for full details.
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {/* ── Action buttons ────────────────────────────────────── */}
//         <div className="flex flex-col sm:flex-row gap-2 px-5 py-4 border-t border-white/[0.06]">
//           {/* Reject all */}
//           <ActionButton variant="ghost" onClick={handleRejectAll}>
//             Reject all
//           </ActionButton>

//           {/* Customise / back */}
//           <ActionButton
//             variant="ghost"
//             onClick={() => setCustomise(v => !v)}
//           >
//             {customise ? '← Back' : 'Customise'}
//           </ActionButton>

//           {/* Primary CTA */}
//           <ActionButton
//             variant="primary"
//             onClick={customise ? handleAcceptSelection : handleAcceptAll}
//           >
//             {customise ? 'Accept selection' : 'Accept all cookies'}
//           </ActionButton>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ── ActionButton ─────────────────────────────────────────────────────
// interface ActionButtonProps {
//   variant:  'ghost' | 'primary'
//   onClick:  () => void
//   children: React.ReactNode
// }

// function ActionButton({ variant, onClick, children }: ActionButtonProps) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={cn(
//         'w-full rounded-full py-2.5 px-3',
//         'text-[11px] font-semibold tracking-[0.06em] uppercase',
//         'transition-all duration-150 outline-none',
//         'focus-visible:ring-2 focus-visible:ring-[#135BEC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1525]',
//         variant === 'ghost' && [
//           'bg-transparent text-[#A8B8D8]',
//           'border border-white/[0.12]',
//           'hover:border-white/[0.22] hover:text-[#E8F0FF]',
//           'active:scale-[0.97]',
//         ],
//         variant === 'primary' && [
//           'bg-[#E8F0FF] text-[#0A0E1A]',
//           'border border-transparent',
//           'hover:bg-white',
//           'active:scale-[0.97]',
//           'shadow-[0_2px_12px_rgba(232,240,255,0.15)]',
//         ],
//       )}
//     >
//       {children}
//     </button>
//   )
// }


'use client'

import { useState, useEffect } from 'react'
import { cn }            from '@/lib/cn'
import { CategoryRow }   from './CategoryRow'
import {
  CATEGORIES,
  DEFAULT_CONSENT,
  FULL_CONSENT,
  type ConsentCategory,
  type ConsentState,
} from './cookie-consent.types'

type Tab = 'settings' | 'about'

interface CookieConsentProps {
  /** Called when the user saves a choice. Store this in a cookie / localStorage. */
  onConsent?: (consent: ConsentState) => void
}

/**
 * CookieConsent
 * ──────────────
 * Self-contained banner. Renders as a fixed bottom-centre card.
 * "Customise" expands an inline settings panel — no second modal.
 *
 * Placement: render once in app/layout.tsx, outside any Suspense boundary.
 *
 * @example
 * // app/layout.tsx
 * import { CookieConsent } from '@/components/cookie/CookieConsent'
 * ...
 * <CookieConsent onConsent={(c) => console.log(c)} />
 */
export function CookieConsent({ onConsent }: CookieConsentProps) {
  // Starts hidden — we don't know yet whether the user already consented
  // (reading document.cookie during render would also mismatch SSR output
  // and trigger a hydration error). The mount effect below checks for an
  // existing `cookie_consent` cookie and only then decides to show it.
  const [visible,    setVisible]    = useState(false)
  const [customise,  setCustomise]  = useState(false)
  const [activeTab,  setActiveTab]  = useState<Tab>('settings')
  const [consent,    setConsent]    = useState<ConsentState>(DEFAULT_CONSENT)

  useEffect(() => {
    const hasConsent = document.cookie
      .split('; ')
      .some(row => row.startsWith('cookie_consent='))

    if (!hasConsent) setVisible(true)
  }, [])

  if (!visible) return null

  function handleToggle(id: ConsentCategory, value: boolean) {
    setConsent(prev => ({ ...prev, [id]: value }))
  }

  function handleAcceptAll() {
    onConsent?.(FULL_CONSENT)
    setVisible(false)
  }

  function handleRejectAll() {
    onConsent?.(DEFAULT_CONSENT)
    setVisible(false)
  }

  function handleAcceptSelection() {
    onConsent?.(consent)
    setVisible(false)
  }

  return (
    /* Fixed overlay anchor */
    <div className="fixed bottom-0 sm:bottom-5 right-0 sm:right-5 z-50 w-full sm:w-auto sm:max-w-[400px]">
      <div
        className={cn(
          'w-full rounded-none sm:rounded-[20px] overflow-hidden',
          'bg-[#0F1525] border border-white/[0.08]',
          'shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]',
        )}
      >
        {/* ── Top section ──────────────────────────────────────── */}
        {!customise && (
          <div className="px-6 pt-6 pb-5">
            <div className="flex items-start justify-between mb-3">
              <h2 className="font-display text-[18px] font-normal text-[#E8F0FF] leading-snug">
                We value your privacy
              </h2>
              {/* Cookie icon */}
              <span className="text-[22px] mt-0.5" role="img" aria-label="cookie">🍪</span>
            </div>
            <p className="text-[13px] text-[#5A6A8A] leading-relaxed">
              By clicking "Accept all cookies", you agree to the storing of cookies on your device
              to enhance site navigation, analyse site usage, and assist in our marketing efforts.
              Click "Customise" to personalise the types of cookies you'd like to allow.
            </p>
          </div>
        )}

        {/* ── Customise panel (inline, no second modal) ────────── */}
        {customise && (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-white/[0.06] px-5">
              {(['settings', 'about'] as Tab[]).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'py-3.5 px-1 mr-5 text-[13px] font-medium border-b-2 -mb-px transition-colors',
                    activeTab === tab
                      ? 'border-[#135BEC] text-[#E8F0FF]'
                      : 'border-transparent text-[#5A6A8A] hover:text-[#A8B8D8]'
                  )}
                >
                  {tab === 'settings' ? 'Cookie settings' : 'About'}
                </button>
              ))}
            </div>

            {/* Settings tab */}
            {activeTab === 'settings' && (
              <div className="px-5 max-h-[280px] overflow-y-auto">
                {CATEGORIES.map(cat => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    checked={consent[cat.id]}
                    onChange={handleToggle}
                  />
                ))}
              </div>
            )}

            {/* About tab */}
            {activeTab === 'about' && (
              <div className="px-5 py-5">
                <p className="text-[13px] text-[#5A6A8A] leading-relaxed">
                  Cookies are small text files placed on your device by websites you visit. They
                  are widely used to make websites work efficiently and to provide information to
                  website owners. See our{' '}
                  <a href="/privacy" className="text-[#135BEC] hover:text-[#2A6BF0] transition-colors">
                    cookie policy
                  </a>{' '}
                  for full details.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Action buttons ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-2 px-5 py-4 border-t border-white/[0.06]">
          {/* Reject all */}
          <ActionButton variant="ghost" onClick={handleRejectAll}>
            Reject all
          </ActionButton>

          {/* Customise / back */}
          <ActionButton
            variant="ghost"
            onClick={() => setCustomise(v => !v)}
          >
            {customise ? '← Back' : 'Customise'}
          </ActionButton>

          {/* Primary CTA */}
          <ActionButton
            variant="primary"
            onClick={customise ? handleAcceptSelection : handleAcceptAll}
          >
            {customise ? 'Accept selection' : 'Accept all cookies'}
          </ActionButton>
        </div>
      </div>
    </div>
  )
}

// ── ActionButton ─────────────────────────────────────────────────────
interface ActionButtonProps {
  variant:  'ghost' | 'primary'
  onClick:  () => void
  children: React.ReactNode
}

function ActionButton({ variant, onClick, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-full py-2.5 px-3',
        'text-[11px] font-semibold tracking-[0.06em] uppercase',
        'transition-all duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-[#135BEC] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1525]',
        variant === 'ghost' && [
          'bg-transparent text-[#A8B8D8]',
          'border border-white/[0.12]',
          'hover:border-white/[0.22] hover:text-[#E8F0FF]',
          'active:scale-[0.97]',
        ],
        variant === 'primary' && [
          'bg-[#E8F0FF] text-[#0A0E1A]',
          'border border-transparent',
          'hover:bg-white',
          'active:scale-[0.97]',
          'shadow-[0_2px_12px_rgba(232,240,255,0.15)]',
        ],
      )}
    >
      {children}
    </button>
  )
}