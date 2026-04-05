'use client'
import { useState } from 'react'
import { SamuraiWidget } from './SamuraiWidget'

export function SamuraiContainer() {
  const [mode, setMode] = useState<'active' | 'zen'>('active')
  const [transitioning, setTransitioning] = useState(false)

  const handleModeChange = (newMode: 'active' | 'zen') => {
    if (newMode === mode) return
    setTransitioning(true)
    setTimeout(() => {
      setMode(newMode)
      setTransitioning(false)
    }, 400)
  }

  return (
    <div className="hidden lg:block">
      <div style={{
        filter: mode === 'zen'
          ? 'hue-rotate(200deg) saturate(0.6) brightness(0.8)'
          : 'none',
        transition: 'filter 1.2s ease'
      }}>
        <SamuraiWidget mode={mode} transitioning={transitioning} />
      </div>

      {/* TOGGLE COMPLETAMENTE REDISEÑADO */}
      <div style={{ padding: '4px 8px 10px' }}>

        {/* Label del modo actual */}
        <p style={{
          textAlign: 'center',
          fontSize: '8px',
          color: mode === 'active' ? '#84CC16' : '#9F7AEA',
          letterSpacing: '0.15em',
          marginBottom: '8px',
          fontWeight: '600',
          textTransform: 'uppercase',
          transition: 'color 0.5s ease',
        }}>
          {mode === 'active' ? '斬 · MODO BATALLA' : '瞑 · MODO MEDITACIÓN'}
        </p>

        {/* Botones toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 10, 30, 0.8)',
          borderRadius: '999px',
          border: '1px solid rgba(76, 29, 149, 0.3)',
          padding: '3px',
          gap: '2px',
        }}>
          <button
            onClick={() => handleModeChange('active')}
            style={{
              flex: 1,
              padding: '5px 8px',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: mode === 'active'
                ? 'linear-gradient(135deg, #6D28D9, #A855F7)'
                : 'transparent',
              color: mode === 'active' ? '#ffffff' : '#4C1D95',
              letterSpacing: '0.05em',
            }}>
            ⚔ 武
          </button>
          <button
            onClick={() => handleModeChange('zen')}
            style={{
              flex: 1,
              padding: '5px 8px',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: mode === 'zen'
                ? 'linear-gradient(135deg, #4C1D95, #7C3AED)'
                : 'transparent',
              color: mode === 'zen' ? '#EDE9FE' : '#4C1D95',
              letterSpacing: '0.05em',
            }}>
            ☯ 禅
          </button>
        </div>

        {/* Descripción debajo */}
        <p style={{
          textAlign: 'center',
          fontSize: '7px',
          color: '#2D1F4E',
          marginTop: '5px',
          letterSpacing: '0.08em',
        }}>
          {mode === 'active'
            ? 'Disciplina · Acción · Victoria'
            : 'Orden · Presupuesto · Control'}
        </p>

      </div>
    </div>
  )
}