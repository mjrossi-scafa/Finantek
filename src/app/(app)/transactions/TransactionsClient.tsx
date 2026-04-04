'use client'

import { useState, useMemo } from 'react'
import { Transaction, Category } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { getRelativeDate } from '@/lib/utils/dates'
import { createClient } from '@/lib/supabase/client'
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { GradientButton } from '@/components/shared/GradientButton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  Clock
} from 'lucide-react'
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

interface TransactionsClientProps {
  initialTransactions: Transaction[]
  categories: Category[]
  userId: string
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

function getMonthFromDate(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function TransactionsClient({
  initialTransactions,
  categories,
  userId
}: TransactionsClientProps) {
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [monthFilter, setMonthFilter] = useState<string>('all')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>()

  // Get unique months for filter
  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    transactions.forEach(t => {
      months.add(getMonthFromDate(t.transaction_date))
    })
    return Array.from(months).sort().reverse()
  }, [transactions])

  // Apply filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = [
          transaction.description,
          transaction.notes,
          transaction.categories?.name
        ].filter(Boolean).join(' ').toLowerCase()

        if (!searchableText.includes(query)) return false
      }

      // Type filter
      if (typeFilter !== 'all' && transaction.type !== typeFilter) return false

      // Category filter
      if (categoryFilter !== 'all' && transaction.category_id !== categoryFilter) return false

      // Month filter
      if (monthFilter !== 'all' && getMonthFromDate(transaction.transaction_date) !== monthFilter) return false

      return true
    })
  }, [transactions, searchQuery, typeFilter, categoryFilter, monthFilter])

  // Calculate summary for filtered transactions
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      income,
      expense,
      balance: income - expense
    }
  }, [filteredTransactions])

  // Group filtered transactions
  const groupedTransactions = groupByDate(filteredTransactions)

  const refreshTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(500)

    if (data) {
      setTransactions(data as Transaction[])
    }
  }

  const handleCreateNew = () => {
    setModalMode('create')
    setSelectedTransaction(undefined)
    setModalOpen(true)
  }

  const handleEdit = (transaction: Transaction) => {
    setModalMode('edit')
    setSelectedTransaction(transaction)
    setModalOpen(true)
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)

      if (error) throw error

      setTransactions(prev => prev.filter(t => t.id !== transactionId))
      toast.success('Transacción eliminada')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar la transacción')
    }
  }

  const handleExport = () => {
    // Basic CSV export
    const csvContent = [
      ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Monto'].join(','),
      ...filteredTransactions.map(t => [
        t.transaction_date,
        t.type === 'income' ? 'Ingreso' : 'Gasto',
        `"${t.description || ''}"`,
        `"${t.categories?.name || ''}"`,
        t.amount
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Exportación completada')
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Transacciones</h1>
          <p className="text-text-secondary mt-1">Historial de ingresos y gastos</p>
        </div>
        <GradientButton onClick={handleCreateNew} className="rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Nueva transacción
        </GradientButton>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <Input
              placeholder="Buscar transacción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64 bg-surface-secondary border-surface-border"
            />
          </div>

          {/* Type filters */}
          <div className="flex rounded-lg bg-surface-secondary border border-surface-border p-1">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'income', label: 'Ingresos' },
              { key: 'expense', label: 'Gastos' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  typeFilter === key
                    ? 'bg-surface-primary text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {/* Category filter */}
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value || 'all')}>
            <SelectTrigger className="w-48 bg-surface-secondary border-surface-border">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Month filter */}
          <Select value={monthFilter} onValueChange={(value) => setMonthFilter(value || 'all')}>
            <SelectTrigger className="w-40 bg-surface-secondary border-surface-border">
              <SelectValue placeholder="Todos los meses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los meses</SelectItem>
              {availableMonths.map((month) => {
                const [year, monthNum] = month.split('-')
                const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('es', { month: 'long', year: 'numeric' })
                return (
                  <SelectItem key={month} value={month}>
                    {monthName}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          {/* Export */}
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={filteredTransactions.length === 0}
            className="bg-surface-secondary border-surface-border"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Quick summary */}
      {filteredTransactions.length > 0 && (
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-success/10 text-success">
            <span>Ingresos:</span>
            <span className="font-mono font-semibold">+{formatCLP(summary.income)}</span>
          </div>
          <div className="w-px h-6 bg-surface-border"></div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-danger/10 text-danger">
            <span>Gastos:</span>
            <span className="font-mono font-semibold">-{formatCLP(summary.expense)}</span>
          </div>
          <div className="w-px h-6 bg-surface-border"></div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full ${
            summary.balance >= 0
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger'
          }`}>
            <span>Balance:</span>
            <span className="font-mono font-semibold">
              {summary.balance >= 0 ? '+' : ''}{formatCLP(summary.balance)}
            </span>
          </div>
        </div>
      )}

      {/* Transactions list */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon="💸"
          title={searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || monthFilter !== 'all'
            ? "No se encontraron transacciones"
            : "Aún no tienes transacciones"
          }
          description={searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' || monthFilter !== 'all'
            ? "Intenta ajustar los filtros de búsqueda"
            : "Agrégalas con el bot @risky_finance_bot o con el botón + Nueva transacción"
          }
          action={
            <GradientButton onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar primera transacción
            </GradientButton>
          }
        />
      ) : (
        <div className="space-y-6">
          {groupedTransactions.map(([date, dayTransactions]) => {
            const dayTotal = dayTransactions.reduce((sum, t) => {
              return sum + (t.type === 'income' ? t.amount : -t.amount)
            }, 0)

            return (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-surface-border/50">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {getRelativeDate(date)}
                  </h3>
                  <span className={`text-xs font-mono ${
                    dayTotal >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {dayTotal >= 0 ? '+' : ''}{formatCLP(dayTotal)}
                  </span>
                </div>

                {/* Transactions */}
                <div className="space-y-2">
                  {dayTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      onClick={() => handleEdit(transaction)}
                      className="flex items-center gap-4 p-3 rounded-xl glass-card transition-all hover:bg-surface-hover group cursor-pointer"
                    >
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 transition-all group-hover:scale-105"
                        style={{ backgroundColor: (transaction.categories?.color ?? '#8B5CF6') + '20' }}
                      >
                        {transaction.categories?.icon ?? '💸'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-text-primary truncate">
                          {transaction.description || transaction.categories?.name || 'Sin descripción'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-text-tertiary">{transaction.categories?.name}</span>
                          {transaction.source !== 'manual' && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-violet-primary/10 text-violet-light">
                              {transaction.source === 'receipt' ? '📸 Recibo' : '📄 PDF'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="text-xs text-text-tertiary flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(transaction.created_at).toLocaleTimeString('es', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>

                      {/* Amount & Actions */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-bold text-sm font-mono tabular-nums ${
                            transaction.type === 'income' ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}{formatCLP(transaction.amount)}
                        </span>

                        {/* Actions (visible on hover) */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(transaction)
                            }}
                            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-primary transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <AlertDialog>
                            <AlertDialogTrigger className="p-1.5 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors" onClick={(e) => e.stopPropagation()}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar transacción?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTransaction(transaction.id)}
                                  className="bg-danger hover:bg-danger/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <EditTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        transaction={selectedTransaction}
        categories={categories}
        userId={userId}
        onSuccess={refreshTransactions}
        mode={modalMode}
      />
    </div>
  )
}