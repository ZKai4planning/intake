'use client'

import Image from 'next/image'
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface TeamMember {
  bio: string
  name: string
  role: string
  src: string
}

interface TeamCarouselProps {
  members: TeamMember[]
  autoplay?: boolean
}

function calculateGap(width: number) {
  const minWidth = 1024
  const maxWidth = 1456
  const minGap = 60
  const maxGap = 86
  if (width <= minWidth) return minGap
  if (width >= maxWidth) return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth))
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth))
}

/**
 * TeamCarousel
 * ──────────────
 * 3D-stacked carousel for team member profiles — separate from
 * TestimonialCarousel (customer quotes) even though the mechanic is
 * shared, since the two live in different places on the site and
 * shouldn't be coupled to the same data shape. Colours match the
 * site's #00D4FF accent. No react-icons — uses lucide-react like the
 * rest of the app.
 */
export function TeamCarousel({ members, autoplay = true }: TeamCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverPrev, setHoverPrev] = useState(false)
  const [hoverNext, setHoverNext] = useState(false)
  const [containerWidth, setContainerWidth] = useState(1200)

  const imageContainerRef = useRef<HTMLDivElement>(null)
  const autoplayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const membersLength = useMemo(() => members.length, [members])
  const activeMember = useMemo(() => members[activeIndex], [activeIndex, members])

  useEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) setContainerWidth(imageContainerRef.current.offsetWidth)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (autoplay) {
      autoplayIntervalRef.current = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % membersLength)
      }, 5000)
    }
    return () => {
      if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current)
    }
  }, [autoplay, membersLength])

  const handleNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % membersLength)
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current)
  }, [membersLength])

  const handlePrev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + membersLength) % membersLength)
    if (autoplayIntervalRef.current) clearInterval(autoplayIntervalRef.current)
  }, [membersLength])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handlePrev, handleNext])

  function getImageStyle(index: number): React.CSSProperties {
    const gap = calculateGap(containerWidth)
    const maxStickUp = gap * 0.8
    const isActive = index === activeIndex
    const isLeft = (activeIndex - 1 + membersLength) % membersLength === index
    const isRight = (activeIndex + 1) % membersLength === index

    if (isActive) {
      return {
        zIndex: 3, opacity: 1, pointerEvents: 'auto',
        transform: 'translateX(0px) translateY(0px) scale(1) rotateY(0deg)',
        transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
      }
    }
    if (isLeft) {
      return {
        zIndex: 2, opacity: 1, pointerEvents: 'auto',
        transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
        transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
      }
    }
    if (isRight) {
      return {
        zIndex: 2, opacity: 1, pointerEvents: 'auto',
        transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
        transition: 'all 0.8s cubic-bezier(.4,2,.3,1)',
      }
    }
    return { zIndex: 1, opacity: 0, pointerEvents: 'none', transition: 'all 0.8s cubic-bezier(.4,2,.3,1)' }
  }

  const bioVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <div className="team-container">
      <div className="team-grid">
        <div className="image-container" ref={imageContainerRef}>
          {members.map((member, index) => (
            <div key={member.src} className="team-image" data-index={index} style={getImageStyle(index)}>
              <Image src={member.src} alt={member.name} fill sizes="(min-width: 768px) 24rem, 100vw" className="object-cover" />
            </div>
          ))}
        </div>

        <div className="team-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={bioVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <h3 className="name">{activeMember.name}</h3>
              <p className="role">{activeMember.role}</p>
              <motion.p className="bio">
                {activeMember.bio.split(' ').map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ filter: 'blur(10px)', opacity: 0, y: 5 }}
                    animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut', delay: 0.025 * i }}
                    style={{ display: 'inline-block' }}
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <div className="arrow-buttons">
            <button
              className="arrow-button"
              onClick={handlePrev}
              style={{
                backgroundColor: hoverPrev ? '#00D4FF' : '#0B1224',
                boxShadow: hoverPrev ? '0 0 16px rgba(0,212,255,0.4)' : 'none',
              }}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
              aria-label="Previous team member"
            >
              <ChevronLeft size={22} color={hoverPrev ? '#050A12' : '#E8F0FF'} />
            </button>
            <button
              className="arrow-button"
              onClick={handleNext}
              style={{
                backgroundColor: hoverNext ? '#00D4FF' : '#0B1224',
                boxShadow: hoverNext ? '0 0 16px rgba(0,212,255,0.4)' : 'none',
              }}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
              aria-label="Next team member"
            >
              <ChevronRight size={22} color={hoverNext ? '#050A12' : '#E8F0FF'} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .team-container { width: 100%; max-width: 64rem; margin: 0 auto; }
        .team-grid { display: grid; gap: 3rem; }
        .image-container { position: relative; width: 100%; height: 22rem; perspective: 1000px; }
        .team-image {
          position: absolute; width: 100%; height: 100%;
          border-radius: 1.25rem; overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.45);
        }
        .team-content { display: flex; flex-direction: column; justify-content: center; }
        .name { font-weight: 700; font-size: 1.375rem; color: #E8F0FF; margin-bottom: 0.25rem; }
        .role { color: #00D4FF; font-size: 0.875rem; margin-bottom: 1.5rem; }
        .bio { line-height: 1.75; color: #A8B8D8; font-size: 1.0625rem; }
        .arrow-buttons { display: flex; gap: 1rem; padding-top: 2rem; }
        .arrow-button {
          width: 2.6rem; height: 2.6rem; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background-color 0.3s, box-shadow 0.3s; border: 1px solid rgba(0,212,255,0.25);
        }
        @media (min-width: 768px) {
          .team-grid { grid-template-columns: 1fr 1fr; align-items: center; }
        }
      `}</style>
    </div>
  )
}