'use client'

import { useState, useMemo } from 'react'
import { Budget, Category, PlannedExpense, Transaction } from '@/types/database'
import { BudgetCard } from '@/components/budgets/BudgetCard'
import { BudgetForm } from '@/components/budgets/BudgetForm'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatCLP } from '@/lib/utils/currency'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Sparkles, Copy, Zap, TrendingDown, DollarSign, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { SuggestionsModal } from '@/components/budgets/SuggestionsModal'

interface BudgetsClientProps {
  budgets: Budget[]
  categories: Category[]
  spendingMap: Record<string, number>
  plannedExpenses: PlannedExpense[]
  historicalTransactions: Pick<Transaction, 'category_id' | 'amount' | 'transaction_date'>[]
  monthlyIncome: number
  userId: string
}

export function BudgetsClient({
  budgets,
  categories,
  spendingMap,
  plannedExpenses,
  historicalTransactions,
  monthlyIncome,
  userId,
}: BudgetsClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>()
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Filter budgets for current month only
  const currentBudgets = budgets.filter(
    (b) => b.period_type === 'annual' || (b.year === currentYear && b.month === currentMonth)
  )

  // Calculate planned expenses by category (for projection)
  const plannedByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of plannedExpenses) {
      if (!p.category_id) continue
      map[p.category_id] = (map[p.category_id] || 0) + p.amount
    }
    return map
  }, [plannedExpenses])

  // Historical compliance: count months where user stayed within budget
  const complianceByCategory = useMemo(() => {
    // Group historical transactions by category + month
    const spendByCategoryMonth = new Map<string, Map<string, number>>()
    for (const tx of historicalTransactions) {
      if (!tx.category_id) continue
      const monthKey = tx.transaction_date.slice(0, 7)
      if (!spendByCategoryMonth.has(tx.category_id)) {
        spendByCategoryMonth.set(tx.category_id, new Map())
      }
      const catMap = spendByCategoryMonth.get(tx.category_id)!
      catMap.set(monthKey, (catMap.get(monthKey) || 0) + tx.amount)
    }

    // For each budget, count months where spend <= budget.amount
    const result: Record<string, { total: number; cumplidos: number }> = {}
    for (const b of currentBudgets) {
      if (b.period_type !== 'monthly') continue
      const monthMap = spendByCategoryMonth.get(b.category_id)
      if (!monthMap) {
        result[b.id] = { total: 0, cumplidos: 0 }
        continue
      }
      const months = Array.from(monthMap.entries())
      const cumplidos = months.filter(([, amount]) => amount <= b.amount).length
      result[b.id] = { total: months.length, cumplidos }
    }
    return result
  }, [historicalTransactions, currentBudgets])

  // Global stats
  const globalStats = useMemo(() => {
    const totalBudgeted = currentBudgets.reduce((sum, b) => sum + b.amount, 0)
    const totalSpent = currentBudgets.reduce(
      (sum, b) => sum + (spendingMap[b.category_id] ?? 0),
      0
    )
    const totalPlanned = currentBudgets.reduce(
      (sum, b) => sum + (plannedByCategory[b.category_id] ?? 0),
      0
    )
    const totalProjected = totalSpent + totalPlanned
    const totalRemaining = totalBudgeted - totalProjected
    const pct = totalBudgeted > 0 ? Math.round((totalProjected / totalBudgeted) * 100) : 0
    return {
      totalBudgeted,
      totalSpent,
      totalPlanned,
      totalProjected,
      totalRemaining,
      pct,
    }
  }, [currentBudgets, spendingMap, plannedByCategory])

  async function deleteBudget(id: string) {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) {
      toast.error('Error al eliminar')
    } else {
      toast.success('Presupuesto eliminado')
      router.refresh()
    }
  }

  async function handleCopyFromLastMonth() {
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear

    const { data: prevBudgets, error: fetchError } = await supabase
      .from('budgets')
      .select('category_id, amount')
      .eq('user_id', userId)
      .eq('period_type', 'monthly')
      .eq('year', prevYear)
      .eq('month', prevMonth)

    if (fetchError) {
      toast.error('Error al obtener presupuestos anteriores')
      return
    }

    if (!prevBudgets || prevBudgets.length === 0) {
      toast.info('No hay presupuestos del mes anterior para copiar')
      return
    }

    // Filter out categories that already have a budget this month
    const existingCategoryIds = new Set(
      currentBudgets
        .filter((b) => b.period_type === 'monthly')
        .map((b) => b.category_id)
    )
    const toCreate = prevBudgets
      .filter((b) => !existingCategoryIds.has(b.category_id))
      .map((b) => ({
        user_id: userId,
        category_id: b.category_id,
        period_type: 'monthly' as const,
        amount: b.amount,
        year: currentYear,
        month: currentMonth,
      }))

    if (toCreate.length === 0) {
      toast.info('Ya tienes presupuestos para todas las categorías del mes anterior')
      return
    }

    const { error } = await supabase.from('budgets').insert(toCreate)
    if (error) {
      toast.error('Error al copiar', { description: error.message })
    } else {
      toast.success(`✓ ${toCreate.length} ${toCreate.length === 1 ? 'presupuesto copiado' : 'presupuestos copiados'}`)
      router.refresh()
    }
  }

  async function handleApply50_30_20() {
    if (monthlyIncome <= 0) {
      toast.error('Registra tus ingresos primero', {
        description: 'Necesitamos saber tus ingresos para calcular la plantilla',
      })
      return
    }

    // 50% needs, 30% wants, 20% savings
    const needs = Math.round(monthlyIncome * 0.5)
    const wants = Math.round(monthlyIncome * 0.3)

    // Categories for "needs"
    const needsCategories = categories.filter((c) =>
      c.type === 'expense' &&
      ['Alimentación', 'Transporte', 'Hogar', 'Salud', 'Educación'].some((n) =>
        c.name.toLowerCase().includes(n.toLowerCase())
      )
    )
    // Categories for "wants"
    const wantsCategories = categories.filter((c) =>
      c.type === 'expense' &&
      ['Entretenimiento', 'Ropa', 'Otros'].some((n) =>
        c.name.toLowerCase().includes(n.toLowerCase())
      )
    )

    if (needsCategories.length === 0 && wantsCategories.length === 0) {
      toast.error('No se pudieron asignar categorías para la plantilla')
      return
    }

    const needsPerCategory = needsCategories.length > 0 ? Math.round(needs / needsCategories.length) : 0
    const wantsPerCategory = wantsCategories.length > 0 ? Math.round(wants / wantsCategories.length) : 0

    const existingCategoryIds = new Set(
      currentBudgets
        .filter((b) => b.period_type === 'monthly')
        .map((b) => b.category_id)
    )

    const toCreate = [
      ...needsCategories
        .filter((c) => !existingCategoryIds.has(c.id))
        .map((c) => ({
          user_id: userId,
          category_id: c.id,
          period_type: 'monthly' as const,
          amount: needsPerCategory,
          year: currentYear,
          month: currentMonth,
        })),
      ...wantsCategories
        .filter((c) => !existingCategoryIds.has(c.id))
        .map((c) => ({
          user_id: userId,
          category_id: c.id,
          period_type: 'monthly' as const,
          amount: wantsPerCategory,
          year: currentYear,
          month: currentMonth,
        })),
    ]

    if (toCreate.length === 0) {
      toast.info('Ya tienes presupuestos para todas las categorías')
      return
    }

    const { error } = await supabase.from('budgets').insert(toCreate)
    if (error) {
      toast.error('Error al aplicar plantilla')
    } else {
      toast.success(`✓ Plantilla 50/30/20 aplicada`, {
        description: `${toCreate.length} presupuestos creados. Revisa y ajusta.`,
      })
      router.refresh()
    }
  }

  const hasCurrentBudgets = currentBudgets.length > 0

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      {hasCurrentBudgets && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-violet-light" />
              <p className="text-xs text-text-muted">Presupuestado</p>
            </div>
            <p className="text-xl font-bold font-mono text-text-primary">
              {formatCLP(globalStats.totalBudgeted)}
            </p>
            <p className="text-xs text-text-muted mt-1">{currentBudgets.length} categorías</p>
          </div>

          <div className="glass-card rounded-xl p-4 border-l-4 border-vermillion-shu">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-vermillion-shu" />
              <p className="text-xs text-text-muted">Gastado real</p>
            </div>
            <p className="text-xl font-bold font-mono text-vermillion-shu">
              {formatCLP(globalStats.totalSpent)}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {globalStats.totalBudgeted > 0
                ? `${Math.round((globalStats.totalSpent / globalStats.totalBudgeted) * 100)}% del total`
                : '0% del total'}
            </p>
          </div>

          <div className="glass-card rounded-xl p-4 border-l-4 border-yellow-400">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-yellow-400" />
              <p className="text-xs text-text-muted">Proyectado</p>
            </div>
            <p className="text-xl font-bold font-mono text-yellow-400">
              {formatCLP(globalStats.totalProjected)}
            </p>
            <p className="text-xs text-text-muted mt-1">
              real + planificado
            </p>
          </div>

          <div
            className={`glass-card rounded-xl p-4 border-l-4 ${
              globalStats.totalRemaining >= 0 ? 'border-bamboo-take' : 'border-vermillion-shu'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <DollarSign
                className={`h-4 w-4 ${
                  globalStats.totalRemaining >= 0 ? 'text-bamboo-take' : 'text-vermillion-shu'
                }`}
              />
              <p className="text-xs text-text-muted">
                {globalStats.totalRemaining >= 0 ? 'Disponible' : 'Excedido'}
              </p>
            </div>
            <p
              className={`text-xl font-bold font-mono ${
                globalStats.totalRemaining >= 0 ? 'text-bamboo-take' : 'text-vermillion-shu'
              }`}
            >
              {formatCLP(Math.abs(globalStats.totalRemaining))}
            </p>
            <p className="text-xs text-text-muted mt-1">{globalStats.pct}% usado</p>
          </div>
        </div>
      )}

      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSuggestionsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-light text-xs font-semibold hover:bg-violet-500/20 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Sugerencias IA
          </button>

          <button
            onClick={handleApply50_30_20}
            disabled={monthlyIncome <= 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-secondary border border-surface-border text-text-secondary text-xs font-semibold hover:border-violet-500/30 hover:text-text-primary transition-all disabled:opacity-50"
            title={monthlyIncome <= 0 ? 'Necesitas registrar ingresos primero' : 'Aplicar regla 50/30/20'}
          >
            <Zap className="h-3.5 w-3.5" />
            Plantilla 50/30/20
          </button>

          <button
            onClick={handleCopyFromLastMonth}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-secondary border border-surface-border text-text-secondary text-xs font-semibold hover:border-violet-500/30 hover:text-text-primary transition-all"
          >
            <Copy className="h-3.5 w-3.5" />
            Copiar del mes anterior
          </button>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 px-4 py-2 text-sm gradient-primary text-white hover:glow-violet-strong active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            Nuevo presupuesto
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo presupuesto</DialogTitle>
            </DialogHeader>
            <BudgetForm
              categories={categories}
              userId={userId}
              onSuccess={() => setCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Budgets grid */}
      {budgets.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Sin presupuestos"
          description="Crea presupuestos para controlar tus gastos por categoría. Usa las sugerencias IA para empezar rápido."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spent={spendingMap[budget.category_id] ?? 0}
              planned={plannedByCategory[budget.category_id] ?? 0}
              compliance={complianceByCategory[budget.id]}
              onDelete={deleteBudget}
              onEdit={() => setEditingBudget(budget)}
            />
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editingBudget} onOpenChange={(open) => !open && setEditingBudget(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar presupuesto</DialogTitle>
          </DialogHeader>
          {editingBudget && (
            <BudgetForm
              categories={categories}
              userId={userId}
              editing={editingBudget}
              onSuccess={() => setEditingBudget(undefined)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* AI Suggestions modal */}
      <SuggestionsModal
        open={suggestionsOpen}
        onClose={() => setSuggestionsOpen(false)}
        categories={categories}
        historicalTransactions={historicalTransactions}
        existingBudgets={currentBudgets}
        userId={userId}
        year={currentYear}
        month={currentMonth}
        onSuccess={() => {
          setSuggestionsOpen(false)
          router.refresh()
        }}
      />
    </div>
  )
}

