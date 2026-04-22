'use client'

import { useEffect, useState, useRef } from 'react'
import type { KatanaState } from '@/app/(app)/layout'

interface SamuraiWidgetProps {
  transitioning?: boolean
  katanaState?: KatanaState
}

// Katana color schemes based on financial state
const KATANA_THEMES: Record<KatanaState, {
  blade: string
  bladeEdge: string
  glow: string
  auraColor: string
  tsuba: string
  statusLabel: string
  statusColor: string
}> = {
  violet: {
    blade: '#C084FC',
    bladeEdge: '#EDE9FE',
    glow: '#A855F7',
    auraColor: 'rgba(124,58,237,0.25)',
    tsuba: '#7C3AED',
    statusLabel: 'En equilibrio',
    statusColor: '#C084FC',
  },
  green: {
    blade: '#86EFAC',
    bladeEdge: '#DCFCE7',
    glow: '#22C55E',
    auraColor: 'rgba(34,197,94,0.3)',
    tsuba: '#16A34A',
    statusLabel: 'Próspero',
    statusColor: '#86EFAC',
  },
  yellow: {
    blade: '#FDE68A',
    bladeEdge: '#FEF9C3',
    glow: '#F59E0B',
    auraColor: 'rgba(245,158,11,0.3)',
    tsuba: '#D97706',
    statusLabel: 'Atento',
    statusColor: '#FDE68A',
  },
  red: {
    blade: '#FCA5A5',
    bladeEdge: '#FEE2E2',
    glow: '#EF4444',
    auraColor: 'rgba(239,68,68,0.35)',
    tsuba: '#DC2626',
    statusLabel: 'Alerta',
    statusColor: '#FCA5A5',
  },
  gold: {
    blade: '#FCD34D',
    bladeEdge: '#FEF3C7',
    glow: '#F59E0B',
    auraColor: 'rgba(251,191,36,0.5)',
    tsuba: '#B45309',
    statusLabel: 'Victoria ✨',
    statusColor: '#FCD34D',
  },
}

