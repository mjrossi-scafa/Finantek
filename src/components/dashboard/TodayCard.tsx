'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Transaction, Category, Trip } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { formatCurrency } from '@/lib/utils/exchangeRates'
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal'
import { Flame, Plus, Clock } from 'lucide-react'

interface TodayCardProps {
  todayTransactions: Array<Transaction & { categories?: Category }>
  dailyAvgMonth: number
  activeTrip: Trip | null
  todayStr: string
  categories: Category[]
  userId: string
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

// Hoisted outside component to avoid re-creating the Intl instance on every render.
const DATE_FORMATTER = new Intl.DateTimeFormat('es-CL', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const TIME_FORMATTER = new Intl.DateTimeFormat('es-CL', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function TodayCard({
  todayTransactions,
  dailyAvgMonth,
  activeTrip,
  todayStr,
  categories,
  userId,
}: TodayCardProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [now, setNow] = useState<Date | null>(null)

  // Update "now" each minute on the client only — avoids hydration mismatch.
  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const {
    totalCLP,
    totalOriginal,
    originalCurrency,
    byCategory,
    count,
    comparisonTarget,
    comparisonLabel,
    isDuringTrip,
    dayNumber,
    totalDays,
  } = useMemo(() => {
    const totalCLP = todayTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
    const count = todayTransactions.length

    const isDuringTrip =
      !!activeTrip && todayStr >= activeTrip.start_date && todayStr <= activeTrip.end_date

    let dayNumber = 0
    let totalDays = 0
    if (isDuringTrip && activeTrip) {
      const [ty, tm, td] = todayStr.split('-').map(Number)
      const [sy, sm, sd] = activeTrip.start_date.split('-').map(Number)
      const [ey, em, ed] = activeTrip.end_date.split('-').map(Number)
      const todayMs = Date.UTC(ty, tm - 1, td)
      const startMs = Date.UTC(sy, sm - 1, sd)
      const endMs = Date.UTC(ey, em - 1, ed)
      dayNumber = Math.round((todayMs - startMs) / MS_PER_DAY) + 1
      totalDays = Math.max(1, Math.round((endMs - startMs) / MS_PER_DAY) + 1)
    }

    let totalOriginal = 0
    let originalCurrency: string | null = null
    if (isDuringTrip && activeTrip && activeTrip.currency !== 'CLP' && todayTransactions.length > 0) {
      const allMatch = todayTransactions.every((t) => t.original_currency === activeTrip.currency)
      if (allMatch) {
        totalOriginal = todayTransactions.reduce(
          (sum, t) => sum + Number(t.original_amount ?? 0),
          0
        )
        originalCurrency = activeTrip.currency
      }
    }

    const catMap = new Map<
      string,
      { name: string; icon: string; totalCLP: number; totalOriginal: number; count: number }
    >()
    for (const t of todayTransactions) {
      const cat = t.categories
      const key = cat?.id ?? '__none__'
      const entry = catMap.get(key) ?? {
        name: cat?.name ?? 'Sin categoría',
        icon: cat?.icon ?? '💰',
        totalCLP: 0,
        totalOriginal: 0,
        count: 0,
      }
      entry.totalCLP += Number(t.amount)
      entry.totalOriginal += Number(t.original_amount ?? 0)
      entry.count += 1
      catMap.set(key, entry)
    }
    const sorted = Array.from(catMap.values()).sort((a, b) => b.totalCLP - a.totalCLP)

    const TOP_N = 4
    let byCategory: typeof sorted = sorted
    if (sorted.length > TOP_N) {
      const top = sorted.slice(0, TOP_N - 1)
      const rest = sorted.slice(TOP_N - 1)
      const restTotal = rest.reduce((s, c) => s + c.totalCLP, 0)
      const restCount = rest.reduce((s, c) => s + c.count, 0)
      byCategory = [
        ...top,
        {
          name: `Otras ${rest.length}`,
          icon: '📦',
          totalCLP: restTotal,
          totalOriginal: 0,
          count: restCount,
        },
      ]
    }

    let comparisonTarget = 0
    let comparisonLabel = ''
    if (isDuringTrip && activeTrip?.budget && totalDays > 0) {
      comparisonTarget = Math.round(activeTrip.budget / totalDays)
      comparisonLabel = 'presupuesto del día'
    } else if (dailyAvgMonth > 0) {
      comparisonTarget = dailyAvgMonth
      comparisonLabel = 'promedio diario'
    }

    return {
      totalCLP,
      totalOriginal,
      originalCurrency,
      byCategory,
      count,
      comparisonTarget,
      comparisonLabel,
      isDuringTrip,
      dayNumber,
      totalDays,
    }
  }, [todayTransactions, dailyAvgMonth, activeTrip, todayStr])

  // Pace indicator: compare spent-so-far vs expected at current hour of day
  const pace = useMemo(() => {
    if (!now || comparisonTarget <= 0) return null
    const hoursElapsed = now.getHours() + now.getMinutes() / 60
    const dayPct = Math.min(100, (hoursElapsed / 24) * 100)
    const expected = (comparisonTarget * hoursElapsed) / 24
    const ratio = expected > 0 ? totalCLP / expected : 0

    let label: string
    let color: string
    if (totalCLP === 0 || ratio < 0.7) {
      label = 'Vas tranquilo'
      color = 'text-bamboo-take'
    } else if (ratio <= 1.2) {
      label = 'Al ritmo esperado'
      color = 'text-yellow-400'
    } else {
      label = 'Vas acelerado'
      color = 'text-vermillion-shu'
    }

    const timeLabel = TIME_FORMATTER.format(now)
    return { dayPct: Math.round(dayPct), label, color, timeLabel }
  }, [now, comparisonTarget, totalCLP])

  const percentOfBudget =
    comparisonTarget > 0 ? Math.round((totalCLP / comparisonTarget) * 100) : null

  const barColorClass =
    percentOfBudget === null
      ? 'bg-surface-hover'
      : percentOfBudget <= 70
        ? 'bg-gradient-to-r from-bamboo-take to-green-400'
        : percentOfBudget <= 100
          ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
          : 'bg-gradient-to-r from-vermillion-shu to-red-500'

  const barWidth = percentOfBudget === null ? 0 : Math.min(percentOfBudget, 100)

  const dateLabel = DATE_FORMATTER.format(new Date(todayStr + 'T12:00:00'))

  const handleSuccess = () => {
    setModalOpen(false)
    router.refresh()
  }

  const tripLocation = activeTrip?.destination || activeTrip?.name

  return (
    <>
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <Flame className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <h3 className="text-base font-bold text-text-primary">Hoy</h3>
            {isDuringTrip && activeTrip && (
              <span className="text-xs text-violet-light truncate">
                · Día {dayNumber}/{totalDays}
                {tripLocation ? ` en ${tripLocation}` : ''}
              </span>
            )}
          </div>
          <span className="text-xs text-text-muted capitalize">{dateLabel}</span>
        </div>

        {/* Hero amount */}
        <div className="mb-4">
          {originalCurrency && totalOriginal > 0 ? (
            <>
              <p className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-text-primary">
                {formatCurrency(totalOriginal, originalCurrency)}
              </p>
              <p className="text-sm text-text-muted mt-0.5 font-mono">
                ≈ {formatCLP(totalCLP)}
                {comparisonTarget > 0 && (
                  <>
                    {' '}
                    · {percentOfBudget}% de {formatCLP(comparisonTarget)}
                  </>
                )}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-text-primary">
                {formatCLP(totalCLP)}
              </p>
              {comparisonTarget > 0 ? (
                <p className="text-sm text-text-muted mt-0.5">
                  {percentOfBudget}% de {formatCLP(comparisonTarget)} ({comparisonLabel})
                </p>
              ) : (
                <p className="text-sm text-text-muted mt-0.5">
                  Sin presupuesto definido aún
                </p>
              )}
            </>
          )}
        </div>

        {/* Progress bar (always shown when there is a target) */}
        {comparisonTarget > 0 && (
          <div className="mb-4">
            <div
              className="h-2 bg-surface-hover rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={percentOfBudget ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${percentOfBudget ?? 0}% del ${comparisonLabel}`}
            >
              <div
                className={`h-full transition-all duration-700 ${barColorClass}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        )}

        {/* Pace + day progress (client-only, updates every minute) */}
        {pace && (
          <div className="flex items-center justify-between gap-2 text-xs mb-4 pb-4 border-b border-surface-border/50">
            <div className="flex items-center gap-1.5 text-text-muted min-w-0">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-mono">{pace.timeLabel}</span>
              <span className="hidden sm:inline">· {pace.dayPct}% del día</span>
            </div>
            <span className={`${pace.color} font-semibold text-right flex-shrink-0`}>
              {pace.label}
            </span>
          </div>
        )}

        {/* Categories breakdown or empty state */}
        {count === 0 ? (
          <div className="text-xs text-text-muted mb-4 py-2">
            Aún no registras gastos hoy.
            {comparisonTarget > 0
              ? ` Tienes ${formatCLP(comparisonTarget)} de margen diario.`
              : ''}
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
              {count} {count === 1 ? 'transacción' : 'transacciones'}
            </p>
            {byCategory.map((c, i) => {
              const pct = totalCLP > 0 ? Math.round((c.totalCLP / totalCLP) * 100) : 0
              return (
                <div key={i} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="flex-shrink-0">{c.icon}</span>
                    <span className="text-text-secondary truncate">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {originalCurrency && c.totalOriginal > 0 && (
                      <span className="text-[11px] text-text-muted font-mono hidden sm:inline">
                        {formatCurrency(c.totalOriginal, originalCurrency)} ≈
                      </span>
                    )}
                    <span className="font-mono text-text-primary">{formatCLP(c.totalCLP)}</span>
                    <span className="text-[11px] text-text-muted font-mono w-9 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => setModalOpen(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-violet-600 hover:to-indigo-700 transition-all"
        >
          <Plus className="h-4 w-4" />
          {count === 0 ? 'Registrar primer gasto' : 'Nuevo gasto'}
        </button>
      </div>

      <EditTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
        userId={userId}
        onSuccess={handleSuccess}
        mode="create"
        activeTrip={activeTrip}
      />
    </>
  )
}
