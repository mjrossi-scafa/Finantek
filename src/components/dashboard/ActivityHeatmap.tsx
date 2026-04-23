'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { formatCLP } from '@/lib/utils/currency'
import { Flame, Plus, ChevronDown, ChevronUp } from 'lucide-react'

const COLLAPSE_KEY = 'katana:heatmap-collapsed'

interface ActivityHeatmapProps {
  data: Array<{ date: string; amount: number; count: number }>
  todayStr: string // YYYY-MM-DD in user's timezone (passed from server to avoid UTC drift)
}

export function ActivityHeatmap({ data, todayStr }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; amount: number; count: number } | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setIsCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === '1')
  }, [])

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      }
      return next
    })
  }

  // Auto-scroll to the end (most recent weeks) on mount for mobile
  useEffect(() => {
    if (!isCollapsed && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [isCollapsed])

  const { days, weekLabels, monthLabels, maxAmount, streakInfo } = useMemo(() => {
    const dataMap = new Map(data.map((d) => [d.date, d]))

    // Parse todayStr as UTC date to iterate day-by-day without DST surprises
    const [ty, tm, td] = todayStr.split('-').map(Number)
    const today = new Date(Date.UTC(ty, tm - 1, td))
    const oneYearAgo = new Date(today)
    oneYearAgo.setUTCDate(oneYearAgo.getUTCDate() - 364)

    const fmt = (d: Date) =>
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`

    // Align start to Monday
    const startDayOfWeek = (oneYearAgo.getUTCDay() + 6) % 7
    const startDate = new Date(oneYearAgo)
    startDate.setUTCDate(startDate.getUTCDate() - startDayOfWeek)

    const days: Array<{ date: string; amount: number; count: number; dayOfWeek: number; isCurrentYear: boolean; isToday: boolean }> = []
    const cursor = new Date(startDate)

    while (cursor <= today || days.length % 7 !== 0) {
      const dateStr = fmt(cursor)
      const entry = dataMap.get(dateStr)
      const amount = entry?.amount ?? 0
      const count = entry?.count ?? 0
      const isInRange = cursor >= oneYearAgo && cursor <= today

      days.push({
        date: dateStr,
        amount: isInRange ? amount : -1,
        count: isInRange ? count : 0,
        dayOfWeek: (cursor.getUTCDay() + 6) % 7,
        isCurrentYear: isInRange,
        isToday: dateStr === todayStr,
      })

      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }

    // Max amount from data (reflects all transactions, even if dates fall outside the grid)
    const maxAmount = data.reduce((max, d) => (d.amount > max ? d.amount : max), 0)

    // Current streak: consecutive days with activity, counting back from today
    let streak = 0
    for (let i = days.length - 1; i >= 0; i--) {
      const d = days[i]
      if (!d.isCurrentYear) continue
      if (d.count > 0) streak++
      else break
    }

    const weekLabels = ['L', '', 'Mi', '', 'V', '', '']

    const monthLabels: Array<{ label: string; weekIndex: number }> = []
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    let lastMonth = -1
    for (let i = 0; i < days.length; i += 7) {
      const [, mm, dd] = days[i].date.split('-').map(Number)
      if (mm - 1 !== lastMonth && dd <= 7) {
        monthLabels.push({ label: monthNames[mm - 1], weekIndex: i / 7 })
        lastMonth = mm - 1
      }
    }

    // Totals from raw data — resilient to date-formatting drift (a transaction
    // stored with a UTC date instead of local would otherwise disappear from counts).
    const totalCount = data.reduce((sum, d) => sum + d.count, 0)
    const totalAmount = data.reduce((sum, d) => sum + d.amount, 0)
    const activeDays = data.filter((d) => d.count > 0).length

    return {
      days,
      weekLabels,
      monthLabels,
      maxAmount,
      streakInfo: { current: streak, totalCount, totalAmount, activeDays },
    }
  }, [data, todayStr])

  function getColor(amount: number): string {
    if (amount === -1) return 'transparent'
    if (amount === 0) return 'rgb(31, 27, 54)' // surface-hover
    const intensity = Math.min(amount / Math.max(maxAmount, 1), 1)
    if (intensity < 0.25) return 'rgba(139, 92, 246, 0.2)'
    if (intensity < 0.5) return 'rgba(139, 92, 246, 0.4)'
    if (intensity < 0.75) return 'rgba(139, 92, 246, 0.65)'
    return 'rgba(139, 92, 246, 0.9)'
  }

  // Group days into 53 weeks of 7 days
  const weeks: Array<typeof days> = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const isEmpty = streakInfo.totalCount === 0

  if (isEmpty) {
    return (
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-yellow-400" />
          <h3 className="text-base font-bold text-text-primary">Gastos del año</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
          <p className="text-sm text-text-secondary max-w-sm">
            Todavía no hay gastos registrados en los últimos 365 días. Registra tu primera transacción y tu actividad aparecerá aquí.
          </p>
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-violet-600 hover:to-indigo-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Nueva transacción
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`glass-card rounded-2xl ${isCollapsed ? 'p-4' : 'p-5'}`}>
      <div className={`flex items-center justify-between flex-wrap gap-2 ${isCollapsed ? '' : 'mb-4'}`}>
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-yellow-400" />
          <h3 className="text-base font-bold text-text-primary">Gastos del año</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div>
            <span className="text-text-muted">Racha: </span>
            <span className="font-bold font-mono text-bamboo-take">{streakInfo.current} días</span>
          </div>
          <span className="text-text-muted">·</span>
          <div>
            <span className="text-text-muted">Total: </span>
            <span className="font-bold font-mono text-text-primary">{streakInfo.activeDays} días</span>
          </div>
          <button
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? 'Expandir heatmap' : 'Ocultar heatmap'}
            aria-expanded={!isCollapsed}
            className="ml-1 p-1 rounded-md hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isCollapsed ? null : (
      <>
      {/* Heatmap */}
      <div ref={scrollRef} className="overflow-x-auto">
        <div className="inline-flex gap-0.5 min-w-max">
          {/* Day labels column */}
          <div className="flex flex-col gap-0.5 pr-1 text-[9px] text-text-muted pt-4">
            {weekLabels.map((label, i) => (
              <div key={i} className="h-2.5 flex items-center justify-end pr-1">
                {label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex flex-col gap-0.5">
            {/* Month labels row */}
            <div className="flex gap-0.5 h-3 text-[9px] text-text-muted">
              {weeks.map((_, weekIdx) => {
                const monthLabel = monthLabels.find((m) => m.weekIndex === weekIdx)
                return (
                  <div key={weekIdx} className="w-2.5 relative">
                    {monthLabel && (
                      <span className="absolute left-0 whitespace-nowrap">{monthLabel.label}</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Week columns */}
            <div className="flex gap-0.5">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-0.5">
                  {week.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      onMouseEnter={() => day.isCurrentYear && setHoveredDay({ date: day.date, amount: day.amount, count: day.count })}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-2.5 h-2.5 rounded-sm transition-all hover:ring-2 hover:ring-violet-500 cursor-pointer ${day.isToday ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-transparent' : ''}`}
                      style={{ backgroundColor: getColor(day.amount) }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip / Legend */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border/50 text-xs">
        {hoveredDay ? (
          <div className="text-text-secondary">
            <span className="font-semibold">
              {new Date(hoveredDay.date + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            {hoveredDay.count > 0 ? (
              <span className="ml-2 text-text-muted">
                {hoveredDay.count} transaccion{hoveredDay.count > 1 ? 'es' : ''} · {formatCLP(hoveredDay.amount)}
              </span>
            ) : (
              <span className="ml-2 text-text-muted">sin actividad</span>
            )}
          </div>
        ) : (
          <span className="text-text-muted">{streakInfo.totalCount} transacciones en 365 días</span>
        )}
        <div className="flex items-center gap-1">
          <span className="text-text-muted">Menos</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-surface-hover" />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(139,92,246,0.2)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(139,92,246,0.4)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(139,92,246,0.65)' }} />
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(139,92,246,0.9)' }} />
          <span className="text-text-muted">Más</span>
        </div>
      </div>
      </>
      )}
    </div>
  )
}
