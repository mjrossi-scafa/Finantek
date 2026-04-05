'use client'

import { useState, useEffect } from 'react'
import { WeeklyInsight } from '@/types/database'
import { GradientButton } from '@/components/shared/GradientButton'
import { Sparkles, Calendar, X, TrendingUp, TrendingDown, BarChart3, Lightbulb, AlertCircle, CheckCircle, Clock } from 'lucide-react'
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

// SVG Gráfico de barras subiendo
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

function InsightsEmptyState({ onGenerate, isGenerating }: { onGenerate: () => void; isGenerating: boolean }) {
  return (
    <div className="space-y-12">
      {/* Empty State Principal */}
      <div
        className="border-2 border-dashed border-purple-500/25 rounded-2xl p-16 text-center min-h-[400px] flex items-center justify-center flex-col gap-4"
        style={{ backgroundColor: '#0F0A1E' }}
      >
        {/* Ícono con fondo sutil */}
        <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-2">
          <ChartIcon className="w-20 h-20 text-purple-400 mx-auto" />
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-text-primary">Tu primer análisis te espera</h3>

        {/* Descripción */}
        <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
          Katana analiza tus gastos de la semana y te da recomendaciones personalizadas. Solo toma unos segundos.
        </p>

        {/* Botón principal */}
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="px-8 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {isGenerating ? 'Generando análisis...' : '✦ Generar mi primer insight'}
        </button>

        {/* Texto inferior */}
        <p className="text-xs text-gray-500 mt-3">Análisis generado por Claude AI · Gratis</p>
      </div>

      {/* Sección Preview */}
      <div className="space-y-6">
        {/* Título con líneas */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-600"></div>
          <h4 className="text-sm text-gray-500 whitespace-nowrap">Así lucirá tu análisis</h4>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-600"></div>
        </div>

        {/* Cards Preview */}
        <div className="space-y-6 opacity-40 pointer-events-none" style={{
          maskImage: 'linear-gradient(to bottom, black 60%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent)'
        }}>
          {/* Card Preview 1 */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white/10"></div>
                <div className="w-24 h-3 rounded-full bg-white/10"></div>
              </div>
              <div className="w-16 h-4 rounded-full bg-white/10"></div>
            </div>

            <div className="border-t border-white/5 mb-4"></div>

            <div className="w-3/4 h-4 rounded-full bg-white/10 mb-4"></div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400/60 mt-1"></div>
                <div className="w-48 h-3 rounded-full bg-white/10"></div>
              </div>
              <div className="border-b border-white/5"></div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400/60 mt-1"></div>
                <div className="w-40 h-3 rounded-full bg-white/10"></div>
              </div>
              <div className="border-b border-white/5"></div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400/60 mt-1"></div>
                <div className="w-44 h-3 rounded-full bg-white/10"></div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3">
              <div className="flex items-center justify-between">
                <div className="w-32 h-3 rounded-full bg-white/10"></div>
                <div className="w-20 h-2 rounded-full bg-white/10"></div>
              </div>
            </div>
          </div>

          {/* Card Preview 2 */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white/10"></div>
                <div className="w-28 h-3 rounded-full bg-white/10"></div>
              </div>
              <div className="w-20 h-4 rounded-full bg-white/10"></div>
            </div>

            <div className="border-t border-white/5 mb-4"></div>

            <div className="w-2/3 h-4 rounded-full bg-white/10 mb-4"></div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400/60 mt-1"></div>
                <div className="w-52 h-3 rounded-full bg-white/10"></div>
              </div>
              <div className="border-b border-white/5"></div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400/60 mt-1"></div>
                <div className="w-36 h-3 rounded-full bg-white/10"></div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3">
              <div className="flex items-center justify-between">
                <div className="w-28 h-3 rounded-full bg-white/10"></div>
                <div className="w-24 h-2 rounded-full bg-white/10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LunesBanner({ onGenerate, onDismiss, isGenerating }: {
  onGenerate: () => void;
  onDismiss: () => void;
  isGenerating: boolean;
}) {
  return (
    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-purple-900">Es lunes ✦ Tu análisis semanal está listo para generar</p>
            <p className="text-xs text-purple-700">Descubre cómo evolucionaron tus hábitos financieros</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Generando...' : 'Generar ahora'}
          </button>
          <button onClick={onDismiss} className="text-purple-600 hover:text-purple-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function InsightsStats({ insights }: { insights: WeeklyInsight[] }) {
  const totalInsights = insights.length
  const semanaConMenosGasto = insights.reduce((min, insight) => {
    if (insight.spending_data && typeof insight.spending_data === 'object') {
      const data = insight.spending_data as { thisWeek: number }
      const currentMin = min.spending_data as { thisWeek: number } | null
      if (!currentMin || data.thisWeek < currentMin.thisWeek) {
        return insight
      }
    }
    return min
  }, insights[0])

  // Calcular racha de semanas consecutivas
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="glass-card rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-indigo-600 mb-1">{totalInsights}</div>
        <div className="text-xs text-text-muted">insights generados</div>
      </div>
      <div className="glass-card rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-green-600 mb-1">
          {semanaConMenosGasto ? formatDateShort(semanaConMenosGasto.week_start) : '--'}
        </div>
        <div className="text-xs text-text-muted">mejor semana</div>
      </div>
      <div className="glass-card rounded-xl p-4 text-center">
        <div className="text-2xl font-bold text-purple-600 mb-1">{racha + 1}</div>
        <div className="text-xs text-text-muted">racha semanas</div>
      </div>
    </div>
  )
}

function InsightCard({ insight, isLatest, index }: { insight: WeeklyInsight; isLatest: boolean; index: number }) {
  const parsedInsight = parseInsight(insight.insight_text)
  const relativeLabel = getRelativeWeekLabel(insight.week_start)
  const hasThisWeekData = insight.spending_data && typeof insight.spending_data === 'object'
  const spendingData = hasThisWeekData ? insight.spending_data as { thisWeek: number; lastWeek: number } : null

  const getBadge = () => {
    if (!spendingData) return null
    const gastasteMenos = spendingData.thisWeek < spendingData.lastWeek
    return gastasteMenos ?
      { text: '↓ Mejor semana', color: 'bg-green-500/10 text-green-700 border-green-500/20' } :
      { text: '↑ Más gasto', color: 'bg-red-500/10 text-red-700 border-red-500/20' }
  }

  const badge = getBadge()

  const getPuntoIcon = (tipo: string) => {
    switch (tipo) {
      case 'alerta': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'positivo': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'sugerencia': return <Lightbulb className="h-4 w-4 text-purple-500" />
      default: return <div className="h-2 w-2 rounded-full bg-gray-400" />
    }
  }

  const getPuntoColor = (tipo: string) => {
    switch (tipo) {
      case 'alerta': return 'text-red-700 bg-red-50 border-red-200'
      case 'positivo': return 'text-green-700 bg-green-50 border-green-200'
      case 'sugerencia': return 'text-purple-700 bg-purple-50 border-purple-200'
      default: return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`relative glass-card rounded-2xl p-4 md:p-6 transition-all duration-200 hover:shadow-lg ${!isLatest ? 'opacity-80' : ''}`}>
      {/* Timeline connector */}
      {index > 0 && (
        <div className="absolute -top-4 left-6 w-px h-4 bg-purple-200"></div>
      )}

      {/* Timeline dot */}
      <div className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-purple-500 border-4 border-white shadow-lg flex items-center justify-center">
        <Sparkles className="h-3 w-3 text-white" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 ml-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
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
      </div>

      <div className="ml-4">
        {/* Divider */}
        <div className="border-t border-surface-border/50 mb-4"></div>

        {parsedInsight ? (
          <>
            {/* Resumen */}
            <p className="text-base font-medium text-text-primary mb-4 leading-relaxed">
              "{parsedInsight.resumen}"
            </p>

            {/* Puntos */}
            <div className="space-y-3 mb-4">
              {parsedInsight.puntos.map((punto, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${getPuntoColor(punto.tipo)}`}>
                  {getPuntoIcon(punto.tipo)}
                  <p className="text-sm">{punto.texto}</p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-surface-border/50 mb-4"></div>

            {/* Motivación */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="text-lg">💬</div>
                <p className="text-sm font-medium text-text-secondary italic">"{parsedInsight.motivacion}"</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Clock className="h-3 w-3" />
                <span>{relativeLabel === 'Esta semana' ? 'hace pocos días' : relativeLabel}</span>
                <span>·</span>
                <span>IA</span>
              </div>
            </div>
          </>
        ) : (
          // Fallback para insights antiguos
          <p className="text-sm text-text-secondary leading-relaxed">{insight.insight_text}</p>
        )}
      </div>
    </div>
  )
}

export function InsightsClient({ insights: initialInsights }: InsightsClientProps) {
  const [insights, setInsights] = useState(initialInsights)
  const [generating, setGenerating] = useState(false)
  const [showLunesBanner, setShowLunesBanner] = useState(false)

  useEffect(() => {
    const hoyEsLunes = new Date().getDay() === 1
    const hayInsightEstaSemana = insights[0] && isCurrentWeek(insights[0].week_start)

    if (hoyEsLunes && !hayInsightEstaSemana && insights.length > 0) {
      setShowLunesBanner(true)
    }
  }, [insights])

  async function generateInsight() {
    setGenerating(true)
    try {
      const res = await fetch('/api/insights/generate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al generar')
      setInsights((prev) => [data.insight, ...prev])
      setShowLunesBanner(false)
      toast.success('Insight generado')
    } catch (err) {
      toast.error('Error', { description: (err as Error).message })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-1">Insights IA</h1>
          <p className="text-text-secondary">Análisis semanal de tus hábitos financieros</p>
        </div>

        {/* Botón solo cuando hay insights existentes */}
        {insights.length > 0 && (
          <GradientButton onClick={generateInsight} loading={generating} size="sm">
            <Sparkles className="h-4 w-4" />
            {generating ? 'Generando...' : 'Generar insight de esta semana'}
          </GradientButton>
        )}
      </div>

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

      {/* Contenido principal */}
      {insights.length === 0 ? (
        <InsightsEmptyState onGenerate={generateInsight} isGenerating={generating} />
      ) : (
        <div className="relative">
          {/* Línea de timeline */}
          {insights.length > 1 && (
            <div className="absolute left-6 top-12 bottom-0 w-px bg-gradient-to-b from-purple-300 via-purple-200 to-transparent"></div>
          )}

          {/* Cards */}
          <div className="space-y-8">
            {insights.map((insight, index) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                isLatest={index === 0}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
