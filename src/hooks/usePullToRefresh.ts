'use client'

import { useEffect, useRef, useState } from 'react'
import { haptic } from '@/lib/utils/haptic'

interface UsePullToRefreshOptions {
  onRefresh: () => void | Promise<void>
  threshold?: number // px to trigger
  disabled?: boolean
}

/**
 * Hook that enables pull-to-refresh on mobile.
 * Only activates when scrollY === 0 (at top of page).
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
}: UsePullToRefreshOptions) {
  const [pulling, setPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef<number | null>(null)
  const triggeredHaptic = useRef(false)

  useEffect(() => {
    if (disabled) return

    function onTouchStart(e: TouchEvent) {
      // Only if at top of scroll
      if (window.scrollY > 0) return
      startY.current = e.touches[0].clientY
      triggeredHaptic.current = false
    }

    function onTouchMove(e: TouchEvent) {
      if (startY.current === null) return
      if (window.scrollY > 0) {
        startY.current = null
        setPulling(false)
        setPullDistance(0)
        return
      }

      const currentY = e.touches[0].clientY
      const delta = currentY - startY.current

      if (delta > 0) {
        setPulling(true)
        // Easing: less resistance near top, more as we pull down
        const resistance = 1 - Math.min(delta / 300, 0.8)
        const adjustedDelta = Math.min(delta * resistance, 120)
        setPullDistance(adjustedDelta)

        // Trigger haptic when reaching threshold
        if (adjustedDelta >= threshold && !triggeredHaptic.current) {
          haptic('medium')
          triggeredHaptic.current = true
        }
      }
    }

    async function onTouchEnd() {
      if (!pulling) return

      if (pullDistance >= threshold && !refreshing) {
        setRefreshing(true)
        haptic('success')
        try {
          await onRefresh()
        } finally {
          setRefreshing(false)
        }
      }

      startY.current = null
      setPulling(false)
      setPullDistance(0)
      triggeredHaptic.current = false
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [onRefresh, pulling, pullDistance, refreshing, threshold, disabled])

  return { pulling, pullDistance, refreshing, threshold }
}
