import React from 'react'
import { cn } from '@/lib/cn'

// ── Variant definitions ───────────────────────────────────────────
const BASE =
  'inline-flex items-center justify-center gap-1.5 font-sans font-medium ' +
  'rounded-[10px] transition-all duration-150 whitespace-nowrap select-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135BEC] ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0E1A] ' +
  'disabled:opacity-40 disabled:pointer-events-none'

const VARIANTS = {
  primary:
    'bg-[#135BEC] text-white font-semibold ' +
    'shadow-[0_0_16px_rgba(19,91,236,0.30)] ' +
    'hover:bg-[#2A6BF0] hover:shadow-[0_0_24px_rgba(19,91,236,0.50)] hover:-translate-y-px ' +
    'active:translate-y-0 active:shadow-[0_0_12px_rgba(19,91,236,0.20)]',

  ghost:
    'bg-white/[0.04] border border-white/20 text-[#A8B8D8] ' +
    'hover:bg-white/[0.08] hover:border-white/30 hover:text-[#E8F0FF]',

  outline:
    'border border-[rgba(19,91,236,0.35)] text-[#135BEC] bg-transparent ' +
    'hover:bg-[rgba(19,91,236,0.08)] hover:border-[#135BEC]',

  danger:
    'bg-[rgba(248,113,113,0.10)] border border-[rgba(248,113,113,0.25)] text-[#F87171] ' +
    'hover:bg-[rgba(248,113,113,0.18)]',
} as const

const SIZES = {
  sm:  'h-8  px-3    text-xs',
  md:  'h-9  px-4    text-sm',
  lg:  'h-11 px-5    text-base',
  xl:  'h-13 px-7    text-md',
} as const

// ── Types ─────────────────────────────────────────────────────────
type Variant = keyof typeof VARIANTS
type Size    = keyof typeof SIZES

interface ButtonOwnProps {
  variant?:  Variant
  size?:     Size
  fullWidth?: boolean
  isLoading?: boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
}

// Polymorphic: renders <button> by default, <a> when href is provided
type ButtonAsButton = ButtonOwnProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> & {
    as?: 'button'
    href?: undefined
  }

type ButtonAsAnchor = ButtonOwnProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps> & {
    as: 'a'
    href: string
  }

type ButtonProps = ButtonAsButton | ButtonAsAnchor

// ── Component ─────────────────────────────────────────────────────
export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(props, ref) {
  const {
    variant   = 'primary',
    size      = 'md',
    fullWidth = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    className,
    children,
    as,
    ...rest
  } = props

  const classes = cn(
    BASE,
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className
  )

  const content = (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {leftIcon  && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </>
  )

  if (as === 'a') {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      disabled={(rest as React.ButtonHTMLAttributes<HTMLButtonElement>).disabled || isLoading}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  )
})

Button.displayName = 'Button'

// ── Spinner ───────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  )
}
