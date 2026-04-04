interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">{title}</h1>
        {description && (
          <p className="text-text-secondary mt-0.5 text-sm capitalize">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
