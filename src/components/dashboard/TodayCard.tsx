'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Transaction, Category, Trip } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { formatCurrency } from '@/lib/utils/exchangeRates'
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal'
import { Flame, Plus } from 'lucide-react'

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

  const {
    totalCLP,
    totalOriginal,
    originalCurrency,
    byCategory,
    count,
    comparisonPct,
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

    // Aggregate original amount if every transaction is in the trip's foreign currency
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

    // Group by category, sorted desc
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

    // Top 4; group the rest as "Otras N"
    const TOP_N = 4
    let byCategory: typeof sorted = sorted
    if (sorted.length > TOP_N) {
      const top = sorted.slice(0, TOP_N - 1)
      const rest = sorted.slice(TOP_N - 1)
      const restTotal = rest.reduce((s, c) => s + c.totalCLP, 0)
      const restCount = rest.reduce((s, c) => s + c.count, 0)
      byCategory = [
        ...top,
        { name: `Otras ${rest.length}`, icon: '📦', totalCLP: restTotal, totalOriginal: 0, count: restCount },
      ]
    }

    // Comparison target: trip budget/day if during trip, else monthly average
    let comparisonTarget = 0
    let comparisonLabel = ''
    if (isDuringTrip && activeTrip?.budget && totalDays > 0) {
      comparisonTarget = Math.round(activeTrip.budget / totalDays)
      comparisonLabel = 'del presupuesto del día'
    } else if (dailyAvgMonth > 0) {
      comparisonTarget = dailyAvgMonth
      comparisonLabel = 'de tu promedio diario'
    }
    const comparisonPct =
      comparisonTarget > 0 ? Math.round((totalCLP / comparisonTarget) * 100) : null

    return {
      totalCLP,
      totalOriginal,
      originalCurrency,
      byCategory,
      count,
      comparisonPct,
      comparisonTarget,
      comparisonLabel,
      isDuringTrip,
      dayNumber,
      totalDays,
    }
  }, [todayTransactions, dailyAvgMonth, activeTrip, todayStr])

  const dateLabel = DATE_FORMATTER.format(new Date(todayStr + 'T12:00:00'))

  const barColorClass =
    comparisonPct === null
      ? ''
      : comparisonPct <= 70
        ? 'bg-gradient-to-r from-bamboo-take to-green-400'
        : comparisonPct <= 100
          ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
          : 'bg-gradient-to-r from-vermillion-shu to-red-500'

  const barTextClass =
    comparisonPct === null
      ? 'text-text-muted'
      : comparisonPct <= 70
        ? 'text-bamboo-take'
        : comparisonPct <= 100
          ? 'text-yellow-400'
          : 'text-vermillion-shu'

  const barWidth = comparisonPct === null ? 0 : Math.min(comparisonPct, 100)

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

        {count === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
            <p className="text-sm text-text-secondary max-w-sm">
              Aún no registras gastos hoy. Empieza a trackear.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-violet-600 hover:to-indigo-700 transition-all"
            >
              <Plus className="h-4 w-4" />
              Registrar primer gasto
            </button>
          </div>
        ) : (
          <>
            {/* Hero amount */}
            <div className="mb-5">
              {originalCurrency && totalOriginal > 0 ? (
                <>
                  <p className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-text-primary">
                    {formatCurrency(totalOriginal, originalCurrency)}
                  </p>
                  <p className="text-sm text-text-muted mt-0.5 font-mono">
                    ≈ {formatCLP(totalCLP)} · {count} {count === 1 ? 'transacción' : 'transacciones'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-text-primary">
                    {formatCLP(totalCLP)}
                  </p>
                  <p className="text-sm text-text-muted mt-0.5">
                    {count} {count === 1 ? 'transacción' : 'transacciones'}
                  </p>
                </>
              )}
            </div>

            {/* Comparison bar */}
            {comparisonPct !== null && (
              <div className="mb-5">
                <div
                  className="h-2 bg-surface-hover rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={comparisonPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${comparisonPct}% ${comparisonLabel}`}
                >
                  <div
                    className={`h-full transition-all duration-700 ${barColorClass}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs mt-1.5 gap-2">
                  <span className={`${barTextClass} font-semibold`}>
                    {comparisonPct}% {comparisonLabel}
                  </span>
                  <span className="text-text-muted font-mono truncate">
                    meta {formatCLP(comparisonTarget)}
                  </span>
                </div>
              </div>
            )}

            {/* Categories breakdown */}
            {byCategory.length > 0 && (
              <div className="space-y-2 mb-4 pt-3 border-t border-surface-border/50">
                {byCategory.map((c, i) => {
                  const pct = totalCLP > 0 ? Math.round((c.totalCLP / totalCLP) * 100) : 0
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
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
                        <span className="font-mono text-text-primary">
                          {formatCLP(c.totalCLP)}
                        </span>
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
              Nuevo gasto
            </button>
          </>
        )}
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
