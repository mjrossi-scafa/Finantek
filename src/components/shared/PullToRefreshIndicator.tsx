'use client'

import { Loader2, ChevronDown } from 'lucide-react'

interface Props {
  pulling: boolean
  pullDistance: number
  refreshing: boolean
  threshold: number
}

export function PullToRefreshIndicator({ pulling, pullDistance, refreshing, threshold }: Props) {
  if (!pulling && !refreshing) return null

  const progress = Math.min(pullDistance / threshold, 1)
  const willTrigger = pullDistance >= threshold

  return (
    <div
      className="md:hidden fixed top-0 left-0 right-0 pointer-events-none z-40 flex items-center justify-center"
      style={{
        height: `${Math.max(pullDistance, refreshing ? 60 : 0)}px`,
        transition: refreshing ? 'height 0.2s ease' : 'none',
      }}
    >
      <div
        className={`flex flex-col items-center gap-1 transition-all ${
          refreshing ? 'opacity-100' : 'opacity-70'
        }`}
        style={{
          transform: `scale(${0.5 + progress * 0.5})`,
        }}
      >
        {refreshing ? (
          <Loader2 className="h-6 w-6 animate-spin text-violet-light" />
        ) : (
          <ChevronDown
            className={`h-6 w-6 transition-transform duration-200 ${
              willTrigger ? 'rotate-180 text-bamboo-take' : 'text-text-muted'
            }`}
          />
        )}
        {pulling && !refreshing && (
          <span className={`text-xs font-medium ${willTrigger ? 'text-bamboo-take' : 'text-text-muted'}`}>
            {willTrigger ? 'Suelta para actualizar' : 'Jala para actualizar'}
          </span>
        )}
      </div>
    </div>
  )
}
