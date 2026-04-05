'use client'
import { useState, useEffect } from 'react'

const quotes = [
  {
    text: '"No gastes sin intención"',
    mode: 'SERIO',
    color: '#C084FC',
    border: '#4C1D95'
  },
  {
    text: '"Cada peso, una victoria"',
    mode: 'VICTORIA',
    color: '#84CC16',
    border: '#3F6212'
  },
  {
    text: '"Ahorra hoy, domina mañana"',
    mode: 'ESTRATEGIA',
    color: '#A855F7',
    border: '#6D28D9'
  },
  {
    text: '"El guerrero planifica\nantes de gastar"',
    mode: 'MEDITACIÓN',
    color: '#C084FC',
    border: '#4C1D95'
  },
]

export function SamuraiQuotes() {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % quotes.length)
        setVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const quote = quotes[current]

  return (
    <div className="px-1 pb-2 mt-1">
      <div className="h-px bg-purple-900/40 mb-3"/>

      <div
        className="text-center transition-opacity duration-500"
        style={{ opacity: visible ? 1 : 0 }}>
        <p
          className="text-[9px] font-medium leading-relaxed whitespace-pre-line"
          style={{ color: quote.color }}>
          {quote.text}
        </p>
        <p
          className="text-[7px] mt-1 tracking-widest uppercase"
          style={{ color: '#3B1D6E' }}>
          — {quote.mode}
        </p>
      </div>

      <div className="h-px bg-purple-900/40 mt-3"/>
      <p
        className="text-center text-[7px] mt-2 tracking-wider"
        style={{ color: '#3B1D6E' }}>
        武士道 · Bushido
      </p>
    </div>
  )
}