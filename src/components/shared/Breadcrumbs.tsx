import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface Crumb {
  label: string
  href?: string
}

interface Props {
  items: Crumb[]
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-text-muted">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-violet-light transition-colors"
        aria-label="Dashboard"
      >
        <Home className="h-3 w-3" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-text-muted/50" />
          {item.href ? (
            <Link href={item.href} className="hover:text-violet-light transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-secondary font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
