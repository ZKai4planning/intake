import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Brand colours extracted from AI4Planning logo ──
      colors: {
        bg: {
          DEFAULT: '#0A0E1A',  // deep navy-black
          2:       '#0F1525',  // card surface
          3:       '#141C30',  // elevated surface
          4:       '#1A2540',  // hover / selected
        },
        ink: {
          DEFAULT: '#E8F0FF',  // soft white
          light:   '#A8B8D8',  // secondary text
          faint:   '#5A6A8A',  // muted / placeholder
        },
        accent: {
          DEFAULT: '#135BEC',  // brand blue — primary CTA
          dim:     '#0F4FD1',  // darker blue hover
          glow:    'rgba(19,91,236,0.18)',
          bg:      'rgba(19,91,236,0.08)',
        },
        cyan: {
          DEFAULT: '#00D4FF',
          bg:      'rgba(0,212,255,0.08)',
        },
        purple: {
          DEFAULT: '#8B5CF6',
          bg:      'rgba(139,92,246,0.1)',
        },
        amber: {
          DEFAULT: '#F59E0B',
          bg:      'rgba(245,158,11,0.1)',
        },
        danger: {
          DEFAULT: '#F87171',
          bg:      'rgba(248,113,113,0.1)',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          str:     'rgba(255,255,255,0.16)',
          acc:     'rgba(19,91,236,0.35)',
        },
      },

      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },

      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
        xs:    ['0.75rem', { lineHeight: '1.125rem' }],
        sm:    ['0.8125rem', { lineHeight: '1.25rem' }],
        base:  ['0.875rem', { lineHeight: '1.375rem' }],
        md:    ['0.9375rem', { lineHeight: '1.5rem' }],
        lg:    ['1rem', { lineHeight: '1.5rem' }],
        xl:    ['1.125rem', { lineHeight: '1.625rem' }],
        '2xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '3xl': ['1.5rem', { lineHeight: '2rem' }],
        '4xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '5xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '6xl': ['3rem', { lineHeight: '1.05' }],
      },

      borderRadius: {
        sm:  '6px',
        md:  '10px',
        lg:  '14px',
        xl:  '18px',
        '2xl': '24px',
      },

      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)',
        lg:   '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        glow: '0 0 20px rgba(19,91,236,0.25), 0 4px 16px rgba(0,0,0,0.4)',
        'glow-lg': '0 0 40px rgba(19,91,236,0.35), 0 8px 32px rgba(0,0,0,0.5)',
        btn:  '0 0 16px rgba(19,91,236,0.3)',
      },

      backgroundImage: {
        'hero-glow': 'radial-gradient(ellipse at 50% 0%, rgba(19,91,236,0.12) 0%, rgba(0,212,255,0.06) 40%, transparent 70%)',
        'accent-gradient': 'linear-gradient(135deg, #135BEC, #00D4FF)',
        'card-gradient': 'linear-gradient(140deg, rgba(19,91,236,0.07) 0%, rgba(0,212,255,0.04) 100%)',
      },

      animation: {
        'fade-up':    'fadeUp 0.25s cubic-bezier(0.22, 0.68, 0, 1.1) both',
        'fade-in':    'fadeIn 0.2s ease-out both',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'slide-down': 'slideDown 0.2s ease-out both',
      },

      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 16px rgba(19,91,236,0.3)' },
          '50%':      { boxShadow: '0 0 32px rgba(19,91,236,0.5)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },

      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
}

export default config
