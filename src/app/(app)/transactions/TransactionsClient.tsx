'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Transaction, Category } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import * as DateUtils from '@/lib/utils/dates'
import { createClient } from '@/lib/supabase/client'
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal'
import { TransactionItem } from '@/components/transactions/TransactionItem'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  Clock,
  X,
  Check,
  XIcon,
  ArrowDownUp,
  DollarSign,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'

type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'category'
type DateRange = 'all' | 'today' | 'week' | 'month' | '30days' | 'year'

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

function isDateInRange(dateStr: string, range: DateRange): boolean {
  if (range === 'all') return true
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  switch (range) {
    case 'today':
      return date.toDateString() === now.toDateString()
    case 'week':
      return diffDays <= 7
    case 'month':
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
    case '30days':
      return diffDays <= 30
    case 'year':
      return date.getFullYear() === now.getFullYear()
    default:
      return true
  }
}

function isRecentTransaction(createdAt: string): boolean {
  const created = new Date(createdAt)
  const now = new Date()
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
  return diffHours <= 2
}

export function TransactionsClient({
  initialTransactions,
  categories,
  userId
}: TransactionsClientProps) {
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [minAmount, setMinAmount] = useState<string>('')
  const [maxAmount, setMaxAmount] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [showAmountFilter, setShowAmountFilter] = useState(false)

  // Undo delete state
  const [lastDeleted, setLastDeleted] = useState<Transaction | null>(null)
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectionMode, setSelectionMode] = useState(false)

  // Pagination state
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Inline delete confirmation state
  const [deletingId, setDeletingId] = useState<string>('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow Ctrl+F to focus search even in inputs
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
          e.preventDefault()
          const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Buscar transacción..."]')
          searchInput?.focus()
        }
        return
      }

      // Ctrl/Cmd + N: Nueva transacción
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleCreateNew()
      }
      // Ctrl/Cmd + F: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        const searchInput = document.querySelector<HTMLInputElement>('input[placeholder="Buscar transacción..."]')
        searchInput?.focus()
      }
      // Delete: Eliminar seleccionadas
      if (e.key === 'Delete' && selectedIds.size > 0) {
        e.preventDefault()
        handleBulkDelete()
      }
      // Esc: Cerrar selección
      if (e.key === 'Escape' && selectionMode) {
        clearSelection()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIds.size, selectionMode])

  // Selection functions
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedIds(new Set(filteredTransactions.map(t => t.id)))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setSelectionMode(false)
  }

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !searchQuery && typeFilter === 'all' && categoryFilter === 'all' && monthFilter === 'all' && dateRange === 'all' && !minAmount && !maxAmount) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, searchQuery, typeFilter, categoryFilter, monthFilter, dateRange, minAmount, maxAmount])

  // Get unique months for filter
  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    transactions.forEach(t => {
      months.add(getMonthFromDate(t.transaction_date))
    })
    return Array.from(months).sort().reverse()
  }, [transactions])

  // Apply filters + sorting
  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter(transaction => {
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

      // Date range filter
      if (dateRange !== 'all' && !isDateInRange(transaction.transaction_date, dateRange)) return false

      // Amount range filter
      const min = parseFloat(minAmount)
      const max = parseFloat(maxAmount)
      if (!isNaN(min) && transaction.amount < min) return false
      if (!isNaN(max) && transaction.amount > max) return false

      return true
    })

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.transaction_date.localeCompare(a.transaction_date) ||
                 b.created_at.localeCompare(a.created_at)
        case 'date-asc':
          return a.transaction_date.localeCompare(b.transaction_date) ||
                 a.created_at.localeCompare(b.created_at)
        case 'amount-desc':
          return b.amount - a.amount
        case 'amount-asc':
          return a.amount - b.amount
        case 'category':
          return (a.categories?.name || '').localeCompare(b.categories?.name || '')
        default:
          return 0
      }
    })

    return sorted
  }, [transactions, searchQuery, typeFilter, categoryFilter, monthFilter, dateRange, minAmount, maxAmount, sortBy])

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

  const PAGE_SIZE = 50

  const loadMore = async () => {
    const offset = transactions.length
    const { data } = await supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (data && data.length > 0) {
      setTransactions(prev => [...prev, ...data as Transaction[]])
      if (data.length < PAGE_SIZE) {
        setHasMore(false)
      }
    } else {
      setHasMore(false)
    }
  }

  const refreshTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (data) {
      setTransactions(data as Transaction[])
      setHasMore(data.length === PAGE_SIZE)
      setPage(0)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    const confirmed = window.confirm(
      `¿Eliminar ${selectedIds.size} transacciones? Esta acción no se puede deshacer.`
    )
    if (!confirmed) return

    try {
      const ids = Array.from(selectedIds)
      const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', ids)

      if (error) throw error

      setTransactions(prev => prev.filter(t => !selectedIds.has(t.id)))
      clearSelection()
      toast.success(`${ids.length} transacciones eliminadas`)
    } catch (err) {
      toast.error('Error al eliminar transacciones')
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
    const transactionToDelete = transactions.find(t => t.id === transactionId)
    if (!transactionToDelete) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)

      if (error) throw error

      setTransactions(prev => prev.filter(t => t.id !== transactionId))
      setDeletingId('')
      setLastDeleted(transactionToDelete)

      // Clear previous undo timeout
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)

      // Show undo toast
      toast.success('Transacción eliminada', {
        description: `${transactionToDelete.description || 'Sin descripción'} — ${formatCLP(transactionToDelete.amount)}`,
        action: {
          label: 'Deshacer',
          onClick: () => handleUndoDelete(transactionToDelete),
        },
        duration: 5000,
      })

      // Auto-clear lastDeleted after 5s
      undoTimeoutRef.current = setTimeout(() => {
        setLastDeleted(null)
      }, 5000)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar la transacción')
      setDeletingId('')
    }
  }

  const handleUndoDelete = async (transaction: Transaction) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          id: transaction.id,
          user_id: transaction.user_id,
          category_id: transaction.category_id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          notes: transaction.notes,
          transaction_date: transaction.transaction_date,
          source: transaction.source,
          created_at: transaction.created_at,
        })

      if (error) throw error

      setTransactions(prev => [transaction, ...prev])
      setLastDeleted(null)
      toast.success('Transacción restaurada ✓')
    } catch (err) {
      toast.error('No se pudo restaurar')
    }
  }

  const handleDuplicate = async (transaction: Transaction) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: transaction.user_id,
          category_id: transaction.category_id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          notes: transaction.notes,
          transaction_date: today,
          source: 'manual',
        })
        .select('*, categories(*)')
        .single()

      if (error) throw error

      if (data) {
        setTransactions(prev => [data as Transaction, ...prev])
        toast.success('Transacción duplicada ✓', {
          description: `${data.description || 'Sin descripción'} — ${formatCLP(data.amount)}`,
        })
      }
    } catch (err) {
      console.error(err)
      toast.error('Error al duplicar')
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
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Transacciones</h1>
          <p className="text-text-secondary mt-1">
            {filteredTransactions.length === transactions.length
              ? `${transactions.length} ${transactions.length === 1 ? 'transacción' : 'transacciones'}`
              : `Mostrando ${filteredTransactions.length} de ${transactions.length}`
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectionMode(!selectionMode)}
            className={`text-xs px-3 py-1.5 rounded-full transition-all hidden md:flex ${
              selectionMode
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                : 'text-gray-400 border border-white/10 hover:border-purple-500/40'
            }`}>
            {selectionMode ? 'Cancelar' : 'Seleccionar'}
          </button>
          <GradientButton onClick={handleCreateNew} className="rounded-full hidden md:flex">
            <Plus className="h-4 w-4 mr-2" />
            Nueva transacción
          </GradientButton>
        </div>
      </div>

      {/* Quick date range filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Todos', icon: null },
          { key: 'today', label: 'Hoy', icon: '📅' },
          { key: 'week', label: 'Semana', icon: '🗓️' },
          { key: 'month', label: 'Este mes', icon: '📆' },
          { key: '30days', label: '30 días', icon: '⏱️' },
          { key: 'year', label: 'Año', icon: '📊' },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setDateRange(key as DateRange)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              dateRange === key
                ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md'
                : 'bg-surface-secondary border border-surface-border text-text-secondary hover:text-text-primary hover:border-violet-500/40'
            }`}
          >
            {icon && <span>{icon}</span>}
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="overflow-x-auto pb-2 md:pb-0">
          <div className="flex gap-3 min-w-max md:min-w-0 md:flex-wrap">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 md:min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <Input
                placeholder="Buscar transacción..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 w-full bg-surface-secondary border-surface-border"
              />
            </div>

            {/* Type filters */}
            <div className="flex rounded-lg bg-surface-secondary border border-surface-border p-1 flex-shrink-0">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'income', label: 'Ingresos' },
                { key: 'expense', label: 'Gastos' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTypeFilter(key as any)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                    typeFilter === key
                      ? 'bg-surface-primary text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value || 'all')}>
              <SelectTrigger className="w-48 bg-surface-secondary border-surface-border flex-shrink-0">
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
              <SelectTrigger className="w-40 bg-surface-secondary border-surface-border flex-shrink-0">
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

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-44 bg-surface-secondary border-surface-border flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <ArrowDownUp className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Ordenar" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">📅 Más recientes</SelectItem>
                <SelectItem value="date-asc">📅 Más antiguas</SelectItem>
                <SelectItem value="amount-desc">💰 Mayor monto</SelectItem>
                <SelectItem value="amount-asc">💰 Menor monto</SelectItem>
                <SelectItem value="category">📁 Por categoría</SelectItem>
              </SelectContent>
            </Select>

            {/* Amount filter toggle */}
            <Button
              variant="outline"
              onClick={() => setShowAmountFilter(!showAmountFilter)}
              className={`flex-shrink-0 ${
                showAmountFilter || minAmount || maxAmount
                  ? 'bg-violet-500/10 border-violet-500/40 text-violet-300'
                  : 'bg-surface-secondary border-surface-border'
              }`}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Monto
            </Button>

            {/* Export */}
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={filteredTransactions.length === 0}
              className="bg-surface-secondary border-surface-border flex-shrink-0"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Amount range filter (collapsible) */}
        {showAmountFilter && (
          <div className="flex items-center gap-3 p-3 bg-surface-secondary/50 border border-violet-500/20 rounded-xl animate-in slide-in-from-top duration-200">
            <DollarSign className="h-4 w-4 text-violet-400 flex-shrink-0" />
            <div className="flex items-center gap-2 flex-1">
              <Input
                type="number"
                placeholder="Mín $"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-32 bg-surface border-surface-border"
              />
              <span className="text-text-tertiary">—</span>
              <Input
                type="number"
                placeholder="Máx $"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-32 bg-surface border-surface-border"
              />
              {(minAmount || maxAmount) && (
                <button
                  onClick={() => {
                    setMinAmount('')
                    setMaxAmount('')
                  }}
                  className="text-xs text-text-tertiary hover:text-text-primary px-2"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        )}
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

      {/* Selection mode indicator (mobile) */}
      {selectionMode && (
        <div className="md:hidden bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 text-center">
          <span className="text-sm text-purple-300">
            Modo selección activo — toca las transacciones para seleccionar
          </span>
        </div>
      )}

      {/* Batch actions bar */}
      {selectedIds.size > 0 && (
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(15, 10, 30, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: '12px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <div className="flex items-center gap-3">
            <button onClick={selectAll} className="text-xs text-purple-400 hover:text-purple-300">
              Seleccionar todo
            </button>
            <span className="text-xs text-white font-medium">
              {selectedIds.size} seleccionadas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-red-500/20 transition-colors"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Trash2 size={12}/> Eliminar ({selectedIds.size})
            </button>
            <button onClick={clearSelection} className="text-xs text-gray-500 hover:text-gray-300 p-1">
              <X size={14}/>
            </button>
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
                    {DateUtils.getRelativeDate(date)}
                  </h3>
                  <span className={`text-xs font-mono ${
                    dayTotal >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {dayTotal >= 0 ? '+' : ''}{formatCLP(dayTotal)}
                  </span>
                </div>

                {/* Transactions */}
                <div className="space-y-2">
                  {dayTransactions.map((transaction) => {
                    const isSelected = selectedIds.has(transaction.id)
                    const isDeleting = deletingId === transaction.id

                    return (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        isSelected={isSelected}
                        isDeleting={isDeleting}
                        selectionMode={selectionMode}
                        isRecent={isRecentTransaction(transaction.created_at)}
                        onToggleSelection={() => toggleSelection(transaction.id)}
                        onEdit={() => handleEdit(transaction)}
                        onDelete={() => handleDeleteTransaction(transaction.id)}
                        onStartDelete={() => setDeletingId(transaction.id)}
                        onCancelDelete={() => setDeletingId('')}
                        onDuplicate={() => handleDuplicate(transaction)}
                        onLongPress={() => {
                          if (!selectionMode) {
                            setSelectionMode(true)
                            toggleSelection(transaction.id)
                          }
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && filteredTransactions.length > 0 && (
        <div ref={sentinelRef} style={{ height: '20px' }} className="flex justify-center">
          <div className="text-xs text-text-tertiary">Cargando más...</div>
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

      {/* Fixed floating button for mobile */}
      <button
        onClick={handleCreateNew}
        className="fixed right-4 w-14 h-14 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center md:hidden z-50"
        style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}