'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, CalendarClock, Plane, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/transactions', label: 'Movimientos', icon: ArrowLeftRight },
  { href: '/trips', label: 'Viajes', icon: Plane },
  { href: '/planner', label: 'Planificar', icon: CalendarClock },
  { href: '/achievements', label: 'Logros', icon: Trophy },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-ink-sumi/95 backdrop-blur-xl z-30 border-t border-surface-border/30"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-all',
                isActive ? 'text-violet-light' : 'text-text-muted active:text-text-secondary'
              )}
            >
              <div
                className={cn(
                  'relative p-1.5 rounded-xl transition-all',
                  isActive && 'bg-violet-500/20'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'text-violet-light')} />
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-light" />
                )}
              </div>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
