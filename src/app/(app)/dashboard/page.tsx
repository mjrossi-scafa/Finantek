import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { SpendingByCategoryChart } from '@/components/dashboard/SpendingByCategoryChart'
import { MonthlyTrendChart } from '@/components/dashboard/MonthlyTrendChart'
import { WeeklyComparisonChart } from '@/components/dashboard/WeeklyComparisonChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { BudgetAlertBanner } from '@/components/dashboard/BudgetAlertBanner'
import { formatMonthYear } from '@/lib/utils/dates'
import { Plus, Filter, Download, Search, Calendar } from 'lucide-react'
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
  const income = summaryData.find((s) => s.type === 'income')?.total ?? 0
  const expense = summaryData.find((s) => s.type === 'expense')?.total ?? 0

  const categorySpending = (categorySpendingResult.data ?? []) as CategorySpending[]
  const monthlyTrends = (monthlyTrendsResult.data ?? []) as MonthlyTrend[]
  const weeklyComparison = (weeklyComparisonResult.data ?? []) as WeeklyComparison[]
  const recentTransactions = (recentTransactionsResult.data ?? []) as Transaction[]
  const budgetAlerts = (budgetAlertsResult.data ?? []) as BudgetAlert[]

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header mejorado con selector de período y botón de transacción */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">Dashboard</h1>
            <p className="text-text-secondary mt-1 text-sm capitalize flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatMonthYear(year, month)}
            </p>
          </div>
          {/* Selector de período */}
          <div className="glass-card rounded-xl px-3 py-2 flex items-center gap-2 hidden md:flex">
            <Calendar className="h-4 w-4 text-text-muted" />
            <select className="bg-transparent text-sm font-medium text-text-primary border-0 outline-none cursor-pointer">
              <option>Este mes</option>
              <option>Mes anterior</option>
              <option>Últimos 3 meses</option>
              <option>Últimos 6 meses</option>
            </select>
          </div>
        </div>

        {/* Botón de nueva transacción */}
        <Link
          href="/transactions/new"
          className="flex items-center gap-2 px-4 py-2.5 w-full md:w-auto justify-center md:justify-start bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Nueva Transacción
        </Link>
      </div>

      {/* Barra de filtros */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex md:flex-wrap items-center gap-3 overflow-x-auto pb-2 md:pb-0 md:overflow-visible">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar transacciones..."
              className="w-full pl-10 pr-4 py-2 bg-surface-subtle/50 border border-surface-border rounded-xl text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            />
          </div>

          {/* Filtro por tipo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="px-3 py-2 text-xs font-medium bg-bamboo-take/10 text-bamboo-take border border-bamboo-take/30 rounded-lg hover:bg-bamboo-take/20 transition-colors whitespace-nowrap">
              • Ingresos
            </button>
            <button className="px-3 py-2 text-xs font-medium bg-vermillion-shu/10 text-vermillion-shu border border-vermillion-shu/30 rounded-lg hover:bg-vermillion-shu/20 transition-colors whitespace-nowrap">
              • Gastos
            </button>
          </div>

          {/* Filtro de categorías */}
          <div className="glass-card rounded-lg px-3 py-2 flex items-center gap-2 min-w-[120px] flex-shrink-0">
            <Filter className="h-4 w-4 text-text-muted" />
            <select className="bg-transparent text-xs font-medium text-text-primary border-0 outline-none cursor-pointer">
              <option>Todas las categorías</option>
              <option>Alimentación</option>
              <option>Transporte</option>
              <option>Entretenimiento</option>
            </select>
          </div>

          {/* Botón de exportar */}
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary border border-surface-border rounded-lg hover:bg-surface-subtle/50 transition-colors whitespace-nowrap flex-shrink-0">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {budgetAlerts.length > 0 && (
        <BudgetAlertBanner alerts={budgetAlerts} />
      )}

      <SummaryCards income={income} expense={expense} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingByCategoryChart data={categorySpending} />
        <WeeklyComparisonChart data={weeklyComparison} />
      </div>

      <MonthlyTrendChart data={monthlyTrends} />

      <RecentTransactions transactions={recentTransactions} />
    </div>
  )
}
