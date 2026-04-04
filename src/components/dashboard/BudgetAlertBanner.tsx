'use client'

import { useState } from 'react'
import { BudgetAlert } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { AlertTriangle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface BudgetAlertBannerProps {
  alerts: BudgetAlert[]
}

export function BudgetAlertBanner({ alerts }: BudgetAlertBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const supabase = createClient()
  const router = useRouter()

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id))
  if (visibleAlerts.length === 0) return null

  async function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]))
    await supabase
      .from('budget_alerts')
      .update({ dismissed_at: new Date().toISOString() })
      .eq('id', id)
    router.refresh()
  }

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert) => {
        const budget = alert.budgets
        const category = budget?.categories
        const isOver = alert.alert_type === '100_percent'

        return (
          <div
            key={alert.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${
              isOver
                ? 'bg-danger/10 border-danger/20 text-danger'
                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
            }`}
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="flex-1 text-sm font-medium">
              <strong>{category?.icon} {category?.name}</strong>:{' '}
              {isOver
                ? `¡Superaste el presupuesto de ${formatCLP(budget?.amount ?? 0)}!`
                : `Alcanzaste el 80% de tu presupuesto (${formatCLP(budget?.amount ?? 0)})`}
            </p>
            <button
              onClick={() => dismiss(alert.id)}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
