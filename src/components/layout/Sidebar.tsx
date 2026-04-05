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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { KatanaLogo } from '@/components/logo/katana-logo'
import { SamuraiContainer } from '@/components/sidebar/SamuraiContainer'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transacciones', icon: ArrowLeftRight },
  { href: '/receipts', label: 'Recibos', icon: Receipt },
  { href: '/budgets', label: 'Presupuestos', icon: Target },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
  { href: '/achievements', label: 'Logros', icon: Trophy },
]

interface SidebarProps {
  totalPoints?: number
}

export function Sidebar({ totalPoints = 0 }: SidebarProps) {
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
      <div className="pt-6 pb-2 px-4">
        <div className="max-w-[130px]">
          <KatanaLogo variant="sidebar" />
        </div>
      </div>

      {/* Achievement badge with wabi-sabi aesthetics */}
      {totalPoints > 0 && (
        <div className="mx-5 mb-5 mt-8">
          <div className="glass-card flex items-center gap-3 px-4 py-3 transition-wa hover:glow-indigo">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-bold font-mono text-text-primary tracking-zen">{totalPoints}</span>
            <span className="text-xs text-text-tertiary font-weight-light">pts</span>
          </div>
        </div>
      )}

      {/* Navigation with zen spacing */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-zen mt-6">
        <p className="text-[10px] text-gray-600 font-medium tracking-[0.2em] uppercase px-3 mb-4 opacity-60">
          MENÚ
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-weight-medium transition-wa',
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

      {/* Samurai Widget */}
      <SamuraiContainer />

      {/* Bot connection with subtle zen indicator */}
      <div className="px-4 mb-4">
        <div className="glass-card flex items-center gap-3 px-3.5 py-3 transition-wa hover:bg-surface-subtle/40">
          <Bot className="h-4 w-4 text-indigo-light" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-weight-medium text-text-secondary tracking-zen">Telegram Bot</p>
            <p className="text-[10px] text-text-muted font-weight-light">@risky_finance_bot</p>
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-bamboo-take animate-pulse shadow-sm" />
        </div>
      </div>

      {/* Bottom actions with zen separation */}
      <div className="ma-md border-t border-sidebar-border/50 space-y-1">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-weight-medium transition-wa',
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
          className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-weight-medium text-text-muted hover:text-vermillion-shu hover:bg-vermillion-shu/5 transition-wa w-full group"
        >
          <LogOut className="h-[18px] w-[18px] group-hover:rotate-6 transition-transform duration-300" />
          Salir
        </button>
      </div>
    </aside>
  )
}
