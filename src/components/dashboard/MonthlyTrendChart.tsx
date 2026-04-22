'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { MonthlyTrend } from '@/types/database'
import { formatCLP, formatCLPCompact } from '@/lib/utils/currency'
import { getMonthName } from '@/lib/utils/dates'
import { TrendingUp } from 'lucide-react'

interface MonthlyTrendChartProps {
  data: MonthlyTrend[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  const currentYear = new Date().getFullYear()
  return (
    <div className="glass-card rounded-xl px-4 py-3 shadow-xl border border-surface-border backdrop-blur-md">
      <p className="text-sm font-semibold text-text-primary mb-3">{label} {currentYear}</p>
      <div className="space-y-2">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-sm font-medium text-text-secondary">{p.dataKey}</span>
            </div>
            <span className="text-sm font-bold font-mono" style={{ color: p.color }}>
              {formatCLP(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const chartData = data.map((d) => ({
    name: getMonthName(d.month).slice(0, 3),
    Ingresos: d.income,
    Gastos: d.expense,
  }))

  // Calcular totales para mostrar estadísticas
  const totalIngresos = data.reduce((sum, d) => sum + d.income, 0)
  const totalGastos = data.reduce((sum, d) => sum + d.expense, 0)
  const promedio = (totalIngresos - totalGastos) / data.length

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-light/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-indigo-light" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Tendencia Mensual</h3>
            <p className="text-sm text-text-tertiary">Ingresos vs gastos últimos 12 meses</p>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="text-right">
          <p className="text-sm font-medium text-text-primary">
            Promedio: <span className={`font-mono ${promedio >= 0 ? 'text-bamboo-take' : 'text-vermillion-shu'}`}>
              {formatCLP(promedio)}
            </span>
          </p>
          <p className="text-xs text-text-muted mt-1">{data.length} meses</p>
        </div>
      </div>

      <div className="[&_.recharts-tooltip-wrapper]:z-50">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              {/* Gradientes más translúcidos y elegantes */}
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.15} />
                <stop offset="50%" stopColor="#22C55E" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="shadowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000000" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#000000" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 4"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
              horizontal={true}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              tickFormatter={formatCLPCompact}
              tick={{ fontSize: 11, fill: '#64748B' }}
              width={70}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
              wrapperStyle={{ outline: 'none' }}
            />

            {/* Áreas con mejor superposición */}
            <Area
              type="monotone"
              dataKey="Gastos"
              stroke="#8B5CF6"
              strokeWidth={2.5}
              fill="url(#colorGastos)"
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="Ingresos"
              stroke="#22C55E"
              strokeWidth={2.5}
              fill="url(#colorIngresos)"
              dot={{ fill: '#22C55E', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#22C55E', strokeWidth: 2, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda personalizada */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-surface-border/50">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-bamboo-take" />
          <span className="text-xs font-medium text-text-secondary">Ingresos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-violet-500" />
          <span className="text-xs font-medium text-text-secondary">Gastos</span>
        </div>
      </div>
    </div>
  )
}
