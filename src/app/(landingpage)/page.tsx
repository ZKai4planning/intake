import type { Metadata } from 'next'
import { Navbar }             from '@/components/layout/Navbar'
import { Footer }             from '@/components/layout/Footer'
import { HeroSection }        from '@/components/home/HeroSection'
import { ServicesSection }    from '@/components/home/ServicesSection'
// import { HowItWorksSection }  from '@/components/home/HowItWorksSection' // kept in codebase, unused for now — see HowItWorksStripSection below
import { HowItWorksStripSection } from '@/components/home/HowItWorksStripSection'
import { AudienceSplitSection }   from '@/components/home/AudienceSplitSection'
import { PartnerModelsSection }   from '@/components/home/PartnerModelsSection'
import { WhyUsSection }       from '@/components/home/WhyUsSection'
import { PlansSection }       from '@/components/home/PlansSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { FaqSection }         from '@/components/home/FaqSection'
import { FinalCtaSection }    from '@/components/home/FinalCtaSection'
import { MissionStatementSection } from '@/components/home/MissionStatementSection'

import { TeamSection } from '@/components/team/TeamSection'
import { OurTeams } from '@/components/team/OurTeams'

export const metadata: Metadata = {
  title: 'AI4Planning — Smart Planning Permission Advisor',
}

/**
 * Homepage
 * ─────────
 * Full one-page flow: Navbar → Hero (actor select) → How it works
 * (strip) → Audience split (B2B / B2B2C) → Partner models → Services
 * (goal catalogue) → Why AI4Planning → Plans (persona workspaces) →
 * Testimonials → FAQ → Final CTA → Footer.
 *
 * The hero no longer takes free text — the person picks "I'm a
 * homeowner" or "I'm a business / professional" and that routes
 * straight to /check/unsure?actor=…, no goal chosen yet. The chat's
 * LLM works out the goal (and narrows the business actor further if
 * needed) through follow-up questions. AudienceSplitSection's CTAs
 * route the same way for anyone converting further down the page.
 * Every other CTA on this page (goal/service cards, persona cards,
 * final CTA) routes straight through useAuthRedirect: logged in →
 * /dashboard, otherwise → /login carrying the implied persona as
 * ?actor=.
 *
 * Section anchors (#services, #how-it-works, #pricing) match the
 * Navbar's nav items, so top-nav links resolve on this single page
 * instead of pointing at routes that don't exist.
 *
 * NOTE: the old HowItWorksSection component is left untouched in
 * the codebase (just unused here) in case we want to swap back to
 * it later — see HowItWorksStripSection for the version in use now.
 */
export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* <Navbar /> */}
      <HeroSection />
      <HowItWorksStripSection />
      <AudienceSplitSection />
      <PartnerModelsSection />
      <ServicesSection />
      <WhyUsSection />
      <PlansSection />
      {/* <TestimonialsSection /> */}
      <MissionStatementSection />
      <OurTeams />
      <FaqSection />
      <FinalCtaSection />
      {/* <Footer /> */}
    </main>
  )
}
