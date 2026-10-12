// 'use client'

// import { Check, MessageCircle } from 'lucide-react'
// import { useAuthRedirect } from '@/hooks/useAuthRedirect'

// interface PricingPlan {
//   name: string
//   description: string
//   button: string
//   initialCharge: number
//   subsequentCharge: number
//   features: string[]
//   badge?: string
// }

// const PLANS: PricingPlan[] = [
//   {
//     name: 'Bronze',
//     description: 'Essential — free service',
//     button: 'Get Started',
//     initialCharge: 40,
//     subsequentCharge: 100,
//     features: [
//       "15 'Planning Intelligence' buttons",
//       'Basic AI guidance',
//       'Simple templates & eligibility checks',
//       'Basic document upload',
//       'Light Agent review',
//       'Standard turnaround',
//     ],
//   },
//   {
//     name: 'Silver',
//     description: 'Most popular',
//     button: 'Get Started',
//     initialCharge: 70,
//     subsequentCharge: 170,
//     features: [
//       '~50–60% self-service',
//       "30 'Planning Intelligence' buttons",
//       'AI auto-fill & smart validation',
//       'Structured document support',
//       'Active Agent guidance',
//       'Chat / scheduled consultation',
//       'Higher response time',
//     ],
//   },
//   {
//     name: 'Gold',
//     description: 'Advanced support',
//     button: 'Get Access',
//     initialCharge: 120,
//     subsequentCharge: 280,
//     badge: 'Most popular',
//     features: [
//       '~60–70% self-service',
//       'Higher level of AI toolkit',
//       'Advanced document generation',
//       'Priority Agent consultation (1–2 sessions)',
//       'Comprehensive review & coordination',
//       'Priority handling',
//     ],
//   },
//   {
//     name: 'Platinum',
//     description: 'Full-service concierge',
//     button: 'Get Started',
//     initialCharge: 200,
//     subsequentCharge: 500,
//     features: [
//       '10–20% self-service (minimal effort required)',
//       'Most advanced AI features',
//       'Dedicated Agent throughout the process',
//       'Agent manages communication & coordination',
//       'Milestone approvals handled',
//       'Turnkey document preparation & submission support',
//     ],
//   },
// ]

// // Bronze and Silver are live today; Gold and Platinum are coming soon
// // and shown locked/blurred rather than hidden, so the full ladder is
// // visible even before those tiers open up.
// const RESTRICTED_PLANS = new Set(['Gold', 'Platinum'])

// /**
//  * PlansSection
//  * ──────────────
//  * Pricing ladder, styled to match the reference pricing-cards design
//  * (dark navy surface, blue primary accent). CTAs route through the
//  * same auth gate as the rest of the page.
//  */
// export function PlansSection() {
//   const goToApp = useAuthRedirect()

//   return (
//     <section id="pricing" className="relative bg-[#050B18] text-white py-16 sm:py-20 border-t border-white/[0.05]">
//       <div className="text-center mb-12 px-5 sm:px-8">
//         <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#135BEC] mb-3">
//           Pricing
//         </p>
//         <h2 className="font-display text-[28px] sm:text-[34px] font-normal tracking-tight">
//           Our Plans
//         </h2>
//         <p className="mt-3 text-white/60 text-sm sm:text-base max-w-[560px] mx-auto">
//           Own your planning journey. Save time and money with AI-powered tools —
//           choose the tier that fits your project.
//         </p>
//       </div>

//       <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-5 sm:px-8">
//         {PLANS.map(plan => {
//           const isRestricted = RESTRICTED_PLANS.has(plan.name)

//           return (
//             <div
//               key={plan.name}
//               className={`relative rounded-2xl border shadow-lg transition-all duration-300 p-6 ${
//                 isRestricted
//                   ? 'bg-[#0B1224]/60 text-white/70 border-white/10 blur-[3px] opacity-65'
//                   : 'bg-[#0B1224] text-white border-blue-500/40'
//               }`}
//             >
//               {plan.badge && (
//                 <div className="absolute top-4 right-4 bg-zinc-800 text-white text-xs px-2 py-1 rounded-full">
//                   {plan.badge}
//                 </div>
//               )}

//               <h3 className="text-lg font-semibold">{plan.name}</h3>
//               <p className="text-sm opacity-70 mt-1">{plan.description}</p>

//               <button
//                 type="button"
//                 disabled={isRestricted}
//                 onClick={() => {
//                   if (!isRestricted) goToApp(null, '/dashboard/new/intent')
//                 }}
//                 className={`mt-4 w-full rounded-xl py-2.5 font-semibold text-sm transition-colors ${
//                   isRestricted
//                     ? 'bg-white/20 text-white/60 cursor-not-allowed'
//                     : 'bg-[#135BEC] text-white hover:bg-[#2A6BF0]'
//                 }`}
//               >
//                 {plan.button}
//               </button>

//               <ul className="mt-6 space-y-3 text-sm">
//                 {plan.features.map(feature => (
//                   <li key={feature} className="flex items-start gap-2">
//                     <Check className={`w-4 h-4 mt-1 shrink-0 ${isRestricted ? 'text-white/40' : 'text-[#00D4FF]'}`} />
//                     <span>{feature}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )
//         })}
//       </div>

//       <div className="mt-12 text-center">
//         <div className="flex items-center justify-center gap-2 text-sm text-white/80">
//           <MessageCircle className="w-4 h-4 text-[#00D4FF]" />
//           <span>
//             Have a question?
//             <a
//               href="https://api.whatsapp.com/send/?phone=447777788885&text=Hello%21+I+have+a+query.&type=phone_number&app_absent=0"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-[#00D4FF] hover:underline ml-2"
//             >
//               Connect with us
//             </a>
//           </span>
//         </div>
//       </div>
//     </section>
//   )
// }


