'use client'

import { useState, useEffect, useMemo } from 'react'
import { Category, Budget, Transaction } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { formatCLP } from '@/lib/utils/currency'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sparkles, Check, TrendingUp } from 'lucide-react'
import { GradientButton } from '@/components/shared/GradientButton'

interface Suggestion {
  categoryId: string
  categoryName: string
  categoryIcon: string | null
  avgMonthly: number
  monthsWithData: number
  suggestedAmount: number
}

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  categories: Category[]
  historicalTransactions: Pick<Transaction, 'category_id' | 'amount' | 'transaction_date'>[]
  existingBudgets: Budget[]
  userId: string
  year: number
  month: number
}

export function SuggestionsModal({
  open,
  onClose,
  onSuccess,
  categories,
  historicalTransactions,
  existingBudgets,
  userId,
  year,
  month,
}: Props) {
  const supabase = createClient()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  // Calculate average spending per category from historical data
  const suggestions = useMemo<Suggestion[]>(() => {
    // Group transactions by category and month
    const byCategoryMonth = new Map<string, Map<string, number>>()

    for (const tx of historicalTransactions) {
      if (!tx.category_id) continue
      const monthKey = tx.transaction_date.slice(0, 7) // YYYY-MM

      if (!byCategoryMonth.has(tx.category_id)) {
        byCategoryMonth.set(tx.category_id, new Map())
      }
      const catMap = byCategoryMonth.get(tx.category_id)!
      catMap.set(monthKey, (catMap.get(monthKey) || 0) + tx.amount)
    }

    const existingCategoryIds = new Set(
      existingBudgets
        .filter((b) => b.period_type === 'monthly' && b.year === year && b.month === month)
        .map((b) => b.category_id)
    )

    const result: Suggestion[] = []

    for (const [categoryId, monthMap] of byCategoryMonth) {
      if (existingCategoryIds.has(categoryId)) continue

      const category = categories.find((c) => c.id === categoryId && c.type === 'expense')
      if (!category) continue

      const amounts = Array.from(monthMap.values())
      if (amounts.length < 1) continue

      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length
      // Suggest 10% above average for buffer
      const suggested = Math.round((avg * 1.1) / 1000) * 1000 // round to nearest 1000

      result.push({
        categoryId,
        categoryName: category.name,
        categoryIcon: category.icon,
        avgMonthly: Math.round(avg),
        monthsWithData: amounts.length,
        suggestedAmount: suggested,
      })
    }

    return result.sort((a, b) => b.suggestedAmount - a.suggestedAmount)
  }, [historicalTransactions, categories, existingBudgets, year, month])

  useEffect(() => {
    if (open) {
      setSelected(new Set(suggestions.map((s) => s.categoryId)))
    }
  }, [open, suggestions])

  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === suggestions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(suggestions.map((s) => s.categoryId)))
    }
  }

  const handleCreate = async () => {
    if (selected.size === 0) {
      toast.error('Selecciona al menos una sugerencia')
      return
    }

    setSaving(true)
    try {
      const toCreate = Array.from(selected)
        .map((catId) => {
          const s = suggestions.find((x) => x.categoryId === catId)
          if (!s) return null
          return {
            user_id: userId,
            category_id: catId,
            period_type: 'monthly' as const,
            amount: s.suggestedAmount,
            year,
            month,
          }
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)

      const { error } = await supabase.from('budgets').insert(toCreate)
      if (error) throw error

      toast.success(`✨ ${toCreate.length} ${toCreate.length === 1 ? 'presupuesto creado' : 'presupuestos creados'}`)
      onSuccess()
    } catch (err) {
      toast.error('Error al crear', { description: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const totalSelected = Array.from(selected).reduce((sum, catId) => {
    const s = suggestions.find((x) => x.categoryId === catId)
    return sum + (s?.suggestedAmount || 0)
  }, 0)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-light" />
            Sugerencias de presupuesto
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-text-muted">
          Basado en tus últimos 3 meses de gastos. Se sugiere 10% extra sobre el promedio para tener margen.
        </p>

        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm text-text-muted">
              No hay suficiente historial para sugerir presupuestos
            </p>
            <p className="text-xs text-text-muted mt-2">
              Registra gastos durante al menos un mes para ver sugerencias.
            </p>
          </div>
        ) : (
          <>
            <div className="border-b border-surface-border pb-2">
              <button
                onClick={toggleAll}
                className="flex items-center gap-2 text-sm text-violet-light hover:text-violet-primary"
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
                    ? 'Seleccionar todas'
                    : `${selected.size} de ${suggestions.length} seleccionadas`}
                </span>
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-2">
              {suggestions.map((s) => {
                const isSelected = selected.has(s.categoryId)
                return (
                  <button
                    key={s.categoryId}
                    onClick={() => toggleSelection(s.categoryId)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-violet-500/10 border border-violet-500/40'
                        : 'bg-surface-secondary border border-surface-border hover:border-violet-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'bg-violet-500 border-violet-500'
                            : 'border-surface-border'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>

                      <div className="text-xl flex-shrink-0">{s.categoryIcon || '💰'}</div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-text-primary">{s.categoryName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-text-muted">
                            Promedio: {formatCLP(s.avgMonthly)}
                          </span>
                          <span className="text-xs text-text-muted">·</span>
                          <span className="text-xs text-text-muted">
                            {s.monthsWithData} {s.monthsWithData === 1 ? 'mes' : 'meses'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="font-mono font-bold text-sm text-violet-light">
                          {formatCLP(s.suggestedAmount)}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <TrendingUp className="h-3 w-3 text-bamboo-take" />
                          <span className="text-[10px] text-bamboo-take">+10% margen</span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="border-t border-surface-border pt-3 space-y-3">
              {selected.size > 0 && (
                <p className="text-xs text-text-muted text-center">
                  Total a presupuestar:{' '}
                  <span className="font-mono font-semibold text-violet-light">
                    {formatCLP(totalSelected)}
                  </span>
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  Cancelar
                </button>
                <GradientButton onClick={handleCreate} disabled={saving || selected.size === 0}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {saving ? 'Creando...' : `Crear ${selected.size || ''}`}
                </GradientButton>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
