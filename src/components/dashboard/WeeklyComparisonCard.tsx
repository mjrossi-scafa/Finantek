'use client'

import { useMemo } from 'react'
import { formatCLP } from '@/lib/utils/currency'
import { WeeklyComparisonData, DAY_NAMES } from '@/lib/utils/weeklyComparison'
import { TrendingUp, TrendingDown, Minus, Calendar, AlertCircle, CheckCircle } from 'lucide-react'

interface Props {
  data: WeeklyComparisonData
  isHidden?: boolean
}

export function WeeklyComparisonCard({ data, isHidden = false }: Props) {
  const { thisWeek, lastWeek, diff, diffPct, categoryDiffs, bestDay, worstDay } = data

  const isIncrease = diff > 0
  const isDecrease = diff < 0
  const isFlat = diff === 0

  // Split category diffs into top increases and decreases
  const { topIncreases, topDecreases } = useMemo(() => {
    const increases = categoryDiffs.filter((c) => c.diff > 0).slice(0, 3)
    const decreases = categoryDiffs.filter((c) => c.diff < 0).slice(0, 3)
    return { topIncreases: increases, topDecreases: decreases }
  }, [categoryDiffs])

  // Max value for day chart scale
  const maxDay = Math.max(...thisWeek.byDay, ...lastWeek.byDay, 1)

  // Hide helper
  const fmt = (n: number) => (isHidden ? '•••••' : formatCLP(n))

  return (
    <div className="glass-card rounded-2xl p-5 space-y-5">
      {/* Header + Hero */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-violet-light" />
          <h3 className="text-base font-bold text-text-primary">Comparación semanal</h3>
          <span className="text-xs text-text-muted ml-auto">Semana actual vs anterior</span>
        </div>

        {/* Hero stats */}
        <div className="relative rounded-xl p-4 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/20">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Esta semana</p>
              <p className="text-3xl font-black font-mono text-text-primary">{fmt(thisWeek.total)}</p>
              <p className="text-xs text-text-muted mt-1">vs {fmt(lastWeek.total)} la anterior</p>
            </div>
            <div className="text-right">
              {diffPct !== null ? (
                <>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono font-bold text-sm ${
                      isIncrease
                        ? 'bg-vermillion-shu/10 border border-vermillion-shu/30 text-vermillion-shu'
                        : isDecrease
                          ? 'bg-bamboo-take/10 border border-bamboo-take/30 text-bamboo-take'
                          : 'bg-text-muted/10 border border-text-muted/30 text-text-muted'
                    }`}
                  >
                    {isIncrease ? <TrendingUp className="h-4 w-4" /> : isDecrease ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    {diff >= 0 ? '+' : ''}{diffPct}%
                  </div>
                  <p className={`text-xs mt-1.5 font-mono ${
                    isIncrease ? 'text-vermillion-shu' : isDecrease ? 'text-bamboo-take' : 'text-text-muted'
                  }`}>
                    {diff >= 0 ? '+' : '-'}{fmt(Math.abs(diff))}
                  </p>
                </>
              ) : (
                <span className="text-xs text-text-muted italic">Sin datos suficientes</span>
              )}
            </div>
          </div>

          {/* Contextual message */}
          {diffPct !== null && (
            <p className="text-xs text-text-secondary mt-3 pt-3 border-t border-surface-border/50">
              {isIncrease && Math.abs(diffPct) >= 20 && `⚠️ Gastaste ${Math.abs(diffPct)}% más que la semana pasada`}
              {isIncrease && Math.abs(diffPct) < 20 && `📈 Un poco más que la semana pasada`}
              {isDecrease && Math.abs(diffPct) >= 20 && `🎯 Excelente disciplina, ${Math.abs(diffPct)}% menos de gasto`}
              {isDecrease && Math.abs(diffPct) < 20 && `✓ Vas mejor que la semana anterior`}
              {isFlat && `➖ Patrón estable con la semana pasada`}
            </p>
          )}
        </div>
      </div>

      {/* Daily line chart */}
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wide mb-3">Gasto diario</p>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {DAY_NAMES.map((dayName, i) => {
            const thisAmt = thisWeek.byDay[i]
            const lastAmt = lastWeek.byDay[i]
            const thisPct = (thisAmt / maxDay) * 100
            const lastPct = (lastAmt / maxDay) * 100
            const today = new Date()
            const todayIdx = (today.getDay() + 6) % 7
            const isCurrentDay = i === todayIdx
            const isFuture = i > todayIdx

            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                {/* Bars container - explicit height */}
                <div className="w-full h-24 flex items-end gap-0.5">
                  {/* Last week (gray) */}
                  <div
                    className="flex-1 bg-surface-border rounded-t transition-all group relative min-h-[2px]"
                    style={{ height: `${Math.max(lastPct, 2)}%` }}
                  >
                    {lastAmt > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-surface-primary border border-surface-border rounded-lg px-2 py-1 text-[10px] text-text-muted z-10">
                        {fmt(lastAmt)}
                      </div>
                    )}
                  </div>
                  {/* This week (violet or muted if future) */}
                  <div
                    className={`flex-1 rounded-t transition-all group relative min-h-[2px] ${
                      isFuture ? 'bg-violet-500/10' : 'bg-gradient-to-t from-violet-600 to-violet-400'
                    }`}
                    style={{ height: `${Math.max(thisPct, 2)}%` }}
                  >
                    {thisAmt > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-surface-primary border border-violet-500/40 rounded-lg px-2 py-1 text-[10px] text-violet-light z-10">
                        {fmt(thisAmt)}
                      </div>
                    )}
                  </div>
                </div>
                {/* Day label */}
                <span className={`text-[10px] font-medium ${isCurrentDay ? 'text-violet-light font-bold' : 'text-text-muted'}`}>
                  {dayName}
                </span>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded bg-gradient-to-t from-violet-600 to-violet-400" />
            <span className="text-text-secondary">Esta semana</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded bg-surface-border" />
            <span className="text-text-secondary">Anterior</span>
          </div>
          {bestDay && worstDay && (
            <div className="w-full md:w-auto md:ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-text-muted">
              <span className="whitespace-nowrap" title={`Menor gasto del ${bestDay.dayName}`}>
                🏆 Menor: <span className="text-bamboo-take font-mono">{bestDay.dayName}</span>
              </span>
              <span className="whitespace-nowrap" title={`Mayor gasto del ${worstDay.dayName}`}>
                💥 Mayor: <span className="text-vermillion-shu font-mono">{worstDay.dayName}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Category diffs */}
      {(topIncreases.length > 0 || topDecreases.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-surface-border/50">
          {/* Subieron */}
          {topIncreases.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle className="h-3.5 w-3.5 text-vermillion-shu" />
                <p className="text-xs font-semibold text-vermillion-shu uppercase tracking-wide">Subieron</p>
              </div>
              <div className="space-y-1.5">
                {topIncreases.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-vermillion-shu/5 border border-vermillion-shu/20">
                    <span className="text-sm">{c.icon}</span>
                    <span className="flex-1 text-xs text-text-primary font-medium truncate">{c.name}</span>
                    <span className="text-xs font-mono font-bold text-vermillion-shu">
                      +{c.diffPct}%
                    </span>
                    <span className="text-[10px] font-mono text-text-muted whitespace-nowrap">
                      (+{fmt(c.diff)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bajaron */}
          {topDecreases.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle className="h-3.5 w-3.5 text-bamboo-take" />
                <p className="text-xs font-semibold text-bamboo-take uppercase tracking-wide">Bajaron</p>
              </div>
              <div className="space-y-1.5">
                {topDecreases.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-bamboo-take/5 border border-bamboo-take/20">
                    <span className="text-sm">{c.icon}</span>
                    <span className="flex-1 text-xs text-text-primary font-medium truncate">{c.name}</span>
                    <span className="text-xs font-mono font-bold text-bamboo-take">
                      {c.diffPct}%
                    </span>
                    <span className="text-[10px] font-mono text-text-muted whitespace-nowrap">
                      ({fmt(c.diff)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
