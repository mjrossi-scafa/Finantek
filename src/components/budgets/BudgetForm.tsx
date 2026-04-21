'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category, Budget } from '@/types/database'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { GradientButton } from '@/components/shared/GradientButton'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

interface BudgetFormProps {
  categories: Category[]
  userId: string
  editing?: Budget
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

export function BudgetForm({ categories, userId, editing, onSuccess }: BudgetFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const now = new Date()
  const [categoryId, setCategoryId] = useState(editing?.category_id || '')
  const [periodType, setPeriodType] = useState<'monthly' | 'annual'>(editing?.period_type || 'monthly')
  const [amount, setAmount] = useState(editing?.amount || 0)
  const [year, setYear] = useState(editing?.year || now.getFullYear())
  const [month, setMonth] = useState(editing?.month || now.getMonth() + 1)
  const [alert80, setAlert80] = useState(editing?.alert_80 ?? true)
  const [alert100, setAlert100] = useState(editing?.alert_100 ?? true)

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const selectClasses = "h-12 bg-surface border-surface-border text-text-primary rounded-xl focus:border-violet-primary focus:ring-violet-primary/20"
  const isEditing = !!editing

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!categoryId) { toast.error('Selecciona una categoria'); return }
    if (!amount || amount <= 0) { toast.error('Ingresa un monto valido'); return }

    setLoading(true)
    let error

    if (isEditing && editing) {
      // UPDATE existing budget
      const result = await supabase
        .from('budgets')
        .update({
          amount,
          alert_80: alert80,
          alert_100: alert100,
        })
        .eq('id', editing.id)
      error = result.error
    } else {
      // UPSERT new budget
      const result = await supabase.from('budgets').upsert({
        user_id: userId,
        category_id: categoryId,
        period_type: periodType,
        amount,
        year,
        month: periodType === 'monthly' ? month : null,
        alert_80: alert80,
        alert_100: alert100,
      }, {
        onConflict: 'user_id,category_id,period_type,year,month',
      })
      error = result.error
    }

    if (error) {
      toast.error('Error al guardar', { description: error.message })
    } else {
      toast.success(isEditing ? 'Presupuesto actualizado' : 'Presupuesto guardado')
      if (!isEditing) {
        await fetch('/api/achievements/check', {
          method: 'POST',
          body: JSON.stringify({ trigger: 'budget_saved' }),
          headers: { 'Content-Type': 'application/json' },
        })
      }
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
        <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? '')} disabled={isEditing}>
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
        {isEditing && (
          <p className="text-xs text-text-muted">Para cambiar la categoría, elimina y crea un nuevo presupuesto.</p>
        )}
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
        <Label className="text-text-secondary text-sm font-medium">Límite de presupuesto (CLP)</Label>
        <CurrencyInput value={amount} onChange={setAmount} />
      </div>

      {/* Alert thresholds */}
      <div className="space-y-2">
        <Label className="text-text-secondary text-sm font-medium flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5" />
          Alertas
        </Label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-surface-border cursor-pointer hover:border-violet-500/30 transition-colors">
            <input
              type="checkbox"
              checked={alert80}
              onChange={(e) => setAlert80(e.target.checked)}
              className="h-4 w-4 rounded border-surface-border text-violet-500 focus:ring-violet-500"
            />
            <div className="flex-1">
              <p className="text-sm text-text-primary">Avisar al <span className="font-semibold text-yellow-400">80%</span></p>
              <p className="text-xs text-text-muted">Alerta temprana para ajustar gastos</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-surface-border cursor-pointer hover:border-violet-500/30 transition-colors">
            <input
              type="checkbox"
              checked={alert100}
              onChange={(e) => setAlert100(e.target.checked)}
              className="h-4 w-4 rounded border-surface-border text-violet-500 focus:ring-violet-500"
            />
            <div className="flex-1">
              <p className="text-sm text-text-primary">Avisar al <span className="font-semibold text-vermillion-shu">100%</span></p>
              <p className="text-xs text-text-muted">Alerta cuando excedas el límite</p>
            </div>
          </label>
        </div>
      </div>

      <GradientButton type="submit" loading={loading} fullWidth>
        {isEditing ? 'Actualizar presupuesto' : 'Guardar presupuesto'}
      </GradientButton>
    </form>
  )
}
