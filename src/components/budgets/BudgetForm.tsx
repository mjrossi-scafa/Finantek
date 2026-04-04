'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types/database'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { GradientButton } from '@/components/shared/GradientButton'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface BudgetFormProps {
  categories: Category[]
  userId: string
  onSuccess?: () => void
}

const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
]

export function BudgetForm({ categories, userId, onSuccess }: BudgetFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [periodType, setPeriodType] = useState<'monthly' | 'annual'>('monthly')
  const [amount, setAmount] = useState(0)
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const selectClasses = "h-12 bg-surface border-surface-border text-text-primary rounded-xl focus:border-violet-primary focus:ring-violet-primary/20"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryId) { toast.error('Selecciona una categoria'); return }
    if (!amount || amount <= 0) { toast.error('Ingresa un monto valido'); return }

    setLoading(true)
    const { error } = await supabase.from('budgets').upsert({
      user_id: userId,
      category_id: categoryId,
      period_type: periodType,
      amount,
      year,
      month: periodType === 'monthly' ? month : null,
    }, {
      onConflict: 'user_id,category_id,period_type,year,month',
    })

    if (error) {
      toast.error('Error al guardar', { description: error.message })
    } else {
      toast.success('Presupuesto guardado')
      await fetch('/api/achievements/check', {
        method: 'POST',
        body: JSON.stringify({ trigger: 'budget_saved' }),
        headers: { 'Content-Type': 'application/json' },
      })
      onSuccess?.()
      router.refresh()
    }
    setLoading(false)
  }

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-text-secondary text-sm font-medium">Categoría</Label>
        <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')}>
          <SelectTrigger className={selectClasses}>
            <SelectValue placeholder="Selecciona categoría de gasto" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.icon} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-text-secondary text-sm font-medium">Periodo</Label>
        <div className="flex rounded-xl overflow-hidden border border-surface-border">
          <button
            type="button"
            onClick={() => setPeriodType('monthly')}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 ${periodType === 'monthly' ? 'gradient-primary text-white' : 'bg-surface text-text-tertiary hover:bg-surface-hover'}`}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setPeriodType('annual')}
            className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 ${periodType === 'annual' ? 'gradient-primary text-white' : 'bg-surface text-text-tertiary hover:bg-surface-hover'}`}
          >
            Anual
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <Label className="text-text-secondary text-sm font-medium">Ano</Label>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v ?? year))}>
            <SelectTrigger className={selectClasses}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {periodType === 'monthly' && (
          <div className="flex-1 space-y-2">
            <Label className="text-text-secondary text-sm font-medium">Mes</Label>
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v ?? month))}>
              <SelectTrigger className={selectClasses}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-text-secondary text-sm font-medium">Limite de presupuesto (CLP)</Label>
        <CurrencyInput value={amount} onChange={setAmount} />
      </div>

      <GradientButton type="submit" loading={loading} fullWidth>
        Guardar presupuesto
      </GradientButton>
    </form>
  )
}
