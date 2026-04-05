'use client'
import { useState } from 'react'
import { SamuraiWidget } from './SamuraiWidget'

export function SamuraiContainer() {
  const [mode, setMode] = useState<'active' | 'zen'>('active')

  return (
    <div className="hidden lg:block">
      <div style={{
        filter: mode === 'zen'
          ? 'hue-rotate(200deg) saturate(0.6) brightness(0.8)'
          : 'none',
        transition: 'filter 1.2s ease'
      }}>
        <SamuraiWidget />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        padding: '4px 8px 8px',
      }}>
        <button
          onClick={() => setMode('active')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '10px',
            border: mode === 'active'
              ? '1px solid rgba(168,85,247,0.5)'
              : '1px solid transparent',
            background: mode === 'active'
              ? 'rgba(109,40,217,0.3)'
              : 'transparent',
            color: mode === 'active' ? '#C084FC' : '#3B1D6E',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}>
          ⚔ 武
        </button>
        <button
          onClick={() => setMode('zen')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: '999px',
            fontSize: '10px',
            border: mode === 'zen'
              ? '1px solid rgba(168,85,247,0.5)'
              : '1px solid transparent',
            background: mode === 'zen'
              ? 'rgba(109,40,217,0.3)'
              : 'transparent',
            color: mode === 'zen' ? '#C084FC' : '#3B1D6E',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}>
          ☯ 禅
        </button>
      </div>
    </div>
  )
}