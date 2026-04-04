import Link from 'next/link'
import { Transaction } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/dates'
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="glass-card rounded-2xl p-6">
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
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-elevated flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-text-muted" />
          </div>
          <p className="text-sm text-text-tertiary">Sin transacciones recientes</p>
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
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {t.type === 'income' ?
                    <TrendingUp className="h-3.5 w-3.5 text-bamboo-take" /> :
                    <TrendingDown className="h-3.5 w-3.5 text-vermillion-shu" />
                  }
                  <span
                    className={`text-base font-bold font-mono tabular-nums ${
                      t.type === 'income' ? 'text-bamboo-take' : 'text-vermillion-shu'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'}{formatCLP(t.amount)}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {t.type === 'income' ? 'Entrada' : 'Salida'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
