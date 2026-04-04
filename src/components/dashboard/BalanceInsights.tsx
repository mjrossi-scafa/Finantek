'use client'

import { useState, useEffect } from 'react'
import { WeeklyInsight } from '@/types/database'
import { Sparkles, Loader2, AlertCircle, CheckCircle, Lightbulb, TrendingDown, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface ParsedInsight {
  resumen: string
  puntos: Array<{ tipo: 'alerta' | 'positivo' | 'sugerencia'; texto: string }>
  motivacion: string
}

interface InsightResponse {
  insight: WeeklyInsight | null
  isThisWeek: boolean
  parsed: ParsedInsight | null
}

function InsightsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-4 rounded-md animate-pulse"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
        />
      ))}
    </div>
  )
}

function NoInsightState({ onGenerate, isGenerating }: { onGenerate: () => void; isGenerating: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[140px] gap-2 text-center">
      <p className="text-xs text-white/80 font-medium">No hay análisis esta semana</p>
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs text-white font-semibold border border-white/30 rounded-full hover:bg-white/10 hover:border-white/50 transition-all disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            Analizando...
          </>
        ) : (
          <>
            ✦ Generar ahora
          </>
        )}
      </button>
    </div>
  )
}

function StructuredInsight({ insight, parsed }: { insight: WeeklyInsight; parsed: ParsedInsight }) {
  // Determinar badge basado en spending_data
  const getBadge = () => {
    if (!insight.spending_data || typeof insight.spending_data !== 'object') return null
    const spendingData = insight.spending_data as { thisWeek: number; lastWeek: number }
    const gastasteMenos = spendingData.thisWeek < spendingData.lastWeek

    return gastasteMenos
      ? { text: '↓ Mejor semana', color: 'bg-green-500/20 text-green-300 border-green-500/30' }
      : { text: '↑ Más gasto', color: 'bg-red-500/20 text-red-300 border-red-500/30' }
  }

  const badge = getBadge()

  const getPuntoIcon = (tipo: string) => {
    switch (tipo) {
      case 'alerta': return <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
      case 'positivo': return <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
      case 'sugerencia': return <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
      default: return <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
    }
  }

  const getPuntoColor = (tipo: string) => {
    switch (tipo) {
      case 'alerta': return 'text-red-300'
      case 'positivo': return 'text-green-300'
      case 'sugerencia': return 'text-purple-300'
      default: return 'text-gray-300'
    }
  }

  const getDaysAgo = () => {
    const generatedAt = new Date(insight.generated_at)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'hoy'
    if (diffDays === 1) return 'ayer'
    return `hace ${diffDays} días`
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-purple-300" />
          <span className="text-xs font-semibold text-purple-200 tracking-wide">
            INSIGHTS IA
          </span>
        </div>
        {badge && (
          <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${badge.color}`}>
            {badge.text}
          </span>
        )}
      </div>

      {/* Puntos */}
      <div className="space-y-2">
        {parsed.puntos.slice(0, 3).map((punto, i) => (
          <div key={i}>
            <div className="flex items-start gap-2">
              {getPuntoIcon(punto.tipo)}
              <p className={`text-xs leading-relaxed ${getPuntoColor(punto.tipo)}`}>
                {punto.texto}
              </p>
            </div>
            {i < parsed.puntos.length - 1 && i < 2 && (
              <div className="border-b border-white/5 mt-2" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-[10px] text-white/30 tracking-wide">
        Actualizado · {getDaysAgo()} · Claude AI
      </div>
    </div>
  )
}

function PlainTextInsight({ insight }: { insight: WeeklyInsight }) {
  const getDaysAgo = () => {
    const generatedAt = new Date(insight.generated_at)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - generatedAt.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'hoy'
    if (diffDays === 1) return 'ayer'
    return `hace ${diffDays} días`
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-purple-300" />
        <span className="text-xs font-semibold text-purple-200 tracking-wide">
          INSIGHTS IA
        </span>
      </div>

      {/* Texto */}
      <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
        {insight.insight_text}
      </p>

      {/* Footer */}
      <div className="text-[10px] text-white/30 tracking-wide">
        Actualizado · {getDaysAgo()} · Claude AI
      </div>
    </div>
  )
}

export function BalanceInsights() {
  const [data, setData] = useState<InsightResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  const fetchCurrentInsight = async () => {
    try {
      const res = await fetch('/api/insights/current')
      if (res.ok) {
        const insightData = await res.json()
        setData(insightData)
      }
    } catch (error) {
      console.error('Error fetching current insight:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateInsight = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/insights/generate', { method: 'POST' })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Error al generar')

      // Refrescar los datos después de generar
      await fetchCurrentInsight()
      toast.success('Análisis generado')
    } catch (err) {
      toast.error('Error', { description: (err as Error).message })
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    fetchCurrentInsight()
  }, [])

  if (loading) {
    return <InsightsSkeleton />
  }

  // Sin insight de esta semana - mostrar botón
  if (!data?.insight || !data.isThisWeek) {
    return <NoInsightState onGenerate={generateInsight} isGenerating={generating} />
  }

  // Con insight estructurado (JSON)
  if (data.parsed) {
    return <StructuredInsight insight={data.insight} parsed={data.parsed} />
  }

  // Fallback: insight texto plano
  return <PlainTextInsight insight={data.insight} />
}