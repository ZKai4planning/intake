import Link from 'next/link'
import { cn } from '@/lib/cn'
import type { NavItem } from '@/types'

interface NavDesktopProps {
  items: NavItem[]
  currentPath?: string
}

/**
 * NavDesktop
 * ───────────
 * Horizontal nav links for ≥ md screens.
 * Uses CSS-only animated underline (no JS).
 */
export function NavDesktop({ items, currentPath }: NavDesktopProps) {
  return (
    <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-0.5 xl:gap-1">
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          target={item.isExternal ? '_blank' : undefined}
          rel={item.isExternal ? 'noopener noreferrer' : undefined}
          aria-current={currentPath === item.href ? 'page' : undefined}
          className={cn(
            'relative px-3 xl:px-4 py-2.5 text-[15px] xl:text-[17px] font-medium rounded-md whitespace-nowrap',
            'text-[#A8B8D8] transition-colors duration-150',
            'hover:text-[#E8F0FF]',
            'nav-link-underline',
            // Active state
            currentPath === item.href && 'text-[#E8F0FF]'
          )}
        >
          {item.label}
          {item.isExternal && (
            <span className="ml-1 text-[11px] opacity-60" aria-hidden="true">↗</span>
          )}
        </Link>
      ))}
    </nav>
  )
}
