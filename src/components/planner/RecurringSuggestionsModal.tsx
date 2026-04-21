'use client'

import { useState, useEffect } from 'react'
import { PlannedExpense, Category } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { formatCLP } from '@/lib/utils/currency'
import { toast } from 'sonner'
import { X, Sparkles, Check } from 'lucide-react'
import { GradientButton } from '@/components/shared/GradientButton'
import { RecurringSuggestion } from '@/lib/planner/detectRecurring'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: (created: PlannedExpense[]) => void
  suggestions: RecurringSuggestion[]
  categories: Category[]
  userId: string
}

export function RecurringSuggestionsModal({
  open,
  onClose,
  onSuccess,
  suggestions,
  categories,
  userId,
}: Props) {
  const supabase = createClient()
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)

  // Select all by default when opening
  useEffect(() => {
    if (open) {
      setSelected(new Set(suggestions.map((_, i) => i)))
    }
  }, [open, suggestions])

  const toggleSelection = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === suggestions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(suggestions.map((_, i) => i)))
    }
  }

  const getNextOccurrenceDate = (dayOfMonth: number): string => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()
    const currentDay = today.getDate()

    // If this month's day already passed, use next month
    const targetMonth = dayOfMonth >= currentDay ? currentMonth : currentMonth + 1
    const targetDate = new Date(currentYear, targetMonth, dayOfMonth)
    return targetDate.toISOString().split('T')[0]
  }

  const handleCreate = async () => {
    if (selected.size === 0) {
      toast.error('Selecciona al menos una sugerencia')
      return
    }

    setSaving(true)
    try {
      const toCreate = Array.from(selected).map((idx) => {
        const s = suggestions[idx]
        return {
          user_id: userId,
          description: s.description,
          amount: s.amount,
          planned_date: getNextOccurrenceDate(s.dayOfMonth),
          category_id: s.categoryId,
          recurrence: 'monthly' as const,
          notes: `✨ Auto-detectado desde ${s.occurrences} transacciones recurrentes`,
        }
      })

      const { data, error } = await supabase
        .from('planned_expenses')
        .insert(toCreate)
        .select('*, categories(*)')

      if (error) throw error

      onSuccess((data || []) as PlannedExpense[])
    } catch (err) {
      console.error(err)
      toast.error('Error al crear gastos planificados')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const totalSelected = Array.from(selected).reduce(
    (sum, idx) => sum + suggestions[idx].amount,
    0
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] bg-surface-primary border border-surface-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Gastos recurrentes detectados</h2>
              <p className="text-xs text-text-muted">
                Basado en tus últimos 3 meses de transacciones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Select all */}
        {suggestions.length > 0 && (
          <div className="px-5 py-3 border-b border-surface-border flex items-center justify-between">
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm text-violet-light hover:text-violet-primary transition-colors"
            >
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  selected.size === suggestions.length
                    ? 'bg-violet-500 border-violet-500'
                    : selected.size > 0
                      ? 'bg-violet-500/50 border-violet-500'
                      : 'border-surface-border'
                }`}
              >
                {selected.size === suggestions.length && <Check className="h-3 w-3 text-white" />}
                {selected.size > 0 && selected.size < suggestions.length && (
                  <div className="w-2 h-0.5 bg-white rounded" />
                )}
              </div>
              <span>
                {selected.size === 0
                  ? 'Seleccionar todos'
                  : selected.size === suggestions.length
                    ? 'Deseleccionar todos'
                    : `${selected.size} de ${suggestions.length} seleccionados`}
              </span>
            </button>
          </div>
        )}

        {/* Suggestions list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-sm text-text-muted">
                No detectamos gastos recurrentes aún
              </p>
              <p className="text-xs text-text-muted mt-2">
                Necesitas al menos 2 meses de transacciones con el mismo monto y día.
              </p>
            </div>
          ) : (
            suggestions.map((s, i) => {
              const isSelected = selected.has(i)
              return (
                <button
                  key={i}
                  onClick={() => toggleSelection(i)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-violet-500/10 border border-violet-500/40'
                      : 'bg-surface-secondary border border-surface-border hover:border-violet-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-violet-500 border-violet-500'
                          : 'border-surface-border'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>

                    {/* Category icon */}
                    <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-sm flex-shrink-0">
                      {s.categoryIcon || '💸'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-text-primary truncate">
                        {s.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-text-muted">
                          📅 Día {s.dayOfMonth}
                        </span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="text-xs text-text-muted">
                          Detectado {s.occurrences} veces
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <span className="font-mono font-bold text-sm text-vermillion-shu flex-shrink-0">
                      {formatCLP(s.amount)}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        {suggestions.length > 0 && (
          <div className="p-5 border-t border-surface-border">
            {selected.size > 0 && (
              <p className="text-xs text-text-muted mb-3 text-center">
                Se crearán {selected.size}{' '}
                {selected.size === 1 ? 'gasto planificado mensual' : 'gastos planificados mensuales'} por{' '}
                <span className="font-mono font-semibold text-violet-light">
                  {formatCLP(totalSelected)}
                </span>
              </p>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                Cancelar
              </button>
              <GradientButton onClick={handleCreate} disabled={saving || selected.size === 0}>
                <Sparkles className="h-4 w-4 mr-2" />
                {saving ? 'Creando...' : `Agregar ${selected.size > 0 ? selected.size : ''}`}
              </GradientButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
