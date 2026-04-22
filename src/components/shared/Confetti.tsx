'use client'

import { useEffect, useState } from 'react'

/**
 * Lightweight CSS-based confetti without external libraries.
 * Triggers when `trigger` changes.
 */

interface ConfettiProps {
  trigger?: number | null // change value to trigger new burst
  duration?: number
  particles?: number
}

const COLORS = ['#8B5CF6', '#A855F7', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EAB308']

export function Confetti({ trigger, duration = 3000, particles = 60 }: ConfettiProps) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (trigger === null || trigger === undefined) return
    setActive(true)
    const timeout = setTimeout(() => setActive(false), duration)
    return () => clearTimeout(timeout)
  }, [trigger, duration])

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {Array.from({ length: particles }).map((_, i) => {
        const color = COLORS[i % COLORS.length]
        const startX = 40 + Math.random() * 20 // 40-60%
        const endX = Math.random() * 100
        const rotation = Math.random() * 720
        const delay = Math.random() * 0.3
        const fallDuration = 2 + Math.random() * 1.5
        const size = 6 + Math.random() * 8
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${startX}%`,
              top: '40%',
              width: `${size}px`,
              height: `${size * 0.4}px`,
              background: color,
              borderRadius: '2px',
              animation: `confettiFall ${fallDuration}s cubic-bezier(0.3, 0.7, 0.4, 1) ${delay}s forwards`,
              '--end-x': `${endX - startX}vw`,
              '--rotation': `${rotation}deg`,
            } as React.CSSProperties}
          />
        )
      })}
    </div>
  )
}
