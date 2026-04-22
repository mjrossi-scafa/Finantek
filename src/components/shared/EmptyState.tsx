interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'inline' | 'card'
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const isCard = variant === 'card'
  const isInline = variant === 'inline'

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        isCard
          ? 'py-12 px-6 glass-card rounded-2xl border-2 border-dashed border-violet-500/20'
          : isInline
            ? 'py-6'
            : 'py-16'
      }`}
    >
      {/* Icon with ambient glow */}
      <div className="relative mb-4">
        <div className="absolute inset-0 blur-2xl opacity-30 bg-violet-500 rounded-full" />
        <div className={`relative ${isInline ? 'text-4xl' : 'text-5xl md:text-6xl'}`}>
          {icon}
        </div>
      </div>

      <h3 className={`font-bold text-text-primary mb-2 ${isInline ? 'text-base' : 'text-lg md:text-xl'}`}>
        {title}
      </h3>

      {description && (
        <p className={`text-text-secondary max-w-sm mb-6 leading-relaxed ${isInline ? 'text-xs' : 'text-sm'}`}>
          {description}
        </p>
      )}

      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
