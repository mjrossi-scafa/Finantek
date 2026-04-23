'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Transaction } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'
import { ArrowRight, TrendingUp, TrendingDown, Trash2, Edit2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface RecentTransactionsProps {
  transactions: Transaction[]
  userId?: string
  isHidden?: boolean
  onTransactionUpdated?: () => void
}

export function RecentTransactions({
  transactions,
  userId,
  isHidden = false,
  onTransactionUpdated,
}: RecentTransactionsProps) {
  const supabase = createClient()
  const [deletingId, setDeletingId] = useState<string>('')

  const handleDelete = async (tx: Transaction) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', tx.id)
      if (error) throw error

      toast.success('Transacción eliminada', {
        description: `${tx.description} — ${formatCLP(tx.amount)}`,
        action: {
          label: 'Deshacer',
          onClick: async () => {
            await supabase.from('transactions').insert({
              id: tx.id,
              user_id: tx.user_id,
              category_id: tx.category_id,
              type: tx.type,
              amount: tx.amount,
              description: tx.description,
              notes: tx.notes,
              transaction_date: tx.transaction_date,
              source: tx.source,
              created_at: tx.created_at,
            })
            toast.success('Transacción restaurada ✓')
            onTransactionUpdated?.()
          },
        },
        duration: 5000,
      })

      onTransactionUpdated?.()
      setDeletingId('')
    } catch (err) {
      toast.error('Error al eliminar')
    }
  }
  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            Últimas Transacciones
            <span className="h-2 w-2 rounded-full bg-indigo-light animate-pulse" />
          </h3>
          <p className="text-sm text-text-tertiary mt-1">Últimos movimientos registrados</p>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-2 text-sm font-semibold text-violet-light hover:text-violet-primary transition-colors px-3 py-2 rounded-lg hover:bg-violet-light/10"
        >
          Ver todas <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-elevated flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-text-muted" />
          </div>
          <p className="text-sm text-text-secondary mb-4">Aún no hay transacciones registradas.</p>
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-violet-600 hover:to-indigo-700 transition-all"
          >
            Registrar primera <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-surface-border/50">
          {transactions.map((t, index) => (
            <div key={t.id} className="flex items-center gap-4 py-4 px-2 -mx-2 rounded-xl transition-all duration-200 hover:bg-surface-elevated/60 hover:scale-[1.02] group">
              {/* Ícono más pequeño y elegante */}
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 transition-all duration-200 group-hover:scale-110"
                  style={{ backgroundColor: (t.categories?.color ?? '#8B5CF6') + '15', borderColor: (t.categories?.color ?? '#8B5CF6') + '30' }}
                >
                  {t.categories?.icon ?? '💸'}
                </div>
                {/* Dot de tipo con color */}
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  t.type === 'income' ? 'bg-bamboo-take' : 'bg-vermillion-shu'
                }`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {t.description || t.categories?.name}
                  </p>

                  {/* Badge de categoría */}
                  <span
                    className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border"
                    style={{
                      backgroundColor: (t.categories?.color ?? '#8B5CF6') + '10',
                      borderColor: (t.categories?.color ?? '#8B5CF6') + '20',
                      color: t.categories?.color ?? '#8B5CF6'
                    }}
                  >
                    {t.categories?.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-text-tertiary">
                  <span>{formatDateShort(t.transaction_date)}</span>
                  <span>•</span>
                  <span className="capitalize">{t.type === 'income' ? 'Ingreso' : 'Gasto'}</span>
                </div>
              </div>

              {/* Monto con mejor formato */}
              <div className="text-right flex items-center gap-2">
                <div>
                  <div className="flex items-center gap-1 justify-end">
                    {t.type === 'income' ?
                      <TrendingUp className="h-3.5 w-3.5 text-bamboo-take" /> :
                      <TrendingDown className="h-3.5 w-3.5 text-vermillion-shu" />
                    }
                    <span
                      className={`text-base font-bold font-mono tabular-nums ${
                        t.type === 'income' ? 'text-bamboo-take' : 'text-vermillion-shu'
                      }`}
                    >
                      {isHidden ? '•••••' : `${t.type === 'income' ? '+' : '-'}${formatCLP(t.amount)}`}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1 text-right">
                    {t.type === 'income' ? 'Entrada' : 'Salida'}
                  </p>
                </div>

                {/* Quick actions - always visible on mobile, hover on desktop */}
                {userId && (
                  <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Link
                      href={`/transactions?edit=${t.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 md:p-1.5 rounded-lg text-text-tertiary hover:text-violet-light hover:bg-violet-light/10 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (deletingId === t.id) {
                          handleDelete(t)
                        } else {
                          setDeletingId(t.id)
                          setTimeout(() => setDeletingId(''), 3000)
                        }
                      }}
                      className={`p-2 md:p-1.5 rounded-lg transition-colors ${
                        deletingId === t.id
                          ? 'text-vermillion-shu bg-vermillion-shu/20 animate-pulse'
                          : 'text-text-tertiary hover:text-vermillion-shu hover:bg-vermillion-shu/10'
                      }`}
                      title={deletingId === t.id ? 'Click de nuevo para confirmar' : 'Eliminar'}
                    >
                      <Trash2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
