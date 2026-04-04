import { formatCLP } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'

interface TransactionItemProps {
  icon: string
  iconColor: string
  description: string
  category: string
  date: string
  amount: number
  type: 'income' | 'expense'
}

export function TransactionItem({
  icon,
  iconColor,
  description,
  category,
  date,
  amount,
  type,
}: TransactionItemProps) {
  return (
    <div className="flex items-center gap-4 py-3 transition-wa hover:bg-surface-elevated/30 rounded-xl px-3 -mx-3 group cursor-default">
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center text-base shrink-0 transition-wa group-hover:scale-105"
        style={{ backgroundColor: iconColor + '15' }}
      >
        <span className="filter drop-shadow-sm">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-weight-semibold text-text-primary truncate tracking-zen">{description}</p>
        <p className="text-xs text-text-muted mt-0.5 font-weight-light tracking-zen">
          {category} <span className="text-text-tertiary/60">•</span> {date}
        </p>
      </div>
      <span className={cn(
        'text-sm font-bold font-mono tabular-nums shrink-0 tracking-zen',
        type === 'income' ? 'text-bamboo-take' : 'text-vermillion-shu'
      )}>
        {type === 'income' ? '+' : '−'}{formatCLP(amount)}
      </span>
    </div>
  )
}
