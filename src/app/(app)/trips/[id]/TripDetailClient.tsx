'use client'

import { useMemo, useState } from 'react'
import { Trip, Transaction } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { getChileToday } from '@/lib/utils/timezone'
import { Calendar, MapPin, Download, TrendingUp, Calculator } from 'lucide-react'
import { TripFormModal } from '@/components/trips/TripFormModal'

interface Props {
  trip: Trip
  transactions: Transaction[]
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  JPY: '¥', USD: '$', EUR: '€', ARS: '$', PEN: 'S/', MXN: '$', COP: '$', GBP: '£', BRL: 'R$', CLP: '$',
}

export function TripDetailClient({ trip, transactions }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [converterAmount, setConverterAmount] = useState('')

  const symbol = CURRENCY_SYMBOLS[trip.currency] || ''

  const stats = useMemo(() => {
    const total = transactions.reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum, 0)
    const count = transactions.filter((t) => t.type === 'expense').length

    // Days — comparison via YYYY-MM-DD string in Chile TZ keeps in sync with
    // ActiveTripBanner and avoids UTC drift on Vercel's runtime.
    const MS_PER_DAY = 1000 * 60 * 60 * 24
    const todayStr = getChileToday()
    const [ty, tm, td] = todayStr.split('-').map(Number)
    const [sy, sm, sd] = trip.start_date.split('-').map(Number)
    const [ey, em, ed] = trip.end_date.split('-').map(Number)
    const todayMs = Date.UTC(ty, tm - 1, td)
    const startMs = Date.UTC(sy, sm - 1, sd)
    const endMs = Date.UTC(ey, em - 1, ed)
    const totalDays = Math.max(1, Math.round((endMs - startMs) / MS_PER_DAY) + 1)
    const isActive = todayStr >= trip.start_date && todayStr <= trip.end_date
    const daysPassed =
      todayStr < trip.start_date ? 0 :
      todayStr > trip.end_date ? totalDays :
      Math.round((todayMs - startMs) / MS_PER_DAY) + 1

    const avgPerDay = daysPassed > 0 ? total / daysPassed : 0
    const projection = Math.round(avgPerDay * totalDays)

    // By category
    const byCategory: Record<string, { name: string; icon: string; total: number; count: number }> = {}
    for (const t of transactions) {
      if (t.type !== 'expense') continue
      const key = t.category_id || 'none'
      if (!byCategory[key]) {
        byCategory[key] = {
          name: t.categories?.name || 'Sin categoría',
          icon: t.categories?.icon || '💸',
          total: 0,
          count: 0,
        }
      }
      byCategory[key].total += t.amount
      byCategory[key].count++
    }
    const categories = Object.values(byCategory).sort((a, b) => b.total - a.total)

    // By day
    const byDay: Record<string, number> = {}
    for (const t of transactions) {
      if (t.type !== 'expense') continue
      byDay[t.transaction_date] = (byDay[t.transaction_date] || 0) + t.amount
    }
    const days = Object.entries(byDay)
      .sort(([a], [b]) => b.localeCompare(a))

    // Budget
    const budgetPct = trip.budget && trip.budget > 0 ? Math.round((total / trip.budget) * 100) : null

    return {
      total, count, totalDays, daysPassed, avgPerDay, projection, categories, days, budgetPct, isActive,
    }
  }, [transactions, trip])

  function convertAmount() {
    const n = parseFloat(converterAmount.replace(/[^\d.]/g, ''))
    if (isNaN(n)) return { fromClp: 0, toForeign: 0 }
    return {
      fromClp: Math.round(n * Number(trip.exchange_rate)),
      toForeign: Math.round(n / Number(trip.exchange_rate)),
    }
  }

  function exportCSV() {
    const header = ['Fecha', 'Descripción', 'Categoría', 'Monto original', 'Moneda', 'Monto CLP'].join(',')
    const rows = transactions.filter((t) => t.type === 'expense').map((t) => {
      const escape = (v: unknown) => {
        const s = String(v ?? '')
        if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
        return s
      }
      return [
        t.transaction_date,
        escape(t.description ?? ''),
        escape(t.categories?.name ?? ''),
        t.original_amount ?? '',
        t.original_currency ?? '',
        t.amount,
      ].join(',')
    })
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${trip.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-violet-500/20 via-indigo-500/10 to-purple-500/10 border border-violet-500/30">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{trip.emoji}</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary">{trip.name}</h1>
              {trip.destination && (
                <p className="text-text-secondary flex items-center gap-1.5 mt-1">
                  <MapPin className="h-4 w-4" /> {trip.destination}
                </p>
              )}
              <p className="text-text-muted flex items-center gap-1.5 mt-1 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(trip.start_date + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })}
                {' → '}
                {new Date(trip.end_date + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={transactions.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface border border-surface-border text-text-secondary hover:text-text-primary hover:border-violet-500/30 transition-all text-xs font-semibold disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
            <button
              onClick={() => setEditOpen(true)}
              className="px-3 py-2 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-light text-xs font-semibold hover:bg-violet-500/30 transition-all"
            >
              Editar
            </button>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface/50 rounded-xl p-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wide">Total gastado</p>
            <p className="text-xl font-bold font-mono text-text-primary mt-1">{formatCLP(stats.total)}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{stats.count} transacciones</p>
          </div>
          <div className="bg-surface/50 rounded-xl p-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wide">Día</p>
            <p className="text-xl font-bold font-mono text-violet-light mt-1">
              {stats.daysPassed}<span className="text-sm text-text-muted">/{stats.totalDays}</span>
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">{stats.isActive ? 'en curso' : stats.daysPassed === 0 ? 'próximo' : 'finalizado'}</p>
          </div>
          <div className="bg-surface/50 rounded-xl p-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wide">Promedio/día</p>
            <p className="text-xl font-bold font-mono text-text-primary mt-1">{formatCLP(Math.round(stats.avgPerDay))}</p>
            <p className="text-[10px] text-text-muted mt-0.5">diario</p>
          </div>
          <div className="bg-surface/50 rounded-xl p-3">
            <p className="text-[10px] text-text-muted uppercase tracking-wide">Proyección</p>
            <p className="text-xl font-bold font-mono text-text-primary mt-1">{formatCLP(stats.projection)}</p>
            <p className="text-[10px] text-text-muted mt-0.5">fin del viaje</p>
          </div>
        </div>

        {/* Budget progress */}
        {trip.budget && stats.budgetPct !== null && (
          <div className="mt-4 pt-4 border-t border-surface-border/50">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-text-muted">Presupuesto: {formatCLP(trip.budget)}</span>
              <span className={`font-mono font-semibold ${
                stats.budgetPct >= 100 ? 'text-vermillion-shu' :
                stats.budgetPct >= 80 ? 'text-yellow-400' :
                'text-bamboo-take'
              }`}>
                {stats.budgetPct}%
              </span>
            </div>
            <div className="h-2 bg-surface-border rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  stats.budgetPct >= 100 ? 'bg-vermillion-shu' :
                  stats.budgetPct >= 80 ? 'bg-yellow-500' :
                  'bg-gradient-to-r from-bamboo-take to-green-500'
                }`}
                style={{ width: `${Math.min(stats.budgetPct, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick converter */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-4 w-4 text-violet-light" />
          <h3 className="text-sm font-bold text-text-primary">Calculadora rápida</h3>
          <span className="text-xs text-text-muted ml-auto">1 {trip.currency} = {Number(trip.exchange_rate).toFixed(2)} CLP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1 px-3 py-2 rounded-xl bg-surface border border-surface-border">
            <span className="text-text-muted text-sm">{symbol || trip.currency}</span>
            <input
              type="text"
              inputMode="decimal"
              value={converterAmount}
              onChange={(e) => setConverterAmount(e.target.value)}
              placeholder="1000"
              className="flex-1 bg-transparent border-0 outline-none text-text-primary font-mono"
            />
          </div>
          <span className="text-text-muted">=</span>
          <div className="flex-1 flex items-center gap-1 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/30">
            <span className="text-violet-light text-sm">$</span>
            <span className="flex-1 text-violet-light font-mono font-semibold">
              {formatCLP(convertAmount().fromClp).replace('$', '')}
            </span>
            <span className="text-xs text-text-muted">CLP</span>
          </div>
        </div>
      </div>

      {/* By category */}
      {stats.categories.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-text-primary mb-3">🏆 Por categoría</h3>
          <div className="space-y-2">
            {stats.categories.map((cat, i) => {
              const pct = stats.total > 0 ? Math.round((cat.total / stats.total) * 100) : 0
              const medals = ['🥇', '🥈', '🥉']
              return (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-hover transition-colors">
                  <span className="text-sm">{i < 3 ? medals[i] : ''}</span>
                  <span className="text-xl">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-text-primary">{cat.name}</p>
                      <span className="font-mono font-bold text-sm text-text-primary">{formatCLP(cat.total)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-surface-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-text-muted font-mono">{pct}%</span>
                      <span className="text-[10px] text-text-muted">{cat.count} tx</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Transactions list */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-text-primary mb-3">📝 Transacciones del viaje</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">Sin transacciones aún</p>
            {stats.isActive && (
              <p className="text-xs text-text-muted mt-2">
                Activa este viaje y registra desde Telegram o la web
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary hover:bg-surface-hover transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: (t.categories?.color ?? '#8B5CF6') + '20' }}
                >
                  {t.categories?.icon ?? '💸'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{t.description}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(t.transaction_date + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                    {' · '}
                    {t.categories?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-bold text-sm ${t.type === 'income' ? 'text-bamboo-take' : 'text-vermillion-shu'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCLP(t.amount)}
                  </p>
                  {t.original_amount && t.original_currency && (
                    <p className="text-[10px] text-text-muted">
                      {CURRENCY_SYMBOLS[t.original_currency] || ''}{Number(t.original_amount).toLocaleString()} {t.original_currency}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <TripFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          setEditOpen(false)
          window.location.reload()
        }}
        userId={trip.user_id}
        editing={trip}
      />
    </div>
  )
}
