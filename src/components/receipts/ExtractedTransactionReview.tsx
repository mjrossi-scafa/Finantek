'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExtractedTransaction, Category } from '@/types/database'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { GradientButton } from '@/components/shared/GradientButton'
import { toast } from 'sonner'
import { AlertTriangle, Check, Trash2 } from 'lucide-react'

interface ExtractedTransactionReviewProps {
  receiptId: string
  initialTransactions: ExtractedTransaction[]
  categories: Category[]
}

export function ExtractedTransactionReview({
  receiptId,
  initialTransactions,
  categories,
}: ExtractedTransactionReviewProps) {
  const router = useRouter()
  const [transactions, setTransactions] = useState<ExtractedTransaction[]>(initialTransactions)
  const [loading, setLoading] = useState(false)

  const inputClasses = "h-10 bg-surface border-surface-border text-text-primary rounded-xl text-sm focus:border-violet-primary focus:ring-violet-primary/20"

  function update(index: number, field: keyof ExtractedTransaction, value: unknown) {
    setTransactions((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    )
  }

  function remove(index: number) {
    setTransactions((prev) => prev.filter((_, i) => i !== index))
  }

  async function confirm() {
    const valid = transactions.filter((t) => t.category_id && t.amount > 0)
    if (valid.length === 0) {
      toast.error('No hay transacciones validas para confirmar')
      return
    }

    setLoading(true)
    const res = await fetch(`/api/receipts/${receiptId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: valid }),
    })

    if (res.ok) {
      toast.success(`${valid.length} transacciones registradas`)
      await fetch('/api/achievements/check', {
        method: 'POST',
        body: JSON.stringify({ trigger: 'receipt_processed' }),
        headers: { 'Content-Type': 'application/json' },
      })
      router.push('/transactions')
    } else {
      const data = await res.json()
      toast.error('Error al confirmar', { description: data.error })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {transactions.length} transacciones extraidas. Revisa y confirma.
        </p>
        <GradientButton onClick={confirm} loading={loading} disabled={transactions.length === 0} size="sm">
          <Check className="h-4 w-4" />
          Confirmar {transactions.length}
        </GradientButton>
      </div>

      <div className="space-y-3">
        {transactions.map((t, index) => (
          <div key={index} className="glass-card rounded-2xl p-4 space-y-3">
            {t.needs_review && (
              <div className="flex items-center gap-2 text-yellow-400 text-xs font-medium">
                <AlertTriangle className="h-3 w-3" />
                <span>Baja confianza — revisa antes de confirmar</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Type */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1 block">Tipo</label>
                <div className="flex rounded-xl overflow-hidden border border-surface-border text-sm">
                  <button
                    type="button"
                    onClick={() => update(index, 'type', 'expense')}
                    className={`flex-1 py-1.5 font-semibold transition-all duration-200 ${t.type === 'expense' ? 'bg-danger text-white' : 'bg-surface text-text-tertiary hover:bg-surface-hover'}`}
                  >
                    Gasto
                  </button>
                  <button
                    type="button"
                    onClick={() => update(index, 'type', 'income')}
                    className={`flex-1 py-1.5 font-semibold transition-all duration-200 ${t.type === 'income' ? 'bg-success text-white' : 'bg-surface text-text-tertiary hover:bg-surface-hover'}`}
                  >
                    Ingreso
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1 block">Monto (CLP)</label>
                <CurrencyInput
                  value={t.amount}
                  onChange={(v) => update(index, 'amount', v)}
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1 block">Categoria</label>
                <Select
                  value={t.category_id || ''}
                  onValueChange={(v) => update(index, 'category_id', v)}
                >
                  <SelectTrigger className={inputClasses}>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c.type === t.type)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1 block">Fecha</label>
                <Input
                  type="date"
                  value={t.date}
                  onChange={(e) => update(index, 'date', e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1 block">Descripcion</label>
              <div className="flex gap-2">
                <Input
                  value={t.description}
                  onChange={(e) => update(index, 'description', e.target.value)}
                  className={inputClasses + ' flex-1'}
                />
                <button
                  onClick={() => remove(index)}
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-primary/10 text-violet-light">
                Sugerido: {t.suggested_category}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-surface-hover text-text-tertiary">
                Confianza: {Math.round(t.confidence * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
