import { cn } from '@/lib/utils'

interface FinantekLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FinantekLogo({ size = 'md', className }: FinantekLogoProps) {
  const config = {
    sm: { scale: 0.8, showSubtitle: false },
    md: { scale: 1, showSubtitle: false },
    lg: { scale: 1.2, showSubtitle: true },
  }[size]

  return (
    <div className={cn('flex flex-col items-start', className)}>
      {/* Logo principal más legible */}
      <div
        className="flex items-center gap-2"
        style={{ transform: `scale(${config.scale})`, transformOrigin: 'left center' }}
      >
        {/* F con barras zen integradas sutilmente */}
        <div className="relative">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={`zen-f-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="[stop-color:#4338CA]" />
                <stop offset="50%" className="[stop-color:#6366F1]" />
                <stop offset="100%" className="[stop-color:#8B8FF5]" />
              </linearGradient>
            </defs>

            {/* F principal clara y legible */}
            <path
              d="M4 4 L4 20 L7 20 L7 14 L15 14 L15 11 L7 11 L7 7 L17 7 L17 4 L4 4 Z"
              fill={`url(#zen-f-${size})`}
            />

            {/* Barras zen como acento sutil dentro de la F */}
            <rect x="9" y="12" width="1" height="3" rx="0.5" fill={`url(#zen-f-${size})`} opacity="0.4"/>
            <rect x="10.5" y="10" width="1" height="5" rx="0.5" fill={`url(#zen-f-${size})`} opacity="0.6"/>
            <rect x="12" y="8" width="1" height="7" rx="0.5" fill={`url(#zen-f-${size})`} opacity="0.8"/>
            <rect x="13.5" y="11" width="1" height="4" rx="0.5" fill={`url(#zen-f-${size})`} opacity="0.6"/>
          </svg>
        </div>

        {/* Texto FINANTEK limpio y legible */}
        <span className={cn(
          'font-extrabold tracking-tight text-gradient-indigo leading-none',
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-xl'
        )}>
          FINANTEK
        </span>
      </div>

      {/* Subtítulo para versión large */}
      {config.showSubtitle && (
        <span className="text-[10px] font-weight-medium text-text-muted tracking-wide-zen leading-none mt-1 ml-1">
          資産管理 • 和モダン
        </span>
      )}
    </div>
  )
}