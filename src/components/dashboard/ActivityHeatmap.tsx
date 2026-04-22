'use client'

import { useMemo, useState } from 'react'
import { formatCLP } from '@/lib/utils/currency'
import { Flame } from 'lucide-react'

interface ActivityHeatmapProps {
  data: Array<{ date: string; amount: number; count: number }>
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; amount: number; count: number } | null>(null)

  const { days, weekLabels, monthLabels, maxAmount, streakInfo } = useMemo(() => {
    // Build a map from date to data
    const dataMap = new Map(data.map((d) => [d.date, d]))

    // Generate last 365 days
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const oneYearAgo = new Date(today)
    oneYearAgo.setDate(oneYearAgo.getDate() - 364)

    // Align to Monday (start week)
    const startDayOfWeek = (oneYearAgo.getDay() + 6) % 7
    const startDate = new Date(oneYearAgo)
    startDate.setDate(startDate.getDate() - startDayOfWeek)

    const days: Array<{ date: string; amount: number; count: number; dayOfWeek: number; isCurrentYear: boolean }> = []
    const cursor = new Date(startDate)
    let maxAmount = 0

    // Build 53 weeks * 7 days grid
    while (cursor <= today || days.length % 7 !== 0) {
      const dateStr = cursor.toISOString().split('T')[0]
      const entry = dataMap.get(dateStr)
      const amount = entry?.amount ?? 0
      const count = entry?.count ?? 0
      const isInRange = cursor >= oneYearAgo && cursor <= today

      days.push({
        date: dateStr,
        amount: isInRange ? amount : -1, // -1 means "out of range"
        count: isInRange ? count : 0,
        dayOfWeek: (cursor.getDay() + 6) % 7,
        isCurrentYear: isInRange,
      })

      if (amount > maxAmount) maxAmount = amount
      cursor.setDate(cursor.getDate() + 1)
    }

    // Calculate streak (consecutive days with activity ending today)
    let streak = 0
    let longestStreak = 0
    let currentStreak = 0
    const reversed = [...days].reverse()
    for (let i = 0; i < reversed.length; i++) {
      const d = reversed[i]
      if (!d.isCurrentYear) continue
      if (d.count > 0) {
        currentStreak++
        if (i === 0 || (i > 0 && reversed[i - 1].count > 0)) {
          if (i < 90) streak = currentStreak // current streak
        }
        if (currentStreak > longestStreak) longestStreak = currentStreak
      } else {
        if (streak === 0 || i === 0) currentStreak = 0
        currentStreak = 0
      }
    }

    // Simpler streak calculation: consecutive days from today backwards
    streak = 0
    for (let i = reversed.length - 1; i >= 0; i--) {
      // iterating reverse-of-reverse = forward again, so pick from end
    }
    // Actually use the simple reverse approach
    streak = 0
    let daysToday = [...days].reverse().filter((d) => d.isCurrentYear)
    for (const d of daysToday) {
      if (d.count > 0) streak++
      else break
    }

    // Week labels (Mon, Wed, Fri)
    const weekLabels = ['L', '', 'M', '', 'V', '', '']

    // Month labels: at start of each month
    const monthLabels: Array<{ label: string; weekIndex: number }> = []
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    let lastMonth = -1
    for (let i = 0; i < days.length; i += 7) {
      const d = new Date(days[i].date + 'T12:00:00')
      if (d.getMonth() !== lastMonth && d.getDate() <= 7) {
        monthLabels.push({ label: monthNames[d.getMonth()], weekIndex: i / 7 })
        lastMonth = d.getMonth()
      }
    }

    // Total transactions last year
    const totalCount = days.filter((d) => d.isCurrentYear).reduce((sum, d) => sum + d.count, 0)
    const totalAmount = days.filter((d) => d.isCurrentYear).reduce((sum, d) => sum + d.amount, 0)
    const activeDays = days.filter((d) => d.isCurrentYear && d.count > 0).length

    return {
      days,
      weekLabels,
      monthLabels,
      maxAmount,
      streakInfo: { current: streak, longest: longestStreak, totalCount, totalAmount, activeDays },
    }
  }, [data])

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

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-yellow-400" />
          <h3 className="text-base font-bold text-text-primary">Actividad del año</h3>
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
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
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
                      className="w-2.5 h-2.5 rounded-sm transition-all hover:ring-2 hover:ring-violet-500 cursor-pointer"
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
    </div>
  )
}
