import { Budget } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { getMonthName } from '@/lib/utils/dates'
import { Trash2 } from 'lucide-react'

interface BudgetCardProps {
  budget: Budget
  spent: number
  onDelete: (id: string) => void
}

export function BudgetCard({ budget, spent, onDelete }: BudgetCardProps) {
  const pct = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0
  const remaining = budget.amount - spent

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
        <button
          onClick={() => onDelete(budget.id)}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Gastado</span>
          <span className="font-bold font-mono text-text-primary">{formatCLP(spent)} / {formatCLP(budget.amount)}</span>
        </div>
        <div className="h-2 rounded-full bg-surface-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-tertiary">{pct}% usado</span>
          <span className={remaining < 0 ? 'text-danger font-bold' : 'text-text-tertiary'}>
            {remaining >= 0 ? `${formatCLP(remaining)} disponible` : `${formatCLP(-remaining)} excedido`}
          </span>
        </div>
      </div>
    </div>
  )
}
