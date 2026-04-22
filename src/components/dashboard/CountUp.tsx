'use client'

import { useState, useEffect, useRef, memo } from 'react'
import { formatCLP } from '@/lib/utils/currency'

interface CountUpProps {
  value: number
  duration?: number
  className?: string
  format?: (n: number) => string
}

export const CountUp = memo(function CountUp({ value, duration = 800, className, format = formatCLP }: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const prevValueRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const startValue = prevValueRef.current
    const endValue = value
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (endValue - startValue) * eased

      setDisplayValue(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        prevValueRef.current = endValue
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value, duration])

  return <span className={className}>{format(Math.round(displayValue))}</span>
})
