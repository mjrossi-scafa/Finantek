'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types/database'
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
import { toast } from 'sonner'
import { toDateStr } from '@/lib/utils/dates'

interface TransactionFormProps {
  categories: Category[]
  userId: string
}

export function TransactionForm({ categories, userId }: TransactionFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState(0)
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(toDateStr(new Date()))

  const filteredCategories = categories.filter((c) => c.type === type)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || amount <= 0) {
      toast.error('Ingresa un monto valido')
      return
    }
    if (!categoryId) {
      toast.error('Selecciona una categoria')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('transactions').insert({
      user_id: userId,
      type,
      amount,
      category_id: categoryId,
      description: description || null,
      notes: notes || null,
      transaction_date: date,
      source: 'manual',
    })

    if (error) {
      toast.error('Error al guardar', { description: error.message })
    } else {
      toast.success('Transaccion registrada')
      await fetch('/api/achievements/check', {
        method: 'POST',
        body: JSON.stringify({ trigger: 'transaction_created' }),
        headers: { 'Content-Type': 'application/json' },
      })
      router.push('/transactions')
      router.refresh()
    }
    setLoading(false)
  }

  const inputClasses = "h-12 bg-surface border-surface-border text-text-primary placeholder:text-text-tertiary rounded-xl focus:border-violet-primary focus:ring-violet-primary/20"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type toggle */}
      <div className="space-y-2">
        <Label className="text-text-secondary text-sm font-medium">Tipo</Label>
        <div className="flex rounded-xl overflow-hidden border border-surface-border">
          <button
            type="button"
            onClick={() => { setType('expense'); setCategoryId('') }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 ${
              type === 'expense'
                ? 'bg-danger text-white'
                : 'bg-surface text-text-tertiary hover:bg-surface-hover'
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => { setType('income'); setCategoryId('') }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 ${
              type === 'income'
                ? 'bg-success text-white'
                : 'bg-surface text-text-tertiary hover:bg-surface-hover'
            }`}
          >
            Ingreso
          </button>
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-text-secondary text-sm font-medium">Monto (CLP)</Label>
        <CurrencyInput id="amount" value={amount} onChange={setAmount} />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className="text-text-secondary text-sm font-medium">Categoria</Label>
        <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
          <SelectTrigger className={inputClasses}>
            <SelectValue placeholder="Selecciona una categoria" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span className="flex items-center gap-2">
                  {c.icon} {c.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date" className="text-text-secondary text-sm font-medium">Fecha</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClasses}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-text-secondary text-sm font-medium">Descripcion</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Almuerzo en restaurante"
          className={inputClasses}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-text-secondary text-sm font-medium">Notas (opcional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Detalles adicionales..."
          rows={3}
          className="bg-surface border-surface-border text-text-primary placeholder:text-text-tertiary rounded-xl focus:border-violet-primary focus:ring-violet-primary/20"
        />
      </div>

      <div className="flex gap-3">
        <GradientButton variant="outline" onClick={() => router.back()} className="flex-1">
          Cancelar
        </GradientButton>
        <GradientButton type="submit" loading={loading} className="flex-1">
          Guardar transaccion
        </GradientButton>
      </div>
    </form>
  )
}
