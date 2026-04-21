'use client'

import { useState, useMemo, useEffect } from 'react'
import { PlannedExpense, Category, Transaction } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { formatCLP } from '@/lib/utils/currency'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Repeat,
  Calendar as CalendarIcon,
  TrendingUp,
  Sparkles,
  X,
} from 'lucide-react'
import { PlannedExpenseModal } from '@/components/planner/PlannedExpenseModal'
import { RecurringSuggestionsModal } from '@/components/planner/RecurringSuggestionsModal'
import { GradientButton } from '@/components/shared/GradientButton'
import { detectRecurringExpenses } from '@/lib/planner/detectRecurring'

interface PlannerClientProps {
  initialPlanned: PlannedExpense[]
  categories: Category[]
  transactions: Transaction[]
  userId: string
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]
const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const RECURRENCE_LABELS = {
  none: '',
  weekly: '🔁 Semanal',
  monthly: '🔁 Mensual',
  yearly: '🔁 Anual',
}

const SEEN_SUGGESTIONS_KEY = 'katana-planner-suggestions-seen'

export function PlannerClient({ initialPlanned, categories, transactions, userId }: PlannerClientProps) {
  const supabase = createClient()
  const [planned, setPlanned] = useState<PlannedExpense[]>(initialPlanned)
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<PlannedExpense | undefined>()
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  // Detect recurring expenses from transaction history
  const recurringSuggestions = useMemo(
    () => detectRecurringExpenses(transactions, planned),
    [transactions, planned]
  )

  // Show banner on first visit if there are suggestions
  useEffect(() => {
    const seen = localStorage.getItem(SEEN_SUGGESTIONS_KEY)
    if (!seen && recurringSuggestions.length > 0) {
      setShowBanner(true)
    }
  }, [recurringSuggestions.length])

  const dismissBanner = () => {
    setShowBanner(false)
    localStorage.setItem(SEEN_SUGGESTIONS_KEY, 'true')
  }

  const openSuggestions = () => {
    setSuggestionsOpen(true)
    dismissBanner()
  }

  const currentYear = viewDate.getFullYear()
  const currentMonth = viewDate.getMonth()

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()

    // Get Monday-based start (0=Monday, 6=Sunday)
    const firstDayWeekday = (firstDayOfMonth.getDay() + 6) % 7
    const days: Array<{ date: string; day: number; isCurrentMonth: boolean }> = []

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i
      const prevMonthDate = new Date(currentYear, currentMonth - 1, day)
      days.push({
        date: prevMonthDate.toISOString().split('T')[0],
        day,
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day)
      days.push({
        date: dateObj.toISOString().split('T')[0],
        day,
        isCurrentMonth: true,
      })
    }

    // Next month padding to complete 42 cells (6 rows)
    const remaining = 42 - days.length
    for (let day = 1; day <= remaining; day++) {
      const nextMonthDate = new Date(currentYear, currentMonth + 1, day)
      days.push({
        date: nextMonthDate.toISOString().split('T')[0],
        day,
        isCurrentMonth: false,
      })
    }

    return days
  }, [currentYear, currentMonth])

  // Expand recurring expenses to include occurrences in current view
  const expandedPlanned = useMemo(() => {
    const result: PlannedExpense[] = []

    for (const exp of planned) {
      const expDate = new Date(exp.planned_date)

      if (exp.recurrence === 'none') {
        result.push(exp)
        continue
      }

      // Include original
      result.push(exp)

      // Expand recurrence: show only current month's occurrences (if different month)
      if (exp.recurrence === 'monthly') {
        // If the planned_date is in a different month, create a virtual occurrence
        const virtualDate = new Date(currentYear, currentMonth, expDate.getDate())
        if (
          virtualDate.getMonth() === currentMonth &&
          virtualDate.getFullYear() === currentYear &&
          (expDate.getMonth() !== currentMonth || expDate.getFullYear() !== currentYear)
        ) {
          result.push({
            ...exp,
            id: `${exp.id}-${currentYear}-${currentMonth}`,
            planned_date: virtualDate.toISOString().split('T')[0],
            is_paid: false,
          })
        }
      }
    }

    return result
  }, [planned, currentYear, currentMonth])

  // Index planned expenses by date
  const plannedByDate = useMemo(() => {
    const map: Record<string, PlannedExpense[]> = {}
    for (const exp of expandedPlanned) {
      if (!map[exp.planned_date]) map[exp.planned_date] = []
      map[exp.planned_date].push(exp)
    }
    return map
  }, [expandedPlanned])

  // Index real transactions by date (for unified view)
  const transactionsByDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {}
    for (const tx of transactions) {
      if (!map[tx.transaction_date]) map[tx.transaction_date] = []
      map[tx.transaction_date].push(tx)
    }
    return map
  }, [transactions])

  // Stats for current month (real + planned)
  const monthStats = useMemo(() => {
    const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
    const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]

    // Real transactions this month
    const monthTransactions = transactions.filter(
      (t) => t.transaction_date >= monthStart && t.transaction_date <= monthEnd
    )
    const realTotal = monthTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Planned expenses this month
    const monthPlanned = expandedPlanned.filter(
      (e) => e.planned_date >= monthStart && e.planned_date <= monthEnd
    )
    const plannedTotal = monthPlanned.reduce((sum, e) => sum + e.amount, 0)
    const pending = monthPlanned.filter((e) => !e.is_paid)
    const pendingTotal = pending.reduce((sum, e) => sum + e.amount, 0)
    const paid = monthPlanned.filter((e) => e.is_paid)
    const paidTotal = paid.reduce((sum, e) => sum + e.amount, 0)

    // Projected: real + pending planned (paid planned already become transactions)
    const projected = realTotal + pendingTotal

    return {
      realTotal,
      realCount: monthTransactions.length,
      plannedTotal,
      pendingCount: pending.length,
      pendingTotal,
      paidCount: paid.length,
      paidTotal,
      totalCount: monthPlanned.length,
      projected,
    }
  }, [expandedPlanned, transactions, currentYear, currentMonth])

  // Upcoming expenses (next 30 days)
  const upcomingExpenses = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const in30Days = new Date()
    in30Days.setDate(in30Days.getDate() + 30)
    const in30DaysStr = in30Days.toISOString().split('T')[0]

    return expandedPlanned
      .filter((e) => !e.is_paid && e.planned_date >= today && e.planned_date <= in30DaysStr)
      .sort((a, b) => a.planned_date.localeCompare(b.planned_date))
  }, [expandedPlanned])

  const goToPrevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1))
  const goToNextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1))
  const goToToday = () => {
    setViewDate(new Date())
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  const handleAddForDate = (date: string) => {
    setEditingExpense(undefined)
    setSelectedDate(date)
    setModalOpen(true)
  }

  const handleEdit = (exp: PlannedExpense) => {
    // Don't edit virtual recurring occurrences
    if (exp.id.includes('-') && exp.id.length > 36) {
      toast.error('No puedes editar una ocurrencia recurrente. Edita el gasto original.')
      return
    }
    setEditingExpense(exp)
    setModalOpen(true)
  }

  const handleTogglePaid = async (exp: PlannedExpense) => {
    // Don't toggle virtual occurrences
    if (exp.id.includes('-') && exp.id.length > 36) {
      toast.error('Para marcar como pagado, usa el gasto original')
      return
    }

    const newPaidStatus = !exp.is_paid

    if (newPaidStatus) {
      // Create transaction when marking as paid
      const { data: tx, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          category_id: exp.category_id,
          type: 'expense',
          amount: exp.amount,
          description: exp.description,
          transaction_date: new Date().toISOString().split('T')[0],
          source: 'manual',
        })
        .select('id')
        .single()

      if (txError) {
        toast.error('Error al crear transacción')
        return
      }

      const { error } = await supabase
        .from('planned_expenses')
        .update({ is_paid: true, paid_transaction_id: tx?.id })
        .eq('id', exp.id)

      if (error) {
        toast.error('Error al marcar como pagado')
        return
      }

      setPlanned((prev) =>
        prev.map((e) => (e.id === exp.id ? { ...e, is_paid: true, paid_transaction_id: tx?.id } : e))
      )
      toast.success('✓ Pagado y registrado como transacción')
    } else {
      // Unmark paid: delete associated transaction
      if (exp.paid_transaction_id) {
        await supabase.from('transactions').delete().eq('id', exp.paid_transaction_id)
      }
      const { error } = await supabase
        .from('planned_expenses')
        .update({ is_paid: false, paid_transaction_id: null })
        .eq('id', exp.id)

      if (error) {
        toast.error('Error al desmarcar')
        return
      }

      setPlanned((prev) =>
        prev.map((e) => (e.id === exp.id ? { ...e, is_paid: false, paid_transaction_id: null } : e))
      )
      toast.success('Desmarcado como pagado')
    }
  }

  const handleDelete = async (exp: PlannedExpense) => {
    if (exp.id.includes('-') && exp.id.length > 36) {
      toast.error('No puedes eliminar una ocurrencia recurrente')
      return
    }
    if (!confirm('¿Eliminar este gasto planificado?')) return

    const { error } = await supabase.from('planned_expenses').delete().eq('id', exp.id)
    if (error) {
      toast.error('Error al eliminar')
      return
    }
    setPlanned((prev) => prev.filter((e) => e.id !== exp.id))
    toast.success('Gasto eliminado')
  }

  const handleModalSuccess = (newOrUpdated: PlannedExpense) => {
    if (editingExpense) {
      setPlanned((prev) => prev.map((e) => (e.id === newOrUpdated.id ? newOrUpdated : e)))
    } else {
      setPlanned((prev) => [...prev, newOrUpdated])
    }
    setModalOpen(false)
    setEditingExpense(undefined)
  }

  const today = new Date().toISOString().split('T')[0]
  const selectedDayExpenses = selectedDate ? plannedByDate[selectedDate] || [] : []
  const selectedDayReal = selectedDate ? transactionsByDate[selectedDate] || [] : []
  const selectedIsPast = selectedDate ? selectedDate < today : false

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
            <CalendarIcon className="h-7 w-7 text-violet-light" />
            Planificador de Gastos
          </h1>
          <p className="text-text-secondary mt-1">
            Pronostica tus gastos futuros y visualiza tu cierre de mes
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {recurringSuggestions.length > 0 && (
            <button
              onClick={openSuggestions}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-light text-sm font-semibold hover:bg-violet-500/20 transition-all"
              title="Detectar gastos recurrentes"
            >
              <Sparkles className="h-4 w-4" />
              {recurringSuggestions.length} {recurringSuggestions.length === 1 ? 'sugerencia' : 'sugerencias'}
            </button>
          )}
          <GradientButton onClick={() => handleAddForDate(today)} className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo gasto
          </GradientButton>
        </div>
      </div>

      {/* Suggestions banner (first visit) */}
      {showBanner && recurringSuggestions.length > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 relative">
          <button
            onClick={dismissBanner}
            className="absolute top-3 right-3 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3 pr-8">
            <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-violet-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-text-primary mb-1">
                ✨ Detectamos {recurringSuggestions.length} {recurringSuggestions.length === 1 ? 'gasto recurrente' : 'gastos recurrentes'}
              </h3>
              <p className="text-sm text-text-secondary mb-3">
                Basado en tus últimos 3 meses, podrías planificarlos automáticamente y tener mejor control de tu mes.
              </p>
              <button
                onClick={openSuggestions}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg transition-all"
              >
                <Sparkles className="h-4 w-4" />
                Revisar sugerencias
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Month stats cards - Real + Planned + Projected */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-4 border-l-4 border-vermillion-shu">
          <p className="text-xs text-text-muted mb-1">Gastado real</p>
          <p className="text-xl font-bold font-mono text-vermillion-shu">{formatCLP(monthStats.realTotal)}</p>
          <p className="text-xs text-text-muted mt-1">{monthStats.realCount} transacciones</p>
        </div>
        <div className="glass-card rounded-xl p-4 border-l-4 border-yellow-400">
          <p className="text-xs text-text-muted mb-1">Planificado pendiente</p>
          <p className="text-xl font-bold font-mono text-yellow-400">{formatCLP(monthStats.pendingTotal)}</p>
          <p className="text-xs text-text-muted mt-1">{monthStats.pendingCount} gastos</p>
        </div>
        <div className="glass-card rounded-xl p-4 border-l-4 border-violet-light bg-violet-500/5">
          <p className="text-xs text-violet-light mb-1 font-semibold">Proyectado mes</p>
          <p className="text-xl font-bold font-mono text-violet-light">{formatCLP(monthStats.projected)}</p>
          <p className="text-xs text-text-muted mt-1">real + pendiente</p>
        </div>
        <div className="glass-card rounded-xl p-4 border-l-4 border-bamboo-take">
          <p className="text-xs text-text-muted mb-1">Planificado pagado</p>
          <p className="text-xl font-bold font-mono text-bamboo-take">{formatCLP(monthStats.paidTotal)}</p>
          <p className="text-xs text-text-muted mt-1">{monthStats.paidCount} gastos ya pagados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-4 md:p-6">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPrevMonth}
              className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-bold text-text-primary capitalize">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={goToToday}
                className="text-xs text-violet-light hover:text-violet-primary transition-colors"
              >
                Ir a hoy
              </button>
            </div>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_SHORT.map((day, i) => (
              <div
                key={i}
                className="text-center text-xs font-semibold text-text-muted py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const dayPlanned = plannedByDate[day.date] || []
              const dayReal = transactionsByDate[day.date] || []
              const hasPlanned = dayPlanned.length > 0
              const hasReal = dayReal.length > 0
              const hasAnything = hasPlanned || hasReal

              const plannedTotal = dayPlanned.reduce((sum, e) => sum + e.amount, 0)
              const realTotal = dayReal.reduce((sum, t) => sum + t.amount, 0)
              const dayTotal = plannedTotal + realTotal

              const isToday = day.date === today
              const isSelected = day.date === selectedDate
              const isPast = day.date < today
              const hasPendingPlanned = dayPlanned.some((e) => !e.is_paid)

              // Mix of dots (max 4 total)
              const dots: Array<'real' | 'paid' | 'pending'> = [
                ...dayReal.map(() => 'real' as const),
                ...dayPlanned.map((e) => (e.is_paid ? ('paid' as const) : ('pending' as const))),
              ].slice(0, 4)

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day.date)}
                  className={`
                    relative aspect-square flex flex-col items-center justify-start p-1.5 rounded-lg
                    transition-all text-sm
                    ${!day.isCurrentMonth ? 'text-text-muted/40' : 'text-text-primary'}
                    ${isSelected
                      ? 'bg-violet-500/20 border-2 border-violet-400 shadow-lg'
                      : isToday
                        ? 'bg-violet-500/10 border border-violet-500/40'
                        : 'hover:bg-surface-hover border border-transparent'
                    }
                  `}
                >
                  <span className={`font-semibold ${isToday ? 'text-violet-light' : ''}`}>
                    {day.day}
                  </span>

                  {hasAnything && (
                    <>
                      {/* Dots indicator */}
                      <div className="flex items-center gap-0.5 mt-0.5 flex-wrap justify-center">
                        {dots.map((type, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              type === 'real'
                                ? 'bg-vermillion-shu'
                                : type === 'paid'
                                  ? 'bg-bamboo-take'
                                  : 'bg-yellow-400'
                            }`}
                          />
                        ))}
                        {(dayReal.length + dayPlanned.length) > 4 && (
                          <span className="text-[8px] text-text-muted">+</span>
                        )}
                      </div>

                      {/* Total */}
                      <span className={`text-[9px] font-mono mt-auto ${
                        isPast ? 'text-vermillion-shu' : hasPendingPlanned ? 'text-yellow-400' : 'text-bamboo-take'
                      }`}>
                        {formatCLP(dayTotal).replace('$', '')}
                      </span>
                    </>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-text-muted pt-3 border-t border-surface-border/50 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-vermillion-shu" />
              <span>Gastado real</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>Pendiente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-bamboo-take" />
              <span>Pagado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-violet-light/40" />
              <span>Hoy</span>
            </div>
          </div>
        </div>

        {/* Selected day / Upcoming list */}
        <div className="glass-card rounded-2xl p-4 md:p-6">
          {selectedDate ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-text-primary">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-CL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </h3>
                <button
                  onClick={() => handleAddForDate(selectedDate)}
                  className="p-1.5 rounded-lg bg-violet-500/10 text-violet-light hover:bg-violet-500/20 transition-colors"
                  title="Agregar gasto"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {selectedDayExpenses.length === 0 && selectedDayReal.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-text-muted">
                    {selectedIsPast ? 'Sin gastos registrados este día' : 'Sin gastos planificados'}
                  </p>
                  {!selectedIsPast && (
                    <button
                      onClick={() => handleAddForDate(selectedDate)}
                      className="mt-3 text-sm text-violet-light hover:text-violet-primary transition-colors"
                    >
                      + Agregar uno
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Real transactions */}
                  {selectedDayReal.length > 0 && (
                    <>
                      <p className="text-[10px] text-vermillion-shu uppercase tracking-wide font-semibold mt-2">
                        🔴 Ya gastado
                      </p>
                      {selectedDayReal.map((tx) => (
                        <div
                          key={tx.id}
                          className="rounded-xl p-3 bg-vermillion-shu/5 border border-vermillion-shu/20"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                              style={{ backgroundColor: (tx.categories?.color ?? '#EF4444') + '20' }}
                            >
                              {tx.categories?.icon ?? '💸'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-text-primary truncate">
                                {tx.description || tx.categories?.name}
                              </p>
                              <p className="text-xs text-text-muted">
                                {tx.categories?.name || 'Sin categoría'}
                              </p>
                            </div>
                            <span className="font-mono font-bold text-sm text-vermillion-shu">
                              {formatCLP(tx.amount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Planned expenses */}
                  {selectedDayExpenses.length > 0 && (
                    <>
                      {selectedDayReal.length > 0 && (
                        <p className="text-[10px] text-yellow-400 uppercase tracking-wide font-semibold mt-3">
                          🟡 Planificado
                        </p>
                      )}
                      {selectedDayExpenses.map((exp) => (
                        <ExpenseItem
                          key={exp.id}
                          expense={exp}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onTogglePaid={handleTogglePaid}
                        />
                      ))}
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-violet-light" />
                <h3 className="font-bold text-text-primary">Próximos 30 días</h3>
              </div>

              {upcomingExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-text-muted">No tienes gastos planificados</p>
                  <button
                    onClick={() => handleAddForDate(today)}
                    className="mt-3 text-sm text-violet-light hover:text-violet-primary transition-colors"
                  >
                    + Agregar uno
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingExpenses.slice(0, 10).map((exp) => (
                    <ExpenseItem
                      key={exp.id}
                      expense={exp}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onTogglePaid={handleTogglePaid}
                      showDate
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <PlannedExpenseModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingExpense(undefined)
        }}
        onSuccess={handleModalSuccess}
        categories={categories}
        userId={userId}
        defaultDate={selectedDate || today}
        editing={editingExpense}
      />

      {/* Suggestions modal */}
      <RecurringSuggestionsModal
        open={suggestionsOpen}
        onClose={() => setSuggestionsOpen(false)}
        suggestions={recurringSuggestions}
        categories={categories}
        userId={userId}
        onSuccess={(created) => {
          setPlanned((prev) => [...prev, ...created])
          setSuggestionsOpen(false)
          toast.success(`✨ ${created.length} ${created.length === 1 ? 'gasto planificado creado' : 'gastos planificados creados'}`)
        }}
      />
    </div>
  )
}

function ExpenseItem({
  expense,
  onEdit,
  onDelete,
  onTogglePaid,
  showDate = false,
}: {
  expense: PlannedExpense
  onEdit: (e: PlannedExpense) => void
  onDelete: (e: PlannedExpense) => void
  onTogglePaid: (e: PlannedExpense) => void
  showDate?: boolean
}) {
  const isVirtual = expense.id.includes('-') && expense.id.length > 36

  return (
    <div
      className={`group rounded-xl p-3 transition-all ${
        expense.is_paid
          ? 'bg-bamboo-take/5 border border-bamboo-take/20'
          : 'bg-surface-secondary border border-surface-border hover:border-violet-500/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onTogglePaid(expense)}
          className="mt-0.5 flex-shrink-0 transition-colors"
          title={expense.is_paid ? 'Marcar como pendiente' : 'Marcar como pagado'}
        >
          {expense.is_paid ? (
            <CheckCircle2 className="h-5 w-5 text-bamboo-take" />
          ) : (
            <Circle className="h-5 w-5 text-text-muted hover:text-violet-light" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold text-sm ${expense.is_paid ? 'text-text-muted line-through' : 'text-text-primary'}`}>
              {expense.description}
            </p>
            {expense.recurrence !== 'none' && !isVirtual && (
              <span className="text-[10px] text-violet-light bg-violet-500/10 px-1.5 py-0.5 rounded">
                {RECURRENCE_LABELS[expense.recurrence]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
            {expense.categories && (
              <span className="flex items-center gap-1">
                {expense.categories.icon} {expense.categories.name}
              </span>
            )}
            {showDate && (
              <>
                <span>·</span>
                <span>
                  {new Date(expense.planned_date + 'T12:00:00').toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={`font-mono font-bold text-sm ${
            expense.is_paid ? 'text-text-muted line-through' : 'text-vermillion-shu'
          }`}>
            {formatCLP(expense.amount)}
          </span>

          {!isVirtual && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(expense)}
                className="p-1 rounded text-text-muted hover:text-violet-light transition-colors"
                title="Editar"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <button
                onClick={() => onDelete(expense)}
                className="p-1 rounded text-text-muted hover:text-vermillion-shu transition-colors"
                title="Eliminar"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
