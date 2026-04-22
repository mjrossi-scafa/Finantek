'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Transaction, Category, Trip } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { formatCurrency } from '@/lib/utils/exchangeRates'
import { toDateStr } from '@/lib/utils/dates'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { GradientButton } from '@/components/shared/GradientButton'
import { Button } from '@/components/ui/button'
import { Trash2, Calendar, Plane } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface EditTransactionModalProps {
  open: boolean
  onClose: () => void
  transaction?: Transaction & { categories?: Category }
  categories: Category[]
  userId: string
  onSuccess: () => void
  mode: 'create' | 'edit'
  activeTrip?: Trip | null
}

export function EditTransactionModal({
  open,
  onClose,
  transaction,
  categories,
  userId,
  onSuccess,
  mode,
  activeTrip
}: EditTransactionModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Form state
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState(0)
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(toDateStr(new Date()))
  const [includeInTrip, setIncludeInTrip] = useState(false)
  const [amountIsForeign, setAmountIsForeign] = useState(false)

  const tripHasForeignCurrency = !!activeTrip && activeTrip.currency !== 'CLP'
  const dateInTripRange = !!activeTrip && date >= activeTrip.start_date && date <= activeTrip.end_date

  // Initialize form when transaction changes
  useEffect(() => {
    if (mode === 'edit' && transaction) {
      setType(transaction.type)
      setAmount(transaction.original_amount ?? transaction.amount)
      setCategoryId(transaction.category_id)
      setDescription(transaction.description || '')
      setNotes(transaction.notes || '')
      setDate(transaction.transaction_date)
      setIncludeInTrip(!!transaction.trip_id)
      setAmountIsForeign(!!transaction.original_currency && transaction.original_currency !== 'CLP')
    } else if (mode === 'create') {
      setType('expense')
      setAmount(0)
      setCategoryId('')
      setDescription('')
      setNotes('')
      setDate(toDateStr(new Date()))
      setIncludeInTrip(false)
      setAmountIsForeign(false)
    }
  }, [mode, transaction])

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setType('expense')
      setAmount(0)
      setCategoryId('')
      setDescription('')
      setNotes('')
      setDate(toDateStr(new Date()))
      setIncludeInTrip(false)
      setAmountIsForeign(false)
    }
  }, [open])

  // Auto-toggle "incluir en viaje" when creating a transaction whose date falls in range
  useEffect(() => {
    if (mode !== 'create' || !activeTrip) return
    if (dateInTripRange) {
      setIncludeInTrip(true)
      if (tripHasForeignCurrency) setAmountIsForeign(true)
    }
  }, [mode, activeTrip, dateInTripRange, tripHasForeignCurrency])

  const filteredCategories = categories.filter((c) => c.type === type)

  // Reset category if switching type and current category doesn't match
  useEffect(() => {
    if (categoryId && !filteredCategories.find(c => c.id === categoryId)) {
      setCategoryId('')
    }
  }, [type, categoryId, filteredCategories])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || amount <= 0) {
      toast.error('Ingresa un monto válido')
      return
    }
    if (!categoryId) {
      toast.error('Selecciona una categoría')
      return
    }
    if (!description.trim()) {
      toast.error('Ingresa una descripción')
      return
    }

    setLoading(true)
    try {
      let amountCLP = amount
      let originalAmount: number | null = null
      let originalCurrency: string | null = null
      let tripId: string | null = null

      if (includeInTrip && activeTrip) {
        tripId = activeTrip.id
        if (tripHasForeignCurrency && amountIsForeign) {
          originalAmount = amount
          originalCurrency = activeTrip.currency
          amountCLP = Math.round(amount * activeTrip.exchange_rate)
        }
      }

      const transactionData = {
        user_id: userId,
        category_id: categoryId,
        type,
        amount: amountCLP,
        description: description.trim(),
        notes: notes.trim() || null,
        transaction_date: date,
        source: 'manual' as const,
        trip_id: tripId,
        original_amount: originalAmount,
        original_currency: originalCurrency,
      }

      if (mode === 'create') {
        const { error } = await supabase
          .from('transactions')
          .insert([transactionData])

        if (error) throw error
        toast.success(
          tripId
            ? `Transacción agregada al viaje ${activeTrip?.emoji ?? ''} ${activeTrip?.name ?? ''}`.trim()
            : 'Transacción agregada'
        )
      } else if (mode === 'edit' && transaction) {
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', transaction.id)

        if (error) throw error
        toast.success('Transacción actualizada')
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error(mode === 'create' ? 'Error al crear la transacción' : 'Error al actualizar la transacción')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!transaction || mode !== 'edit') return

    setDeleteLoading(true)
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transaction.id)

      if (error) throw error

      toast.success('Transacción eliminada')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar la transacción')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nueva transacción' : 'Editar transacción'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="flex rounded-xl bg-surface-secondary p-1">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  type === 'expense'
                    ? 'bg-surface-primary text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  type === 'income'
                    ? 'bg-surface-primary text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Ingreso
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿En qué gastaste?"
              className="bg-surface-secondary border-surface-border"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Monto {amountIsForeign && activeTrip ? `(${activeTrip.currency})` : '(CLP)'}
            </Label>
            <CurrencyInput
              value={amount}
              onChange={setAmount}
              className="bg-surface-secondary border-surface-border"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={categoryId} onValueChange={(value) => setCategoryId(value || '')}>
              <SelectTrigger className="bg-surface-secondary border-surface-border">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-surface-secondary border-surface-border pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            </div>
          </div>

          {/* Trip association */}
          {activeTrip && (
            <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInTrip}
                  onChange={(e) => setIncludeInTrip(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-violet-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-text-primary">
                    <Plane className="h-3.5 w-3.5 text-violet-light" />
                    Incluir en viaje: {activeTrip.emoji} {activeTrip.name}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    {dateInTripRange
                      ? 'La fecha está dentro del viaje'
                      : `Fuera del rango ${activeTrip.start_date} → ${activeTrip.end_date}`}
                  </p>
                </div>
              </label>

              {includeInTrip && tripHasForeignCurrency && (
                <div className="pl-7 space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={amountIsForeign}
                      onChange={(e) => setAmountIsForeign(e.target.checked)}
                      className="h-3.5 w-3.5 rounded accent-violet-500"
                    />
                    <span className="text-text-secondary">
                      El monto está en {activeTrip.currency}
                    </span>
                  </label>
                  {amountIsForeign && amount > 0 && (
                    <p className="text-[11px] text-text-muted font-mono">
                      {formatCurrency(amount, activeTrip.currency)} ≈ {formatCLP(Math.round(amount * activeTrip.exchange_rate))}
                      <span className="ml-1 opacity-60">(tasa {activeTrip.exchange_rate})</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agrega una nota..."
              rows={3}
              className="bg-surface-secondary border-surface-border resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <GradientButton
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Guardando...' : mode === 'create' ? 'Agregar transacción' : 'Guardar cambios'}
            </GradientButton>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="px-6"
            >
              Cancelar
            </Button>
          </div>

          {/* Delete button for edit mode */}
          {mode === 'edit' && transaction && (
            <div className="border-t border-surface-border pt-4 mt-6">
              <AlertDialog>
                <AlertDialogTrigger
                  className="w-full inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-danger hover:text-danger hover:bg-danger/10 transition-colors disabled:pointer-events-none disabled:opacity-50"
                  disabled={deleteLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar transacción
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. La transacción será eliminada permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-danger hover:bg-danger/90"
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? 'Eliminando...' : 'Eliminar'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}