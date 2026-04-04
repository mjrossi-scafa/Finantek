'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { WeeklyComparison } from '@/types/database'
import { formatCLP, formatCLPCompact } from '@/lib/utils/currency'

interface WeeklyComparisonChartProps {
  data: WeeklyComparison[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-elevated/95 backdrop-blur-md rounded-xl px-3 py-2.5 shadow-xl border border-surface-border">
      <p className="text-xs font-semibold text-text-primary mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-mono text-text-primary">
          <span style={{ color: p.color }}>●</span> {p.dataKey}: <span style={{ color: p.color }}>{formatCLP(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export function WeeklyComparisonChart({ data }: WeeklyComparisonChartProps) {
  if (data.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-bold text-text-primary mb-1">Comparación semanal</h3>
        <p className="text-xs text-text-tertiary mb-4">Esta semana vs anterior</p>
        <div className="flex items-center justify-center h-48 text-text-tertiary text-sm">
          Sin datos semanales disponibles
        </div>
      </div>
    )
  }

  const chartData = data.slice(0, 5).map((d) => ({
    name: d.category_name.length > 8 ? d.category_name.slice(0, 8) + '.' : d.category_name,
    'Esta semana': d.this_week,
    'Anterior': d.last_week,
  }))

  return (
    <div className="glass-card rounded-2xl p-6 overflow-hidden">
      <h3 className="text-sm font-bold text-text-primary mb-1">Comparación semanal</h3>
      <p className="text-xs text-text-tertiary mb-4">Esta semana vs anterior por categoría</p>
      <div className="[&_.recharts-bar-rectangle:hover]:opacity-90 [&_.recharts-bar-rectangle]:transition-opacity [&_.recharts-cartesian-grid-bg]:fill-transparent [&_.recharts-wrapper]:bg-transparent pb-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={2}>
          <defs>
            <rect id="transparentBg" fill="transparent" />
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatCLPCompact} tick={{ fontSize: 10, fill: '#64748B' }} width={55} axisLine={false} tickLine={false} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'transparent' }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar
            dataKey="Esta semana"
            fill="#8B5CF6"
            radius={[6, 6, 0, 0]}
            maxBarSize={24}
          />
          <Bar
            dataKey="Anterior"
            fill="#64748B"
            radius={[6, 6, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
