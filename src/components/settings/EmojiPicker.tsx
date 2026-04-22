'use client'

import { useState } from 'react'

const EMOJI_CATEGORIES = {
  Comida: ['🍔', '🍕', '🍜', '🥗', '🍣', '🍰', '☕', '🍺', '🍷', '🍎', '🥑', '🍞'],
  Transporte: ['🚗', '🚕', '🚌', '🚇', '🛵', '⛽', '🚲', '✈️', '🚆', '🛺'],
  Casa: ['🏠', '🛋️', '🛏️', '🚿', '💡', '🧹', '🪴', '🪑', '🔑'],
  Salud: ['💊', '🏥', '👨‍⚕️', '🏋️', '🧘', '🦷', '👓', '❤️'],
  Compras: ['🛍️', '👕', '👟', '💄', '💍', '🎁', '📦'],
  Entretenimiento: ['🎬', '🎮', '🎵', '🎟️', '📚', '🎨', '🎤', '🎪'],
  Tecnología: ['💻', '📱', '🎧', '📷', '🖥️', '⌚', '🖨️'],
  Dinero: ['💰', '💵', '💳', '🏦', '📈', '📉', '💸'],
  Trabajo: ['💼', '📊', '📝', '📎', '📅', '📞'],
  Otros: ['📁', '⭐', '❓', '✨', '🔥', '🎯', '💡', '🌟', '💎'],
}

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Otros')

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-11 h-11 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-xl hover:border-violet-primary transition-colors"
      >
        {value}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Picker */}
          <div className="absolute top-full mt-2 left-0 z-50 w-80 max-w-[calc(100vw-32px)] bg-surface-primary border border-surface-border rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-200">
            {/* Category tabs */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-2 border-b border-surface-border/50">
              {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-violet-500/20 text-violet-light'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Emoji grid */}
            <div className="grid grid-cols-6 gap-1 max-h-64 overflow-y-auto">
              {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onChange(emoji)
                    setOpen(false)
                  }}
                  className={`aspect-square rounded-lg text-xl hover:bg-violet-500/10 transition-colors ${
                    value === emoji ? 'bg-violet-500/20 ring-2 ring-violet-500' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
