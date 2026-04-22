'use client'

import { useState, useEffect, useMemo } from 'react'
import { WeeklyInsight } from '@/types/database'
import { GradientButton } from '@/components/shared/GradientButton'
import {
  Sparkles, Calendar, X, TrendingUp, TrendingDown, Lightbulb,
  AlertCircle, CheckCircle, Clock, Trash2, Copy, GitCompare,
  Filter, Check,
} from 'lucide-react'
import { formatDate, formatDateShort, isCurrentWeek, getRelativeWeekLabel } from '@/lib/utils/dates'
import { toast } from 'sonner'

interface InsightsClientProps {
  insights: WeeklyInsight[]
}

interface ParsedInsight {
  resumen: string
  puntos: Array<{ tipo: 'alerta' | 'positivo' | 'sugerencia'; texto: string }>
  motivacion: string
}

type FilterType = 'all' | 'alerta' | 'positivo' | 'sugerencia'

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="45" width="8" height="12" rx="2" fill="currentColor" opacity="0.6"/>
      <rect x="20" y="35" width="8" height="22" rx="2" fill="currentColor" opacity="0.7"/>
      <rect x="32" y="25" width="8" height="32" rx="2" fill="currentColor" opacity="0.8"/>
      <rect x="44" y="15" width="8" height="42" rx="2" fill="currentColor"/>
      <path d="M50 10L54 14L50 18M46 14H54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function parseInsight(insightText: string): ParsedInsight | null {
  try {
    const parsed = JSON.parse(insightText)
    if (parsed.resumen && parsed.puntos && parsed.motivacion) {
      return parsed
    }
  } catch {
    // Fallback silencioso
  }
  return null
}

function InsightSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-violet-500/20" />
        <div className="w-32 h-3 rounded-full bg-surface-border" />
        <div className="ml-auto w-20 h-4 rounded-full bg-surface-border" />
      </div>
      <div className="w-3/4 h-4 rounded-full bg-surface-border" />
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-vermillion-shu/5">
          <div className="w-4 h-4 rounded-full bg-vermillion-shu/30" />
          <div className="flex-1 h-3 rounded-full bg-surface-border" />
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-bamboo-take/5">
          <div className="w-4 h-4 rounded-full bg-bamboo-take/30" />
          <div className="flex-1 h-3 rounded-full bg-surface-border" />
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-500/5">
          <div className="w-4 h-4 rounded-full bg-violet-500/30" />
          <div className="flex-1 h-3 rounded-full bg-surface-border" />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-surface-border/50">
        <div className="w-5 h-5 rounded bg-surface-border" />
        <div className="flex-1 h-3 rounded-full bg-surface-border" />
      </div>
    </div>
  )
}

function InsightsEmptyState({ onGenerate, isGenerating }: { onGenerate: () => void; isGenerating: boolean }) {
  return (
    <div className="space-y-12">
      <div
        className="border-2 border-dashed border-violet-500/25 rounded-2xl p-12 md:p-16 text-center min-h-[400px] flex items-center justify-center flex-col gap-4"
        style={{ backgroundColor: 'rgba(15,10,30,0.4)' }}
      >
        <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-2">
          <ChartIcon className="w-16 h-16 text-violet-300 mx-auto" />
        </div>

        <h3 className="text-xl font-bold text-text-primary">Tu primer análisis te espera</h3>

        <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
          Katana analiza tus gastos de la semana y te da recomendaciones personalizadas. Solo toma unos segundos.
        </p>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-violet-500 to-indigo-600 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          {isGenerating ? 'Generando análisis...' : '✦ Generar mi primer insight'}
        </button>

        <p className="text-xs text-text-muted mt-3">Análisis generado por Gemini AI · Gratis</p>
      </div>
    </div>
  )
}

