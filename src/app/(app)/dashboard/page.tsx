import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import {
  MonthlySummary,
  CategorySpending,
  MonthlyTrend,
  WeeklyComparison,
  Transaction,
  BudgetAlert,
} from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const [
    monthlySummaryResult,
    categorySpendingResult,
    monthlyTrendsResult,
    weeklyComparisonResult,
    recentTransactionsResult,
    budgetAlertsResult,
  ] = await Promise.all([
    supabase.rpc('get_monthly_summary', { p_year: year, p_month: month }),
    supabase.rpc('get_spending_by_category', { p_year: year, p_month: month }),
    supabase.rpc('get_monthly_trends', { p_months: 12 }),
    supabase.rpc('get_weekly_comparison'),
    supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(5),
    supabase
      .from('budget_alerts')
      .select('*, budgets(*, categories(*))')
      .eq('user_id', user.id)
      .is('dismissed_at', null)
      .order('triggered_at', { ascending: false }),
  ])

  const summaryData = (monthlySummaryResult.data ?? []) as MonthlySummary[]
  const categorySpending = (categorySpendingResult.data ?? []) as CategorySpending[]
  const monthlyTrends = (monthlyTrendsResult.data ?? []) as MonthlyTrend[]
  const weeklyComparison = (weeklyComparisonResult.data ?? []) as WeeklyComparison[]
  const recentTransactions = (recentTransactionsResult.data ?? []) as Transaction[]
  const budgetAlerts = (budgetAlertsResult.data ?? []) as BudgetAlert[]

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Quick action button */}
      <div className="flex justify-end mb-4">
        <Link
          href="/transactions"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Nueva Transacción
        </Link>
      </div>

      {/* Client-side dashboard with functional filters */}
      <DashboardClient
        userId={user.id}
        initialData={{
          summaryData,
          categorySpending,
          monthlyTrends,
          weeklyComparison,
          recentTransactions,
          budgetAlerts,
        }}
      />
    </div>
  )
}
