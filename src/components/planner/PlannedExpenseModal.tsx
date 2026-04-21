'use client'

import { useState, useEffect } from 'react'
import { PlannedExpense, Category, RecurrenceType } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { X, Save } from 'lucide-react'
import { GradientButton } from '@/components/shared/GradientButton'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: (expense: PlannedExpense) => void
  categories: Category[]
  userId: string
  defaultDate: string
  editing?: PlannedExpense
}

export function PlannedExpenseModal({
  open,
  onClose,
  onSuccess,
  categories,
  userId,
  defaultDate,
  editing,
}: Props) {
  const supabase = createClient()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [plannedDate, setPlannedDate] = useState(defaultDate)
  const [categoryId, setCategoryId] = useState('')
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (editing) {
        setDescription(editing.description)
        setAmount(String(editing.amount))
        setPlannedDate(editing.planned_date)
        setCategoryId(editing.category_id || '')
        setRecurrence(editing.recurrence)
        setNotes(editing.notes || '')
      } else {
        setDescription('')
        setAmount('')
        setPlannedDate(defaultDate)
        setCategoryId(categories[0]?.id || '')
        setRecurrence('none')
        setNotes('')
      }
    }
  }, [open, editing, defaultDate, categories])

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Ingresa una descripción')
      return
    }
    const amountNum = parseInt(amount.replace(/\D/g, ''), 10)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Ingresa un monto válido')
      return
    }
    if (!plannedDate) {
      toast.error('Selecciona una fecha')
      return
    }

    setSaving(true)
    try {
      if (editing) {
        const { data, error } = await supabase
          .from('planned_expenses')
          .update({
            description: description.trim(),
            amount: amountNum,
            planned_date: plannedDate,
            category_id: categoryId || null,
            recurrence,
            notes: notes.trim() || null,
          })
          .eq('id', editing.id)
          .select('*, categories(*)')
          .single()

        if (error) throw error
        toast.success('Gasto actualizado')
        onSuccess(data as PlannedExpense)
      } else {
        const { data, error } = await supabase
          .from('planned_expenses')
          .insert({
            user_id: userId,
            description: description.trim(),
            amount: amountNum,
            planned_date: plannedDate,
            category_id: categoryId || null,
            recurrence,
            notes: notes.trim() || null,
          })
          .select('*, categories(*)')
          .single()

        if (error) throw error
        toast.success('Gasto planificado agregado')
        onSuccess(data as PlannedExpense)
      }
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-primary border border-surface-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <h2 className="text-lg font-bold text-text-primary">
            {editing ? 'Editar gasto planificado' : 'Nuevo gasto planificado'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Mantención auto, Arriendo, Netflix..."
              className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary outline-none focus:border-violet-500/50"
              autoFocus
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Monto (CLP)
              </label>
              <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-surface border border-surface-border">
                <span className="text-text-muted text-sm">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                  placeholder="150000"
                  className="flex-1 bg-transparent border-0 outline-none text-text-primary font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Fecha
              </label>
              <input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary outline-none focus:border-violet-500/50"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Categoría
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary outline-none focus:border-violet-500/50"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Recurrencia
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'none', label: 'Una vez' },
                { key: 'weekly', label: 'Semanal' },
                { key: 'monthly', label: 'Mensual' },
                { key: 'yearly', label: 'Anual' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRecurrence(key as RecurrenceType)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    recurrence === key
                      ? 'bg-violet-500/20 text-violet-light border border-violet-500/40'
                      : 'bg-surface border border-surface-border text-text-secondary hover:border-violet-500/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {recurrence !== 'none' && (
              <p className="text-[11px] text-text-muted mt-1.5">
                🔁 Se repetirá automáticamente {recurrence === 'weekly' ? 'cada semana' : recurrence === 'monthly' ? 'cada mes' : 'cada año'}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles adicionales..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-border text-text-primary outline-none focus:border-violet-500/50 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-5 border-t border-surface-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            Cancelar
          </button>
          <GradientButton onClick={handleSubmit} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Guardar'}
          </GradientButton>
        </div>
      </div>
    </div>
  )
}
