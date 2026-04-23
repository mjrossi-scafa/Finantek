'use client'

import Link from 'next/link'
import { PlannedExpense } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { getChileToday } from '@/lib/utils/timezone'
import { CalendarClock, ArrowRight, AlertTriangle } from 'lucide-react'

interface UpcomingExpensesProps {
  plannedExpenses: PlannedExpense[]
  currentExpense: number
  isHidden?: boolean
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

export function UpcomingExpenses({
  plannedExpenses,
  currentExpense,
  isHidden = false,
}: UpcomingExpensesProps) {
  const todayStr = getChileToday()
  const [ty, tm, td] = todayStr.split('-').map(Number)
  const todayMs = Date.UTC(ty, tm - 1, td)
  const in7DaysMs = todayMs + 7 * MS_PER_DAY
  const in7d = new Date(in7DaysMs)
  const in7DaysStr = `${in7d.getUTCFullYear()}-${String(in7d.getUTCMonth() + 1).padStart(2, '0')}-${String(in7d.getUTCDate()).padStart(2, '0')}`

  const next7Days = plannedExpenses.filter(
    (e) => e.planned_date >= todayStr && e.planned_date <= in7DaysStr
  )
  const next7Total = next7Days.reduce((sum, e) => sum + e.amount, 0)
  const totalPlanned = plannedExpenses.reduce((sum, e) => sum + e.amount, 0)

  const projectedTotal = currentExpense + totalPlanned

  const formatDate = (dateStr: string) => {
    const [py, pm, pd] = dateStr.split('-').map(Number)
    const planMs = Date.UTC(py, pm - 1, pd)
    const diffDays = Math.round((planMs - todayMs) / MS_PER_DAY)

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Mañana'
    if (diffDays < 7) return `En ${diffDays} días`

    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  }

  if (plannedExpenses.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-violet-light" />
            <h3 className="font-bold text-text-primary">Gastos planificados</h3>
          </div>
          <Link
            href="/planner"
            className="text-sm text-violet-light hover:text-violet-primary transition-colors flex items-center gap-1"
          >
            Planificar <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="text-center py-6">
          <p className="text-sm text-text-muted mb-3">
            No tienes gastos planificados este mes
          </p>
          <Link
            href="/planner"
            className="inline-flex items-center gap-1.5 text-sm text-violet-light hover:text-violet-primary transition-colors"
          >
            + Agregar tu primer gasto futuro
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-violet-light" />
          <h3 className="font-bold text-text-primary">Gastos planificados</h3>
        </div>
        <Link
          href="/planner"
          className="text-sm text-violet-light hover:text-violet-primary transition-colors flex items-center gap-1"
        >
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-surface-secondary rounded-xl p-3">
          <p className="text-[10px] text-text-muted uppercase tracking-wide">Próx. 7 días</p>
          <p className="text-sm font-bold font-mono text-text-primary mt-1">
            {isHidden ? '•••••' : formatCLP(next7Total)}
          </p>
          <p className="text-[10px] text-text-muted mt-0.5">{next7Days.length} gastos</p>
        </div>
        <div className="bg-surface-secondary rounded-xl p-3">
          <p className="text-[10px] text-text-muted uppercase tracking-wide">Resto del mes</p>
          <p className="text-sm font-bold font-mono text-vermillion-shu mt-1">
            {isHidden ? '•••••' : formatCLP(totalPlanned)}
          </p>
          <p className="text-[10px] text-text-muted mt-0.5">{plannedExpenses.length} gastos</p>
        </div>
        <div className="bg-violet-500/10 rounded-xl p-3 border border-violet-500/20">
          <p className="text-[10px] text-violet-light uppercase tracking-wide">Proyectado</p>
          <p className="text-sm font-bold font-mono text-violet-light mt-1">
            {isHidden ? '•••••' : formatCLP(projectedTotal)}
          </p>
          <p className="text-[10px] text-text-muted mt-0.5">total mes</p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {plannedExpenses.slice(0, 5).map((exp) => {
          const [py, pm, pd] = exp.planned_date.split('-').map(Number)
          const diffDays = Math.round((Date.UTC(py, pm - 1, pd) - todayMs) / MS_PER_DAY)
          const isUrgent = diffDays <= 2 && diffDays >= 0

          return (
            <div
              key={exp.id}
              className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ backgroundColor: (exp.categories?.color ?? '#8B5CF6') + '20' }}
              >
                {exp.categories?.icon ?? '💸'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm text-text-primary truncate">{exp.description}</p>
                  {isUrgent && (
                    <AlertTriangle className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-text-muted">
                  {formatDate(exp.planned_date)}
                  {exp.categories && ` · ${exp.categories.name}`}
                </p>
              </div>
              <span className="font-mono font-bold text-sm text-vermillion-shu">
                {isHidden ? '•••••' : formatCLP(exp.amount)}
              </span>
            </div>
          )
        })}
        {plannedExpenses.length > 5 && (
          <Link
            href="/planner"
            className="block text-center text-xs text-violet-light hover:text-violet-primary transition-colors pt-2"
          >
            + {plannedExpenses.length - 5} más
          </Link>
        )}
      </div>
    </div>
  )
}
