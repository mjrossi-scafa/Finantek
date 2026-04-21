'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, CalendarClock, Target, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/transactions', label: 'Movimientos', icon: ArrowLeftRight },
  { href: '/planner', label: 'Planificar', icon: CalendarClock },
  { href: '/budgets', label: 'Metas', icon: Target },
  { href: '/achievements', label: 'Logros', icon: Trophy },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-ink-sumi/90 backdrop-blur-xl z-50 border-t border-surface-border/30 safe-area-bottom">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-weight-medium transition-wa tracking-zen',
                isActive ? 'text-indigo-light' : 'text-text-muted'
              )}
            >
              <div className={cn(
                'p-2 rounded-xl transition-wa',
                isActive && 'gradient-indigo shadow-lg glow-indigo scale-105'
              )}>
                <Icon className={cn('h-5 w-5', isActive && 'text-white')} />
              </div>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
