'use client'

import { useState, useEffect } from 'react'
import { formatCLP } from '@/lib/utils/currency'
import { Target, Edit2, Check, X } from 'lucide-react'

interface SavingsGoalProps {
  currentSavings: number
  isHidden?: boolean
}

const STORAGE_KEY = 'katana-savings-goal'

export function SavingsGoal({ currentSavings, isHidden = false }: SavingsGoalProps) {
  const [goal, setGoal] = useState<number>(0)
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = parseInt(stored, 10)
      if (!isNaN(parsed)) setGoal(parsed)
    }
  }, [])

  const handleSave = () => {
    const value = parseInt(inputValue.replace(/\D/g, ''), 10)
    if (!isNaN(value) && value > 0) {
      setGoal(value)
      localStorage.setItem(STORAGE_KEY, String(value))
      setEditing(false)
      setInputValue('')
    }
  }

  const startEditing = () => {
    setInputValue(String(goal || ''))
    setEditing(true)
  }

  if (!mounted) return null

  const progress = goal > 0 ? Math.min(Math.max((currentSavings / goal) * 100, 0), 100) : 0
  const isAchieved = currentSavings >= goal && goal > 0
  const remaining = Math.max(goal - currentSavings, 0)

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-violet-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">Meta de ahorro mensual</p>
            <p className="text-xs text-text-muted">
              {goal > 0 ? (isAchieved ? '🎉 ¡Meta alcanzada!' : 'Vas bien, samurai') : 'Define tu meta'}
            </p>
          </div>
        </div>

        {!editing && (
          <button
            onClick={startEditing}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-violet-light hover:bg-violet-light/10 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1 px-3 py-2 rounded-lg bg-surface border border-surface-border">
            <span className="text-text-muted text-sm">$</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
              placeholder="200000"
              autoFocus
              className="flex-1 bg-transparent border-0 outline-none text-text-primary font-mono"
            />
          </div>
          <button
            onClick={handleSave}
            className="p-2 rounded-lg bg-bamboo-take/20 text-bamboo-take hover:bg-bamboo-take/30 transition-colors"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setEditing(false)
              setInputValue('')
            }}
            className="p-2 rounded-lg bg-vermillion-shu/20 text-vermillion-shu hover:bg-vermillion-shu/30 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : goal > 0 ? (
        <>
          <div className="flex items-baseline justify-between mb-2">
            <span className={`text-2xl font-black font-mono ${isAchieved ? 'text-bamboo-take' : 'text-text-primary'}`}>
              {isHidden ? '•••••' : formatCLP(currentSavings)}
            </span>
            <span className="text-sm font-mono text-text-muted">
              / {isHidden ? '•••••' : formatCLP(goal)}
            </span>
          </div>

          <div className="h-3 bg-surface-border rounded-full overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-700 ${
                isAchieved
                  ? 'bg-gradient-to-r from-bamboo-take to-green-400'
                  : 'bg-gradient-to-r from-violet-500 to-indigo-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted font-mono">{Math.round(progress)}% completado</span>
            {!isAchieved && (
              <span className="text-text-secondary">
                Faltan {isHidden ? '•••••' : formatCLP(remaining)}
              </span>
            )}
          </div>
        </>
      ) : (
        <button
          onClick={startEditing}
          className="w-full py-4 rounded-xl border-2 border-dashed border-surface-border hover:border-violet-500/40 hover:bg-violet-500/5 transition-all group"
        >
          <span className="text-sm text-text-muted group-hover:text-violet-300 transition-colors">
            + Define tu meta mensual
          </span>
        </button>
      )}
    </div>
  )
}
