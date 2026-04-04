import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export function GlassCard({ children, className, hover = false, glow = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl glass-card',
        hover && 'transition-fintech hover:bg-surface-hover hover:border-violet-primary/20',
        glow && 'glow-violet',
        className
      )}
    >
      {children}
    </div>
  )
}
