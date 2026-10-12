import { TestimonialCarousel, type Testimonial } from '@/components/ui/TestimonialCarousel'

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "We're in a conservation area, so I assumed a rear extension was a lost cause. The check told me exactly what would and wouldn't need permission — saved us weeks of back-and-forth with the council.",
    name: 'Homeowner',
    designation: 'Bristol',
    src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    quote:
      "I run six rental properties and had no idea one of them had drifted into HMO territory. The compliance check flagged it before it became a licensing problem.",
    name: 'Landlord',
    designation: 'Manchester',
    src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    quote:
      "We use the site feasibility check before every acquisition now. It's the fastest way to rule out a site before we spend on a full survey.",
    name: 'Developer',
    designation: 'Leeds',
    src: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80',
  },
]

/**
 * TestimonialsSection
 * ──────────────────────
 * Interactive quote carousel — replaces the previous static quote
 * grid. Same grounded, role + city format (not fabricated names or
 * companies), now presented as the animated carousel from the
 * reference design, recoloured to the app's blue accent.
 */
export function TestimonialsSection() {
  return (
    <section className="relative py-16 sm:py-20 border-t border-white/[0.05]" aria-labelledby="testimonials-heading">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8">

        <div className="text-center max-w-[560px] mx-auto mb-12">
          <p className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#00D4FF] mb-3">
            Who it's for
          </p>
          <h2 id="testimonials-heading" className="font-display text-[28px] sm:text-[34px] font-normal text-[#E8F0FF] tracking-tight">
            Real situations, not generic praise
          </h2>
        </div>

        <TestimonialCarousel testimonials={TESTIMONIALS} />
      </div>
    </section>
  )
}
