'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  Target,
  Lightbulb,
  Trophy,
  Settings,
  LogOut,
  Star,
  Bot,
  CalendarClock,
  Plane,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { KatanaLogo } from '@/components/logo/katana-logo'
import { SamuraiContainer } from '@/components/sidebar/SamuraiContainer'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, tour: 'nav-dashboard' },
  { href: '/transactions', label: 'Transacciones', icon: ArrowLeftRight, tour: 'nav-transactions' },
  { href: '/trips', label: 'Viajes', icon: Plane, tour: 'nav-trips' },
  { href: '/planner', label: 'Planificador', icon: CalendarClock, tour: 'nav-planner' },
  { href: '/receipts', label: 'Recibos', icon: Receipt, tour: 'nav-receipts' },
  { href: '/budgets', label: 'Presupuestos', icon: Target, tour: 'nav-budgets' },
  { href: '/insights', label: 'Insights', icon: Lightbulb, tour: 'nav-insights' },
  { href: '/achievements', label: 'Logros', icon: Trophy, tour: 'nav-achievements' },
]

import type { KatanaState } from '@/app/(app)/layout'

interface SidebarProps {
  totalPoints?: number
  katanaState?: KatanaState
}

export function Sidebar({ totalPoints = 0, katanaState = 'violet' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-[280px] bg-sidebar h-screen sticky top-0 border-r border-sidebar-border pattern-asanoha">
      {/* Zen accent line (inspired by Japanese scroll design) */}
      <div className="absolute top-0 left-0 w-[1px] h-full gradient-indigo opacity-30" />

      {/* Logo KATANA con barras SVG */}
      <div className="pt-6 pb-3 px-5">
        <div>
          <KatanaLogo variant="sidebar" className="!min-w-[180px] !max-w-[180px]" />
        </div>
      </div>

      {/* Achievement badge with wabi-sabi aesthetics */}
      {totalPoints > 0 && (
        <div className="mx-5 mb-3 mt-4">
          <div className="glass-card flex items-center gap-3 px-4 py-2 transition-wa hover:glow-indigo">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-bold font-mono text-text-primary tracking-zen">{totalPoints}</span>
            <span className="text-xs text-text-tertiary font-weight-light">pts</span>
          </div>
        </div>
      )}

      {/* Navigation with zen spacing */}
      <nav className="px-4 space-y-0.5 mt-2">
        <p className="text-[10px] text-gray-600 font-medium tracking-[0.2em] uppercase px-3 mb-2 opacity-60">
          MENÚ
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.tour}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-weight-medium transition-wa',
                isActive
                  ? 'gradient-indigo text-white shadow-lg glow-indigo'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle/60'
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Samurai Widget - right after menu, no stretching */}
      <SamuraiContainer katanaState={katanaState} />

      {/* Spacer to push telegram + footer to bottom */}
      <div className="flex-1 min-h-0" />

      {/* CTA Telegram Bot útil - compact */}
      <div className="px-4 mb-2 flex-shrink-0">
        <a
          href="https://t.me/risky_finance_bot"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            margin: '0 4px',
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: '10px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.08)'}
        >
          {/* Ícono Telegram */}
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '7px',
            background: 'rgba(124,58,237,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#A855F7">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.667l-2.965-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.983.892z"/>
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#C084FC',
              margin: '0 0 1px',
            }}>
              Telegram bot
            </p>
            <p style={{
              fontSize: '9px',
              color: '#4C1D95',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              @risky_finance_bot
            </p>
          </div>

          <svg width="10" height="10" viewBox="0 0 24 24"
            fill="none" stroke="#4C1D95" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>

      {/* Bottom actions with zen separation - compact */}
      <div className="px-4 py-2 border-t border-sidebar-border/50 space-y-0.5 flex-shrink-0">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-weight-medium transition-wa',
            pathname === '/settings'
              ? 'gradient-indigo text-white shadow-lg glow-indigo'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle/60'
          )}
        >
          <Settings className="h-[18px] w-[18px]" />
          Configuración
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-weight-medium text-text-muted hover:text-vermillion-shu hover:bg-vermillion-shu/5 transition-wa w-full group"
        >
          <LogOut className="h-[18px] w-[18px] group-hover:rotate-6 transition-transform duration-300" />
          Salir
        </button>
      </div>
    </aside>
  )
}
