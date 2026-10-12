// 'use client'

// import { useRouter } from 'next/navigation'

// /**
//  * FinalCtaSection
//  * ─────────────────
//  * Last conversion moment before the footer. Copy promises a free,
//  * no-commitment first result — that's exactly what the pre-login chat
//  * report flow (/check/[goalId]) gives, so this routes there directly
//  * rather than auth-gating like a direct service/plan pick would.
//  */
// export function FinalCtaSection() {
//   const router = useRouter()

//   return (
//     <section className="relative py-16 sm:py-20 border-t border-white/[0.05] overflow-hidden">
//       <div
//         aria-hidden="true"
//         className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
//         style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.10) 0%, transparent 70%)' }}
//       />
//       <div className="relative max-w-[640px] mx-auto px-5 sm:px-8 text-center">
//         <h2 className="font-display text-[28px] sm:text-[36px] font-normal text-[#E8F0FF] tracking-tight mb-3">
//           Find out what you can build — for free
//         </h2>
//         <p className="text-[14.5px] text-[#A8B8D8] leading-relaxed mb-7 max-w-[440px] mx-auto">
//           No planning knowledge needed, no commitment, and your first result
//           is free.
//         </p>
//         <button
//           type="button"
//           onClick={() => router.push('/check/unsure')}
//           className="px-7 py-3.5 rounded-[12px] bg-[#00D4FF] text-[#050A12] font-semibold text-[14.5px] hover:bg-[#2A6BF0] hover:shadow-[0_0_24px_rgba(0,212,255,0.4)] transition-all"
//         >
//           Check my planning route →
//         </button>
//       </div>
//     </section>
//   )
// }


'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { fadeUp, viewportOnce } from '@/lib/motion'


/**
 * FinalCtaSection
 * ─────────────────
 * Last conversion moment before the footer. Copy promises a free,
 * no-commitment first result — that's exactly what the pre-login chat
 * report flow (/check/[goalId]) gives, so this routes there directly
 * rather than auth-gating like a direct service/plan pick would.
 */
export function FinalCtaSection() {
  const router = useRouter()

  return (
    <section className="relative py-16 sm:py-20 border-t border-white/[0.05] overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.10) 0%, transparent 70%)' }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="relative max-w-[640px] mx-auto px-5 sm:px-8 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
      >
        <h2 className="font-display text-[28px] sm:text-[36px] font-normal text-[#E8F0FF] tracking-tight mb-3">
          Find out what you can build — for free
        </h2>
        <p className="text-[14.5px] text-[#A8B8D8] leading-relaxed mb-7 max-w-[440px] mx-auto">
          No planning knowledge needed, no commitment, and your first result
          is free.
        </p>
        <motion.button
          type="button"
          onClick={() => router.push('/check/unsure')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="px-7 py-3.5 rounded-[12px] bg-[#00D4FF] text-[#050A12] font-semibold text-[14.5px] hover:bg-[#2A6BF0] hover:shadow-[0_0_24px_rgba(0,212,255,0.4)] transition-colors"
        >
          Check my planning route →
        </motion.button>
      </motion.div>
    </section>
  )
}