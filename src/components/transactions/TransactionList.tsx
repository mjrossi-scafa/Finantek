'use client'

import { useState } from 'react'
import { Transaction } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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

interface TransactionListProps {
  transactions: Transaction[]
}

function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {}
  for (const t of transactions) {
    if (!groups[t.transaction_date]) {
      groups[t.transaction_date] = []
    }
    groups[t.transaction_date].push(t)
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

export function TransactionList({ transactions }: TransactionListProps) {
  const router = useRouter()
  const supabase = createClient()
  const grouped = groupByDate(transactions)

  async function deleteTransaction(id: string) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar')
    } else {
      toast.success('Transaccion eliminada')
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {grouped.map(([date, txs]) => (
        <div key={date}>
          <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 px-1">
            {formatDate(date)}
          </p>
          <div className="space-y-1">
            {txs.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-xl glass-card transition-fintech hover:bg-surface-hover group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 transition-fintech group-hover:scale-105"
                  style={{ backgroundColor: (t.categories?.color ?? '#8B5CF6') + '20' }}
                >
                  {t.categories?.icon ?? '💸'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-text-primary truncate">
                    {t.description || t.categories?.name || 'Sin descripcion'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-tertiary">{t.categories?.name}</span>
                    {t.source !== 'manual' && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-violet-primary/10 text-violet-light">
                        {t.source === 'receipt' ? '📸 Recibo' : '📄 PDF'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-sm font-mono tabular-nums ${
                      t.type === 'income' ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'}{formatCLP(t.amount)}
                  </span>
                  <AlertDialog>
                    <AlertDialogTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar transaccion?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta accion no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteTransaction(t.id)}>
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
