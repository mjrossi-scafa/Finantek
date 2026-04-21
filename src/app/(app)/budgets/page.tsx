import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { BudgetsClient } from './BudgetsClient'
import { Budget, Category, MonthlySummary, PlannedExpense, Transaction } from '@/types/database'
import { Target } from 'lucide-react'

export default async function BudgetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const monthEnd = new Date(year, month, 0).toISOString().split('T')[0]
  const todayStr = now.toISOString().split('T')[0]

  // 3 months back for AI suggestions
  const threeMonthsAgo = new Date(year, month - 4, 1).toISOString().split('T')[0]

  const [
    budgetsResult,
    categoriesResult,
    spendingResult,
    summaryResult,
    plannedResult,
    historicalTxResult,
  ] = await Promise.all([
    supabase
      .from('budgets')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order'),
    supabase.rpc('get_spending_by_category', { p_year: year, p_month: month }),
    supabase.rpc('get_monthly_summary', { p_year: year, p_month: month }),
    supabase
      .from('planned_expenses')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .eq('is_paid', false)
      .gte('planned_date', todayStr)
      .lte('planned_date', monthEnd),
    supabase
      .from('transactions')
      .select('category_id, amount, transaction_date')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('transaction_date', threeMonthsAgo),
  ])

  const budgets = (budgetsResult.data ?? []) as Budget[]
  const categories = (categoriesResult.data ?? []) as Category[]
  const spending = (spendingResult.data ?? []) as { category_id: string; total: number }[]
  const summary = (summaryResult.data ?? []) as MonthlySummary[]
  const plannedExpenses = (plannedResult.data ?? []) as PlannedExpense[]
  const historicalTransactions = (historicalTxResult.data ?? []) as Pick<Transaction, 'category_id' | 'amount' | 'transaction_date'>[]

  const spendingMap = new Map(spending.map((s) => [s.category_id, s.total]))
  const monthlyIncome = summary.find((s) => s.type === 'income')?.total ?? 0

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        icon={<Target className="h-7 w-7 text-violet-light" />}
        title="Presupuestos"
        description="Establece límites mensuales o anuales por categoría"
      />
      <BudgetsClient
        budgets={budgets}
        categories={categories}
        spendingMap={Object.fromEntries(spendingMap)}
        plannedExpenses={plannedExpenses}
        historicalTransactions={historicalTransactions}
        monthlyIncome={monthlyIncome}
        userId={user.id}
      />
    </div>
  )
}