'use client'

import { motion } from 'framer-motion'
import { Check, MessageCircle } from 'lucide-react'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { fadeUp, staggerContainer, viewportOnce } from '@/lib/motion'


interface PricingPlan {
  name: string
  description: string
  button: string
  initialCharge: number
  subsequentCharge: number
  features: string[]
  badge?: string
}

const PLANS: PricingPlan[] = [
  {
    name: 'Bronze',
    description: 'Essential — free service',
    button: 'Get Started',
    initialCharge: 40,
    subsequentCharge: 100,
    features: [
      "15 'Planning Intelligence' buttons",
      'Basic AI guidance',
      'Simple templates & eligibility checks',
      'Basic document upload',
      'Light Agent review',
      'Standard turnaround',
    ],
  },
  {
    name: 'Silver',
    description: 'Most popular',
    button: 'Get Started',
    initialCharge: 70,
    subsequentCharge: 170,
    features: [
      '~50–60% self-service',
      "30 'Planning Intelligence' buttons",
      'AI auto-fill & smart validation',
      'Structured document support',
      'Active Agent guidance',
      'Chat / scheduled consultation',
      'Higher response time',
    ],
  },
  {
    name: 'Gold',
    description: 'Advanced support',
    button: 'Get Access',
    initialCharge: 120,
    subsequentCharge: 280,
    badge: 'Most popular',
    features: [
      '~60–70% self-service',
      'Higher level of AI toolkit',
      'Advanced document generation',
      'Priority Agent consultation (1–2 sessions)',
      'Comprehensive review & coordination',
      'Priority handling',
    ],
  },
  {
    name: 'Platinum',
    description: 'Full-service concierge',
    button: 'Get Started',
    initialCharge: 200,
    subsequentCharge: 500,
    features: [
      '10–20% self-service (minimal effort required)',
      'Most advanced AI features',
      'Dedicated Agent throughout the process',
      'Agent manages communication & coordination',
      'Milestone approvals handled',
      'Turnkey document preparation & submission support',
    ],
  },
]

// Bronze and Silver are live today; Gold and Platinum are coming soon
// and shown locked/blurred rather than hidden, so the full ladder is
// visible even before those tiers open up.
const RESTRICTED_PLANS = new Set(['Gold', 'Platinum'])

/**
 * PlansSection
 * ──────────────
 * Pricing ladder, styled to match the reference pricing-cards design
 * (dark navy surface, blue primary accent). CTAs route through the
 * same auth gate as the rest of the page.
 *
 * Eyebrow label uses the same #00D4FF cyan as every other section
 * (was a stray #135BEC blue) so the accent color reads as one
 * consistent brand color across the whole page, not per-section.
 */
export function PlansSection() {
  const goToApp = useAuthRedirect()

  return (
    <section id="pricing" className="relative bg-[#050B18] text-white py-16 sm:py-20 border-t border-white/[0.05]">
      <motion.div
        className="text-center mb-12 px-5 sm:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
      >
        <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#00D4FF] mb-3">
          Pricing
        </p>
        <h2 className="font-display text-[28px] sm:text-[34px] font-normal tracking-tight">
          Our Plans
        </h2>
        <p className="mt-3 text-white/60 text-sm sm:text-base max-w-[560px] mx-auto">
          Own your planning journey. Save time and money with AI-powered tools —
          choose the tier that fits your project.
        </p>
      </motion.div>

      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-5 sm:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer}
      >
        {PLANS.map(plan => {
          const isRestricted = RESTRICTED_PLANS.has(plan.name)

          return (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              whileHover={isRestricted ? undefined : { y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className={`relative rounded-2xl border shadow-lg transition-colors duration-300 p-6 ${
                isRestricted
                  ? 'bg-[#0B1224]/60 text-white/70 border-white/10 blur-[3px] opacity-65'
                  : 'bg-[#0B1224] text-white border-[rgba(0,212,255,0.3)] hover:border-[rgba(0,212,255,0.6)] hover:shadow-[0_0_28px_rgba(0,212,255,0.15)]'
              }`}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3 right-4 bg-[#00D4FF] text-[#050B18] text-[11px] font-bold px-2.5 py-1 rounded-full shadow-[0_0_16px_rgba(0,212,255,0.5)]"
                >
                  {plan.badge}
                </div>
              )}

              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-sm opacity-70 mt-1">{plan.description}</p>

              <button
                type="button"
                disabled={isRestricted}
                onClick={() => {
                  if (!isRestricted) goToApp(null, '/dashboard/new/intent')
                }}
                className={`mt-4 w-full rounded-xl py-2.5 font-semibold text-sm transition-colors ${
                  isRestricted
                    ? 'bg-white/20 text-white/60 cursor-not-allowed'
                    : 'bg-[#135BEC] text-white hover:bg-[#2A6BF0]'
                }`}
              >
                {plan.button}
              </button>

              <ul className="mt-6 space-y-3 text-sm">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className={`w-4 h-4 mt-1 shrink-0 ${isRestricted ? 'text-white/40' : 'text-[#00D4FF]'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="mt-12 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-white/80">
          <MessageCircle className="w-4 h-4 text-[#00D4FF]" />
          <span>
            Have a question?
            <a
              href="https://api.whatsapp.com/send/?phone=447777788885&text=Hello%21+I+have+a+query.&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00D4FF] hover:underline ml-2"
            >
              Connect with us
            </a>
          </span>
        </div>
      </div>
    </section>
  )
}