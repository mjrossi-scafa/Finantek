'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu, X,
  LayoutDashboard, ArrowLeftRight, Plane, CalendarClock,
  Receipt, Target, Lightbulb, Trophy, Settings, LogOut,
  Star, Bot,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { KatanaLogo } from '@/components/logo/katana-logo'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { href: '/trips', label: 'Viajes', icon: Plane },
  { href: '/planner', label: 'Planificador', icon: CalendarClock },
  { href: '/receipts', label: 'Recibos', icon: Receipt },
  { href: '/budgets', label: 'Presupuestos', icon: Target },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/achievements', label: 'Logros', icon: Trophy },
]

interface Props {
  totalPoints?: number
}

export function MobileDrawer({ totalPoints = 0 }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Close drawer on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Hamburger button - visible only on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed left-3 z-40 w-10 h-10 rounded-xl bg-surface-elevated/90 backdrop-blur-lg border border-white/10 flex items-center justify-center text-text-primary hover:bg-surface-hover shadow-lg transition-colors"
        style={{ top: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'md:hidden fixed top-0 left-0 bottom-0 z-50 w-[85%] max-w-[320px] bg-sidebar border-r border-sidebar-border flex flex-col',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="w-40">
            <KatanaLogo variant="sidebar" />
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Points badge */}
        {totalPoints > 0 && (
          <div className="mx-5 mb-3">
            <div className="glass-card flex items-center gap-2 px-4 py-2">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold font-mono text-text-primary">{totalPoints}</span>
              <span className="text-xs text-text-tertiary">puntos</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto mt-2">
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
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'gradient-indigo text-white shadow-lg'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle/60 active:bg-surface-subtle'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Telegram Bot CTA */}
        <div className="px-4 py-2">
          <a
            href="https://t.me/risky_finance_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-light"
          >
            <Bot className="h-5 w-5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">Telegram Bot</p>
              <p className="text-[10px] text-violet-400/70">@risky_finance_bot</p>
            </div>
          </a>
        </div>

        {/* Bottom actions */}
        <div className="px-4 py-3 border-t border-sidebar-border space-y-0.5">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all',
              pathname === '/settings'
                ? 'gradient-indigo text-white shadow-lg'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle/60'
            )}
          >
            <Settings className="h-5 w-5" />
            Configuración
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-text-muted hover:text-vermillion-shu hover:bg-vermillion-shu/5 transition-all w-full"
          >
            <LogOut className="h-5 w-5" />
            Salir
          </button>
        </div>
      </aside>
    </>
  )
}
