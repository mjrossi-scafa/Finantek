import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  trend?: number // percentage change
  icon?: React.ReactNode
  variant?: 'default' | 'success' | 'danger'
}

export function StatCard({ title, value, trend, icon, variant = 'default' }: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0

  return (
    <div className="glass-card rounded-2xl ma-md transition-wa hover:bg-surface-elevated/40 hover:glow-indigo group">
      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] font-weight-medium text-text-muted uppercase tracking-wide-zen">
          {title}
        </span>
        {icon && (
          <div className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center transition-wa group-hover:scale-105',
            variant === 'success' && 'bg-bamboo-take/10 text-bamboo-take group-hover:bg-bamboo-take/20 group-hover:glow-bamboo',
            variant === 'danger' && 'bg-vermillion-shu/10 text-vermillion-shu group-hover:bg-vermillion-shu/20 group-hover:glow-vermillion',
            variant === 'default' && 'bg-indigo-ai/10 text-indigo-light group-hover:bg-indigo-ai/20',
          )}>
            {icon}
          </div>
        )}
      </div>

      <p className={cn(
        'text-2xl font-extrabold font-mono tracking-zen leading-none',
        variant === 'success' && 'text-bamboo-take',
        variant === 'danger' && 'text-vermillion-shu',
        variant === 'default' && 'text-text-primary',
      )}>
        {value}
      </p>

      {trend !== undefined && (
        <div className={cn(
          'flex items-center gap-1.5 mt-3 text-xs font-weight-medium tracking-zen',
          isPositive ? 'text-bamboo-take' : 'text-vermillion-shu'
        )}>
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          <span className="font-mono">{isPositive ? '+' : ''}{trend}%</span>
          <span className="text-text-muted">vs mes anterior</span>
        </div>
      )}
    </div>
  )
}
