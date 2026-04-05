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

      <div className="flex items-center justify-center gap-3 pb-3">
        <button
          onClick={() => setMode('active')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all duration-300 ${
            mode === 'active'
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              : 'text-gray-600 hover:text-gray-400'
          }`}>
          <span>⚔</span>
          <span>Activo</span>
        </button>
        <button
          onClick={() => setMode('zen')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all duration-300 ${
            mode === 'zen'
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              : 'text-gray-600 hover:text-gray-400'
          }`}>
          <span>☯</span>
          <span>Zen</span>
        </button>
      </div>
    </div>
  )
}