function LunesBanner({ onGenerate, onDismiss, isGenerating }: {
  onGenerate: () => void
  onDismiss: () => void
  isGenerating: boolean
}) {
  return (
    <div className="glass-card bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-violet-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Es lunes ✦ Tu análisis semanal está listo para generar</p>
            <p className="text-xs text-text-muted">Descubre cómo evolucionaron tus hábitos financieros</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold rounded-full hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isGenerating ? 'Generando...' : 'Generar ahora'}
          </button>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function InsightsStats({ insights }: { insights: WeeklyInsight[] }) {
  const totalInsights = insights.length
  const semanaConMenosGasto = insights.reduce<WeeklyInsight | null>((min, insight) => {
    if (insight.spending_data && typeof insight.spending_data === 'object') {
      const data = insight.spending_data as { thisWeek: number }
      const currentMin = min?.spending_data as { thisWeek: number } | null
      if (!currentMin || data.thisWeek < currentMin.thisWeek) {
        return insight
      }
    }
    return min
  }, null)

  // Calcular racha
  let racha = 0
  for (let i = 0; i < insights.length - 1; i++) {
    const current = new Date(insights[i].week_start)
    const next = new Date(insights[i + 1].week_start)
    const diffDays = Math.abs(current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays <= 7) {
      racha++
    } else {
      break
    }
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="glass-card rounded-xl p-4 text-center">
        <div className="text-2xl font-bold font-mono text-violet-light mb-1">{totalInsights}</div>
        <div className="text-xs text-text-muted">insights generados</div>
      </div>
      <div className="glass-card rounded-xl p-4 text-center">
        <div className="text-2xl font-bold font-mono text-bamboo-take mb-1">
          {semanaConMenosGasto ? formatDateShort(semanaConMenosGasto.week_start) : '--'}
        </div>
        <div className="text-xs text-text-muted">mejor semana</div>
      </div>
      <div className="glass-card rounded-xl p-4 text-center">
        <div className="text-2xl font-bold font-mono text-violet-light mb-1">{racha + 1}</div>
        <div className="text-xs text-text-muted">racha semanas</div>
      </div>
    </div>
  )
}

interface InsightCardProps {
  insight: WeeklyInsight
  isLatest: boolean
  isCompareMode: boolean
  isSelectedForCompare: boolean
  onDelete: (id: string) => void
  onCopy: (insight: WeeklyInsight) => void
  onToggleCompare: (id: string) => void
  filterType: FilterType
}

function InsightCard({
  insight,
  isLatest,
  isCompareMode,
  isSelectedForCompare,
  onDelete,
  onCopy,
  onToggleCompare,
  filterType,
}: InsightCardProps) {
  const parsedInsight = parseInsight(insight.insight_text)
  const relativeLabel = getRelativeWeekLabel(insight.week_start)
  const hasThisWeekData = insight.spending_data && typeof insight.spending_data === 'object'
  const spendingData = hasThisWeekData ? insight.spending_data as { thisWeek: number; lastWeek: number } : null

  const getBadge = () => {
    if (!spendingData) return null
    const gastasteMenos = spendingData.thisWeek < spendingData.lastWeek
    return gastasteMenos ?
      { text: '↓ Mejor semana', color: 'bg-bamboo-take/10 text-bamboo-take border-bamboo-take/30' } :
      { text: '↑ Más gasto', color: 'bg-vermillion-shu/10 text-vermillion-shu border-vermillion-shu/30' }
  }

  const badge = getBadge()

  const getPuntoIcon = (tipo: string) => {
    switch (tipo) {
      case 'alerta': return <AlertCircle className="h-4 w-4 text-vermillion-shu flex-shrink-0" />
      case 'positivo': return <CheckCircle className="h-4 w-4 text-bamboo-take flex-shrink-0" />
      case 'sugerencia': return <Lightbulb className="h-4 w-4 text-violet-light flex-shrink-0" />
      default: return <div className="h-2 w-2 rounded-full bg-text-muted" />
    }
  }

  const getPuntoColor = (tipo: string) => {
    switch (tipo) {
      case 'alerta': return 'bg-vermillion-shu/5 border-vermillion-shu/20 text-vermillion-shu'
      case 'positivo': return 'bg-bamboo-take/5 border-bamboo-take/20 text-bamboo-take'
      case 'sugerencia': return 'bg-violet-500/5 border-violet-500/20 text-violet-light'
      default: return 'bg-surface-secondary border-surface-border text-text-secondary'
    }
  }

  // Filter puntos if filter is active
  const puntosFiltrados = parsedInsight
    ? filterType === 'all'
      ? parsedInsight.puntos
      : parsedInsight.puntos.filter((p) => p.tipo === filterType)
    : []

  return (
    <div
      className={`relative glass-card rounded-2xl p-4 md:p-6 transition-all duration-200 group ${
        !isLatest ? 'opacity-90' : ''
      } ${isSelectedForCompare ? 'ring-2 ring-violet-500 shadow-xl' : 'hover:shadow-lg'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-bold text-text-primary">
              ✦ Semana {formatDate(insight.week_start).split(' de ')[0]} - {formatDate(insight.week_end).split(' de ')[0]} de {formatDate(insight.week_start).split(', ')[1]}
            </h3>
            {badge && (
              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${badge.color}`}>
                {badge.text}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-text-tertiary">
            <Calendar className="h-3 w-3" />
            {relativeLabel}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isCompareMode ? (
            <button
              onClick={() => onToggleCompare(insight.id)}
              className={`p-2 rounded-lg transition-all ${
                isSelectedForCompare
                  ? 'bg-violet-500 text-white'
                  : 'bg-surface-secondary border border-surface-border text-text-muted hover:border-violet-500/30'
              }`}
              title={isSelectedForCompare ? 'Deseleccionar' : 'Seleccionar para comparar'}
            >
              {isSelectedForCompare ? <Check className="h-3.5 w-3.5" /> : <GitCompare className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onCopy(insight)}
                className="p-1.5 rounded-lg text-text-muted hover:text-violet-light hover:bg-violet-500/10 transition-colors"
                title="Copiar al portapapeles"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(insight.id)}
                className="p-1.5 rounded-lg text-text-muted hover:text-vermillion-shu hover:bg-vermillion-shu/10 transition-colors"
                title="Eliminar insight"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-surface-border/50 mb-4" />

      {parsedInsight ? (
        <>
          {/* Resumen */}
          <p className="text-base font-medium text-text-primary mb-4 leading-relaxed">
            &ldquo;{parsedInsight.resumen}&rdquo;
          </p>

          {/* Puntos filtrados */}
          {puntosFiltrados.length > 0 ? (
            <div className="space-y-2 mb-4">
              {puntosFiltrados.map((punto, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${getPuntoColor(punto.tipo)}`}>
                  {getPuntoIcon(punto.tipo)}
                  <p className="text-sm">{punto.texto}</p>
                </div>
              ))}
            </div>
          ) : filterType !== 'all' ? (
            <p className="text-xs text-text-muted italic py-2">
              No hay puntos de tipo &ldquo;{filterType}&rdquo; en este insight
            </p>
          ) : null}

          <div className="border-t border-surface-border/50 mb-4" />

          {/* Motivación */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="text-lg flex-shrink-0">💬</div>
              <p className="text-sm font-medium text-text-secondary italic">
                &ldquo;{parsedInsight.motivacion}&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-muted flex-shrink-0">
              <Clock className="h-3 w-3" />
              <span>Gemini AI</span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-text-secondary leading-relaxed">{insight.insight_text}</p>
      )}
    </div>
  )
}

function CompareModal({ insights, onClose }: { insights: WeeklyInsight[]; onClose: () => void }) {
  if (insights.length !== 2) return null

  const [a, b] = insights.sort((x, y) => x.week_start.localeCompare(y.week_start))
  const parsedA = parseInsight(a.insight_text)
  const parsedB = parseInsight(b.insight_text)

  const dataA = a.spending_data as { thisWeek: number } | null
  const dataB = b.spending_data as { thisWeek: number } | null
  const diff = dataA && dataB ? dataB.thisWeek - dataA.thisWeek : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface-primary border border-surface-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-border sticky top-0 bg-surface-primary z-10">
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-violet-light" />
            <h2 className="text-lg font-bold text-text-primary">Comparar semanas</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          {/* Diff summary */}
          {diff !== null && (
            <div className={`mb-5 p-4 rounded-xl border ${
              diff <= 0
                ? 'bg-bamboo-take/10 border-bamboo-take/30 text-bamboo-take'
                : 'bg-vermillion-shu/10 border-vermillion-shu/30 text-vermillion-shu'
            }`}>
              <div className="flex items-center gap-2 justify-center">
                {diff <= 0 ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                <p className="text-sm font-semibold">
                  {diff <= 0
                    ? `Gastaste ${Math.abs(Math.round((diff / (dataA?.thisWeek || 1)) * 100))}% menos en la semana más reciente`
                    : `Gastaste ${Math.round((diff / (dataA?.thisWeek || 1)) * 100)}% más en la semana más reciente`}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[{ insight: a, parsed: parsedA, label: 'Semana anterior' }, { insight: b, parsed: parsedB, label: 'Semana más reciente' }].map(
              ({ insight, parsed, label }, i) => (
                <div key={i} className="space-y-3">
                  <div className="text-xs text-text-muted uppercase tracking-wide font-semibold">{label}</div>
                  <div className="glass-card rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-bold text-text-primary">
                      {formatDate(insight.week_start).split(' de ')[0]} - {formatDate(insight.week_end).split(' de ')[0]}
                    </h4>
                    {parsed ? (
                      <>
                        <p className="text-sm text-text-primary italic">
                          &ldquo;{parsed.resumen}&rdquo;
                        </p>
                        <div className="space-y-1.5">
                          {parsed.puntos.map((p, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <span className="flex-shrink-0">
                                {p.tipo === 'alerta' && '🔴'}
                                {p.tipo === 'positivo' && '🟢'}
                                {p.tipo === 'sugerencia' && '🟣'}
                              </span>
                              <span className="text-text-secondary">{p.texto}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-text-muted italic pt-2 border-t border-surface-border/50">
                          &ldquo;{parsed.motivacion}&rdquo;
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-text-secondary">{insight.insight_text}</p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function InsightsClient({ insights: initialInsights }: InsightsClientProps) {
  const [insights, setInsights] = useState(initialInsights)
  const [generating, setGenerating] = useState(false)
  const [showLunesBanner, setShowLunesBanner] = useState(false)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set())
  const [showCompareModal, setShowCompareModal] = useState(false)

  useEffect(() => {
    const hoyEsLunes = new Date().getDay() === 1
    const hayInsightEstaSemana = insights[0] && isCurrentWeek(insights[0].week_start)

    if (hoyEsLunes && !hayInsightEstaSemana && insights.length > 0) {
      setShowLunesBanner(true)
    }
  }, [insights])

  // Group insights by month
  const insightsByMonth = useMemo(() => {
    const groups = new Map<string, WeeklyInsight[]>()
    for (const insight of insights) {
      const date = new Date(insight.week_start + 'T12:00:00')
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!groups.has(monthKey)) groups.set(monthKey, [])
      groups.get(monthKey)!.push(insight)
    }
    return Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a))
  }, [insights])

  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

  const formatMonthLabel = (monthKey: string) => {
    const [year, m] = monthKey.split('-')
    const monthName = months[parseInt(m, 10) - 1]
    return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${year}`
  }

  async function generateInsight() {
    setGenerating(true)
    try {
      const res = await fetch('/api/insights/generate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al generar')
      setInsights((prev) => [data.insight, ...prev])
      setShowLunesBanner(false)
      toast.success('Insight generado ✨')
    } catch (err) {
      toast.error('Error', { description: (err as Error).message })
    } finally {
      setGenerating(false)
    }
  }

  async function deleteInsight(id: string) {
    if (!confirm('¿Eliminar este insight? No podrás recuperarlo.')) return

    try {
      const res = await fetch(`/api/insights/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      setInsights((prev) => prev.filter((i) => i.id !== id))
      toast.success('Insight eliminado')
    } catch (err) {
      toast.error('Error al eliminar')
    }
  }

  function copyInsight(insight: WeeklyInsight) {
    const parsed = parseInsight(insight.insight_text)
    const weekLabel = `${formatDate(insight.week_start).split(' de ')[0]} - ${formatDate(insight.week_end).split(' de ')[0]}`

    let text = `✦ Insight - Semana ${weekLabel}\n\n`
    if (parsed) {
      text += `"${parsed.resumen}"\n\n`
      for (const p of parsed.puntos) {
        const emoji = p.tipo === 'alerta' ? '🔴' : p.tipo === 'positivo' ? '🟢' : '🟣'
        text += `${emoji} ${p.texto}\n`
      }
      text += `\n💬 "${parsed.motivacion}"\n\n— Gemini AI`
    } else {
      text += insight.insight_text
    }

    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles ✓')
  }

  function toggleCompareSelection(id: string) {
    setSelectedForCompare((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (next.size >= 2) {
          toast.info('Solo puedes comparar 2 insights a la vez')
          return prev
        }
        next.add(id)
      }
      return next
    })
  }

  function startCompare() {
    if (selectedForCompare.size !== 2) {
      toast.info('Selecciona 2 insights para comparar')
      return
    }
    setShowCompareModal(true)
  }

  function cancelCompare() {
    setCompareMode(false)
    setSelectedForCompare(new Set())
  }

  const compareInsights = insights.filter((i) => selectedForCompare.has(i.id))

  return (
    <div className="space-y-6">
      {/* Stats */}
      {insights.length > 0 && <InsightsStats insights={insights} />}

      {/* Banner de lunes */}
      {showLunesBanner && (
        <LunesBanner
          onGenerate={generateInsight}
          onDismiss={() => setShowLunesBanner(false)}
          isGenerating={generating}
        />
      )}

      {/* Actions bar */}
      {insights.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filters */}
          <div className="flex items-center gap-1 bg-surface-secondary border border-surface-border rounded-full p-1">
            {[
              { key: 'all', label: 'Todos', icon: Filter },
              { key: 'alerta', label: 'Alertas', icon: AlertCircle },
              { key: 'positivo', label: 'Positivos', icon: CheckCircle },
              { key: 'sugerencia', label: 'Sugerencias', icon: Lightbulb },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilterType(key as FilterType)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  filterType === key
                    ? 'bg-violet-500/20 text-violet-light'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Compare mode */}
          {insights.length >= 2 && (
            <>
              {!compareMode ? (
                <button
                  onClick={() => setCompareMode(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-secondary border border-surface-border text-text-secondary text-xs font-semibold hover:border-violet-500/30 hover:text-text-primary transition-all"
                >
                  <GitCompare className="h-3.5 w-3.5" />
                  Comparar semanas
                </button>
              ) : (
                <>
                  <button
                    onClick={startCompare}
                    disabled={selectedForCompare.size !== 2}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Comparar ({selectedForCompare.size}/2)
                  </button>
                  <button
                    onClick={cancelCompare}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-secondary border border-surface-border text-text-secondary text-xs font-semibold hover:text-text-primary transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancelar
                  </button>
                </>
              )}
            </>
          )}

          {/* Generate button */}
          <GradientButton onClick={generateInsight} loading={generating} size="sm" className="ml-auto">
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generando...' : 'Generar de esta semana'}
          </GradientButton>
        </div>
      )}

      {/* Loading skeleton during generation */}
      {generating && insights.length > 0 && <InsightSkeleton />}

      {/* Main content */}
      {insights.length === 0 && !generating ? (
        <InsightsEmptyState onGenerate={generateInsight} isGenerating={generating} />
      ) : insights.length === 0 && generating ? (
        <div className="space-y-4">
          <InsightSkeleton />
          <InsightSkeleton />
        </div>
      ) : (
        <div className="space-y-8">
          {insightsByMonth.map(([monthKey, monthInsights]) => (
            <div key={monthKey} className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-[0.15em]">
                  {formatMonthLabel(monthKey)}
                </h3>
                <div className="flex-1 h-px bg-surface-border/50" />
                <span className="text-xs text-text-muted">
                  {monthInsights.length} {monthInsights.length === 1 ? 'semana' : 'semanas'}
                </span>
              </div>

              <div className="space-y-4">
                {monthInsights.map((insight, index) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    isLatest={insights.indexOf(insight) === 0}
                    isCompareMode={compareMode}
                    isSelectedForCompare={selectedForCompare.has(insight.id)}
                    onDelete={deleteInsight}
                    onCopy={copyInsight}
                    onToggleCompare={toggleCompareSelection}
                    filterType={filterType}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compare modal */}
      {showCompareModal && (
        <CompareModal
          insights={compareInsights}
          onClose={() => {
            setShowCompareModal(false)
            cancelCompare()
          }}
        />
      )}
    </div>
  )
}
