import { Budget } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { getMonthName } from '@/lib/utils/dates'
import { Trash2, Edit2, CalendarClock, Award } from 'lucide-react'

interface BudgetCardProps {
  budget: Budget
  spent: number
  planned?: number
  compliance?: { total: number; cumplidos: number }
  onDelete: (id: string) => void
  onEdit?: () => void
}

export function BudgetCard({ budget, spent, planned = 0, compliance, onDelete, onEdit }: BudgetCardProps) {
  const projected = spent + planned
  const pct = budget.amount > 0 ? Math.round((projected / budget.amount) * 100) : 0
  const realPct = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0
  const remaining = budget.amount - projected

  const barColor =
    pct >= 100 ? 'bg-danger' :
    pct >= 80 ? 'bg-yellow-500' :
    'bg-success'

  const category = budget.categories

  return (
    <div className="glass-card rounded-2xl p-5 transition-fintech hover:bg-surface-hover group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{category?.icon}</span>
          <div>
            <span className="font-bold text-sm text-text-primary">{category?.name}</span>
            <p className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
              {budget.period_type === 'monthly'
                ? `${getMonthName(budget.month!)} ${budget.year}`
                : `Anual ${budget.year}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-violet-light hover:bg-violet-500/10 transition-colors"
              title="Editar"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => onDelete(budget.id)}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Gastado</span>
          <span className="font-bold font-mono text-text-primary">
            {formatCLP(spent)} <span className="text-text-muted">/ {formatCLP(budget.amount)}</span>
          </span>
        </div>

        {/* Progress bar with real + planned segments */}
        <div className="h-2 rounded-full bg-surface-border overflow-hidden relative">
          {/* Real spent (solid) */}
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(realPct, 100)}%` }}
          />
          {/* Planned (striped overlay) */}
          {planned > 0 && (
            <div
              className="absolute top-0 h-full transition-all duration-500 opacity-50"
              style={{
                left: `${Math.min(realPct, 100)}%`,
                width: `${Math.min(pct - realPct, 100 - realPct)}%`,
                backgroundImage: `repeating-linear-gradient(45deg, ${pct >= 100 ? '#EF4444' : pct >= 80 ? '#EAB308' : '#22C55E'} 0 4px, transparent 4px 8px)`,
              }}
            />
          )}
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-text-tertiary">{pct}% usado</span>
          <span className={remaining < 0 ? 'text-danger font-bold' : 'text-text-tertiary'}>
            {remaining >= 0 ? `${formatCLP(remaining)} disponible` : `${formatCLP(-remaining)} excedido`}
          </span>
        </div>

        {/* Planned expenses indicator */}
        {planned > 0 && (
          <div className="flex items-center gap-1.5 pt-2 mt-1 border-t border-surface-border/50">
            <CalendarClock className="h-3 w-3 text-yellow-400" />
            <span className="text-[11px] text-text-muted">
              Planificado este mes: <span className="font-mono font-semibold text-yellow-400">{formatCLP(planned)}</span>
            </span>
          </div>
        )}

        {/* Historical compliance */}
        {compliance && compliance.total > 0 && (
          <div className={`flex items-center gap-1.5 ${planned > 0 ? 'mt-1' : 'pt-2 mt-1 border-t border-surface-border/50'}`}>
            <Award className={`h-3 w-3 ${
              compliance.cumplidos / compliance.total >= 0.7 ? 'text-bamboo-take' :
              compliance.cumplidos / compliance.total >= 0.4 ? 'text-yellow-400' :
              'text-vermillion-shu'
            }`} />
            <span className="text-[11px] text-text-muted">
              Cumplido{' '}
              <span className="font-mono font-semibold text-text-primary">
                {compliance.cumplidos}/{compliance.total}
              </span>{' '}
              {compliance.total === 1 ? 'mes histórico' : 'meses históricos'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
