'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface CherryBlossomsProps {}

// Colores suaves y relajantes
const GENTLE_COLORS = ['#E9D5FF', '#F9A8D4', '#DDD6FE', '#EDE9FE', '#C084FC']

export function CherryBlossoms({}: CherryBlossomsProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Limpiar pétalos anteriores
    container.innerHTML = ''
    const timelines: gsap.core.Timeline[] = []

    // Configuración relajante
    const colors = GENTLE_COLORS
    const count = 12 // Muchos menos pétalos
    const speedBase = 8 // Más lento
    const opacityMax = 0.4 // Más sutil

    const { offsetWidth: w, offsetHeight: h } = container

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div')
      const size = Math.random() * 7 + 5
      const color = colors[Math.floor(Math.random() * colors.length)]

      el.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size * 0.55}px;
        background: ${color};
        border-radius: 50% 0 50% 0;
        pointer-events: none;
        opacity: 0;
        top: 0;
        left: 0;
      `
      container.appendChild(el)

      const startX = Math.random() * (w || 160)
      const driftX = (Math.random() - 0.5) * 30 // Menos deriva lateral
      const duration = speedBase + Math.random() * 4 // Más variación lenta
      const delay = -(Math.random() * duration)

      const tl = gsap.timeline({ repeat: -1, delay })
      tl.set(el, {
        x: startX,
        y: -15,
        rotation: Math.random() * 180, // Rotación inicial más suave
        opacity: 0,
      })
      .to(el, {
        y: (h || 200) + 15,
        x: startX + driftX,
        rotation: `+=${Math.random() * 120 + 60}`, // Rotaciones mucho más suaves
        duration,
        ease: 'power1.inOut', // Easing más suave
        onStart() {
          gsap.to(el, { opacity: opacityMax, duration: 1.5 })
        },
      })
      .to(el, {
        opacity: 0,
        duration: 2, // Fade más lento
      }, `-=2`)

      timelines.push(tl)
    }

    return () => {
      timelines.forEach(tl => tl.kill())
      container.innerHTML = ''
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  )
}