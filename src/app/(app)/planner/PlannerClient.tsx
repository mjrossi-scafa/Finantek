'use client'

import { useState, useMemo } from 'react'
import { PlannedExpense, Category } from '@/types/database'
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
} from 'lucide-react'
import { PlannedExpenseModal } from '@/components/planner/PlannedExpenseModal'
import { GradientButton } from '@/components/shared/GradientButton'

interface PlannerClientProps {
  initialPlanned: PlannedExpense[]
  categories: Category[]
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

export function PlannerClient({ initialPlanned, categories, userId }: PlannerClientProps) {
  const supabase = createClient()
  const [planned, setPlanned] = useState<PlannedExpense[]>(initialPlanned)
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<PlannedExpense | undefined>()

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

  // Stats for current month
  const monthStats = useMemo(() => {
    const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
    const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]

    const monthExpenses = expandedPlanned.filter(
      (e) => e.planned_date >= monthStart && e.planned_date <= monthEnd
    )
    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
    const pending = monthExpenses.filter((e) => !e.is_paid)
    const pendingTotal = pending.reduce((sum, e) => sum + e.amount, 0)
    const paid = monthExpenses.filter((e) => e.is_paid)
    const paidTotal = paid.reduce((sum, e) => sum + e.amount, 0)

    return {
      total,
      pendingCount: pending.length,
      pendingTotal,
      paidCount: paid.length,
      paidTotal,
      totalCount: monthExpenses.length,
    }
  }, [expandedPlanned, currentYear, currentMonth])

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
        <GradientButton onClick={() => handleAddForDate(today)} className="rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo gasto
        </GradientButton>
      </div>

      {/* Month stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-text-muted mb-1">Total del mes</p>
          <p className="text-xl font-bold font-mono text-text-primary">{formatCLP(monthStats.total)}</p>
          <p className="text-xs text-text-muted mt-1">{monthStats.totalCount} gastos</p>
        </div>
        <div className="glass-card rounded-xl p-4 border-l-4 border-vermillion-shu">
          <p className="text-xs text-text-muted mb-1">Pendiente</p>
          <p className="text-xl font-bold font-mono text-vermillion-shu">{formatCLP(monthStats.pendingTotal)}</p>
          <p className="text-xs text-text-muted mt-1">{monthStats.pendingCount} gastos</p>
        </div>
        <div className="glass-card rounded-xl p-4 border-l-4 border-bamboo-take">
          <p className="text-xs text-text-muted mb-1">Pagado</p>
          <p className="text-xl font-bold font-mono text-bamboo-take">{formatCLP(monthStats.paidTotal)}</p>
          <p className="text-xs text-text-muted mt-1">{monthStats.paidCount} gastos</p>
        </div>
        <div className="glass-card rounded-xl p-4 border-l-4 border-violet-light">
          <p className="text-xs text-text-muted mb-1">Próximos 30 días</p>
          <p className="text-xl font-bold font-mono text-violet-light">
            {formatCLP(upcomingExpenses.reduce((sum, e) => sum + e.amount, 0))}
          </p>
          <p className="text-xs text-text-muted mt-1">{upcomingExpenses.length} gastos</p>
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
              const dayExpenses = plannedByDate[day.date] || []
              const hasExpenses = dayExpenses.length > 0
              const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0)
              const isToday = day.date === today
              const isSelected = day.date === selectedDate
              const allPaid = hasExpenses && dayExpenses.every((e) => e.is_paid)

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

                  {hasExpenses && (
                    <>
                      {/* Dots indicator */}
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {dayExpenses.slice(0, 3).map((exp, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              exp.is_paid ? 'bg-bamboo-take' : 'bg-vermillion-shu'
                            }`}
                          />
                        ))}
                        {dayExpenses.length > 3 && (
                          <span className="text-[8px] text-text-muted">+</span>
                        )}
                      </div>

                      {/* Total on hover (desktop) */}
                      <span className={`text-[9px] font-mono mt-auto ${
                        allPaid ? 'text-bamboo-take' : 'text-vermillion-shu'
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
          <div className="flex items-center gap-4 mt-4 text-xs text-text-muted pt-3 border-t border-surface-border/50">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-vermillion-shu" />
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

              {selectedDayExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-text-muted">Sin gastos planificados</p>
                  <button
                    onClick={() => handleAddForDate(selectedDate)}
                    className="mt-3 text-sm text-violet-light hover:text-violet-primary transition-colors"
                  >
                    + Agregar uno
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayExpenses.map((exp) => (
                    <ExpenseItem
                      key={exp.id}
                      expense={exp}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onTogglePaid={handleTogglePaid}
                    />
                  ))}
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
