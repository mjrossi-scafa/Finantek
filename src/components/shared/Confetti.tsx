'use client'

import { useEffect, useState, useMemo } from 'react'

interface ConfettiProps {
  trigger?: number | null
  duration?: number
  particles?: number
}

const COLORS = ['#8B5CF6', '#A855F7', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EAB308']

interface Particle {
  color: string
  startX: number
  endX: number
  rotation: number
  delay: number
  fallDuration: number
  size: number
}

export function Confetti({ trigger, duration = 3000, particles = 60 }: ConfettiProps) {
  const [active, setActive] = useState(false)
  const [particleData, setParticleData] = useState<Particle[]>([])

  useEffect(() => {
    if (trigger === null || trigger === undefined) return

    // Generate particle data once per trigger (not on every render)
    const data: Particle[] = Array.from({ length: particles }).map((_, i) => ({
      color: COLORS[i % COLORS.length],
      startX: 40 + Math.random() * 20,
      endX: Math.random() * 100,
      rotation: Math.random() * 720,
      delay: Math.random() * 0.3,
      fallDuration: 2 + Math.random() * 1.5,
      size: 6 + Math.random() * 8,
    }))
    setParticleData(data)
    setActive(true)

    const timeout = setTimeout(() => setActive(false), duration)
    return () => clearTimeout(timeout)
  }, [trigger, duration, particles])

  if (!active) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particleData.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${p.startX}%`,
            top: '40%',
            width: `${p.size}px`,
            height: `${p.size * 0.4}px`,
            background: p.color,
            borderRadius: '2px',
            animation: `confettiFall ${p.fallDuration}s cubic-bezier(0.3, 0.7, 0.4, 1) ${p.delay}s forwards`,
            '--end-x': `${p.endX - p.startX}vw`,
            '--rotation': `${p.rotation}deg`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
