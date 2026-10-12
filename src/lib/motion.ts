import type { Variants } from 'framer-motion'

/**
 * Shared scroll-reveal variants for landing-page sections.
 * Keeps motion consistent (same easing/duration/offset) across
 * Services, HowItWorks, WhyUs, Plans, Faq — instead of each section
 * hand-rolling its own fade/slide timing.
 */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
}

export const viewportOnce = { once: true, margin: '-80px 0px' }