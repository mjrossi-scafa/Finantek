'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { CategorySpending } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { TrendingDown } from 'lucide-react'

interface SpendingByCategoryChartProps {
  data: CategorySpending[]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; color: string; pct: number; icon: string } }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="glass-card rounded-xl px-4 py-3 shadow-xl border border-surface-border backdrop-blur-md">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{d.icon}</span>
        <p className="text-sm font-semibold text-text-primary">{d.name}</p>
      </div>
      <div className="space-y-1">
        <p className="text-base font-bold font-mono text-text-primary">{formatCLP(d.value)}</p>
        <p className="text-xs text-text-secondary">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: d.color }} />
          {d.pct}% del total
        </p>
      </div>
    </div>
  )
}

export function SpendingByCategoryChart({ data }: SpendingByCategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <h3 className="text-sm font-bold text-text-primary mb-1">Gastos por categoría</h3>
        <p className="text-xs text-text-tertiary mb-4">Distribución del mes</p>
        <div className="flex flex-col items-center justify-center h-48 gap-2 text-center px-4">
          <p className="text-sm text-text-secondary">
            Todavía no hay gastos este mes.
          </p>
          <p className="text-xs text-text-muted">
            A medida que registres, verás la distribución por categoría acá.
          </p>
        </div>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.total, 0)
  const chartData = data.map((d) => ({
    name: d.category_name,
    value: d.total,
    color: d.color,
    icon: d.icon,
    pct: Math.round((d.total / total) * 100),
  }))

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-vermillion-shu/10 flex items-center justify-center">
          <TrendingDown className="h-5 w-5 text-vermillion-shu" />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-primary">Gastos por Categoría</h3>
          <p className="text-sm text-text-tertiary">Distribución del mes</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6">
        {/* Donut chart con contenido central */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color || '#8B5CF6'} opacity={0.9} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: 'none' }} />
            </PieChart>
          </ResponsiveContainer>

          {/* Contenido central del donut */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-1">
                <p className="text-2xl font-black font-mono text-text-primary leading-none">
                  {formatCLP(total)}
                </p>
              </div>
              <p className="text-xs text-text-muted font-medium">Total gastado</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-[10px] text-gray-400">{chartData.length} {chartData.length === 1 ? 'categoría' : 'categorías'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de categorías mejorada */}
        <div className="flex-1 space-y-2 overflow-hidden w-full">
          {chartData.slice(0, 6).map((d, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-elevated/50 transition-colors group">
              {/* Punto de color */}
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: d.color || '#8B5CF6' }}
              />

              {/* Nombre con ícono */}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-text-secondary truncate">
                  {d.icon} {d.name}
                </span>
              </div>

              {/* Porcentaje */}
              <div className="text-right">
                <span className="text-sm font-bold font-mono text-text-primary tabular-nums">
                  {d.pct}%
                </span>
              </div>

              {/* Monto */}
              <div className="text-right min-w-[70px]">
                <p className="text-xs text-text-muted font-mono">
                  {formatCLP(d.value)}
                </p>
              </div>
            </div>
          ))}

          {chartData.length > 6 && (
            <div className="text-center pt-2">
              <p className="text-xs text-text-muted">
                +{chartData.length - 6} categorías más
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