export function SamuraiWidget({ transitioning = false, katanaState = 'violet' }: SamuraiWidgetProps) {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)
  const katanaContainerRef = useRef<HTMLDivElement>(null)

  const theme = KATANA_THEMES[katanaState]
  const isAlert = katanaState === 'red'
  const isGold = katanaState === 'gold'

  // FRASES BUSHIDO SIMPLIFICADAS
  const quotes = [
    {
      text: '"El presupuesto es el\nmapa del guerrero"',
      kanji: '武',
      romaji: 'Bu · Disciplina',
      color: '#A855F7'
    },
    {
      text: '"Cada peso, una victoria"',
      kanji: '勝',
      romaji: 'Katsu · Victoria',
      color: '#84CC16'
    },
    {
      text: '"Ahorra con intención.\nGasta con propósito"',
      kanji: '道',
      romaji: 'Dō · El camino',
      color: '#C084FC'
    },
    {
      text: '"Recorta lo innecesario.\nPreserva lo esencial"',
      kanji: '整',
      romaji: 'Sei · Orden',
      color: '#7C3AED'
    },
  ]

  const quoteInterval = 6000 // Más lento para ser relajante

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(p => (p + 1) % quotes.length)
        setVisible(true)
      }, 400)
    }, quoteInterval)
    return () => clearInterval(interval)
  }, [quotes.length, quoteInterval])

  return (
    <div
      className="px-3 py-1 hidden lg:block"
      style={{
        opacity: transitioning ? 0 : 1,
        transition: 'opacity 0.4s ease, all 0.8s ease',
      }}
    >
      {/* WIDGET SAMURAI ORIGINAL (animations in globals.css) */}
      <div
        ref={katanaContainerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Cherry blossoms eliminados */}

        {/* Círculo de meditación sutil */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '110px', height: '110px',
          borderRadius: '50%',
          border: '1px solid rgba(124,58,237,0.08)',
          background: 'radial-gradient(circle, rgba(124,58,237,0.02) 0%, transparent 70%)',
        }}/>

        {/* Aura dinámica reactiva */}
        <div className="k-aura" style={{
          position: 'absolute',
          top: '15%', left: '15%', right: '15%', bottom: '15%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.auraColor} 0%, ${theme.auraColor.replace(/[\d.]+\)$/, '0.15)')} 30%, transparent 70%)`,
          border: `1px solid ${theme.auraColor.replace(/[\d.]+\)$/, '0.2)')}`,
          transition: 'background 0.8s ease, border 0.8s ease',
        }}/>

        {/* KATANA REACTIVA - color cambia según estado financiero */}
        <div
          className={`k-float k-glow ${isAlert ? 'katana-alert' : ''} ${isGold ? 'katana-gold' : ''}`}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            transformOrigin: 'center',
            zIndex: 10,
            filter: `drop-shadow(0 0 6px ${theme.glow}) drop-shadow(0 0 2px ${theme.glow})`,
            transition: 'filter 0.8s ease',
          }}
        >
          <svg width="90" height="90" viewBox="0 0 100 100">
            {/* Hoja larga y delgada — diagonal */}
            <rect x="48.5" y="2" width="3" height="65" rx="1.5"
              fill={theme.blade} transform="rotate(0 50 50)"
              style={{ transition: 'fill 0.8s ease' }}/>
            <rect x="49" y="2" width="1" height="63" rx="1"
              fill={theme.bladeEdge} opacity="0.8"
              transform="rotate(0 50 50)"
              style={{ transition: 'fill 0.8s ease' }}/>
            {/* Punta afilada */}
            <polygon points="47.5,2 51.5,2 50,0" fill={theme.bladeEdge}
              style={{ transition: 'fill 0.8s ease' }}/>
            {/* Hamon (línea de temple) sutil */}
            <path d="M 49 10 Q 50 20 49 30 Q 50 40 49 50 Q 50 60 49 65"
              fill="none" stroke={theme.glow} strokeWidth="0.5" opacity="0.5"
              style={{ transition: 'stroke 0.8s ease' }}/>
            {/* Tsuba más detallada */}
            <ellipse cx="50" cy="68" rx="10" ry="4" fill={theme.tsuba}
              style={{ transition: 'fill 0.8s ease' }}/>
            <ellipse cx="50" cy="68" rx="8" ry="3" fill={theme.tsuba} opacity="0.8"
              style={{ transition: 'fill 0.8s ease' }}/>
            {/* Mango con grip */}
            <rect x="47" y="71" width="6" height="22" rx="2" fill="#1A0A2E"/>
            {/* Ito (vendaje) diagonal */}
            <rect x="47" y="73" width="6" height="2" rx="0"
              fill="#4C1D95" opacity="0.8"/>
            <rect x="47" y="77" width="6" height="2" rx="0"
              fill="#4C1D95" opacity="0.8"/>
            <rect x="47" y="81" width="6" height="2" rx="0"
              fill="#4C1D95" opacity="0.8"/>
            <rect x="47" y="85" width="6" height="2" rx="0"
              fill="#4C1D95" opacity="0.8"/>
            {/* Kashira (pommel) */}
            <ellipse cx="50" cy="94" rx="5" ry="3" fill={theme.tsuba}
              style={{ transition: 'fill 0.8s ease' }}/>
            {/* Punto acento */}
            <circle cx="50" cy="96" r="2.5" fill={theme.glow}
              style={{ transition: 'fill 0.8s ease' }}/>
          </svg>
        </div>

        {/* Kanji auténticos de Bushido */}
        <div style={{
          position: 'absolute',
          right: '8px', top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'serif',
          fontSize: '11px',
          color: '#3B1D6E',
          lineHeight: '1.3',
          opacity: 0.7,
          textShadow: '0 0 6px rgba(124,58,237,0.4)',
          fontWeight: 'bold'
        }}>
          <div>武</div>
          <div>士</div>
          <div>道</div>
        </div>

        {/* Sombra bajo la katana - reactiva */}
        <div style={{
          position: 'absolute',
          bottom: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '3px',
          background: `radial-gradient(ellipse, ${theme.glow}, ${theme.auraColor}, transparent)`,
          borderRadius: '50%',
          opacity: 0.4,
          transition: 'background 0.8s ease',
        }}/>
      </div>

      {/* Status indicator - label del estado actual */}
      <div style={{
        textAlign: 'center',
        fontSize: '9px',
        fontWeight: 600,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: theme.statusColor,
        marginTop: '-4px',
        opacity: 0.8,
        transition: 'color 0.8s ease',
      }}>
        {theme.statusLabel}
      </div>

      {/* SEPARADOR DECORATIVO */}
      <div style={{
        borderTop: '1px solid rgba(76,29,149,0.4)',
        marginTop: '6px',
        paddingTop: '6px',
        position: 'relative',
      }}>
        {/* Ornamento central */}
        <div style={{
          position: 'absolute',
          top: '-4px', left: '50%',
          transform: 'translateX(-50%)',
          width: '6px', height: '6px',
          background: 'radial-gradient(circle, #7C3AED, #4C1D95)',
          borderRadius: '50%',
          border: '2px solid #1F2937',
          boxShadow: '0 0 6px rgba(124,58,237,0.5)'
        }}/>
      </div>

      {/* FRASES JAPONESAS REVERENTES */}
      <div style={{
        height: '54px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 6px',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
        marginTop: '2px',
      }}>
        {/* Frase */}
        <p style={{
          fontSize: '9.5px',
          color: '#E9D5FF',
          fontWeight: '500',
          fontStyle: 'italic',
          whiteSpace: 'pre-line',
          lineHeight: '1.4',
          textAlign: 'center',
          margin: 0,
        }}>
          {quotes[current].text}
        </p>
        {/* Romaji */}
        <p style={{
          fontSize: '7.5px',
          color: '#7C3AED',
          letterSpacing: '0.12em',
          marginTop: '3px',
          textTransform: 'uppercase',
        }}>
          {quotes[current].romaji}
        </p>
      </div>
    </div>
  )
}