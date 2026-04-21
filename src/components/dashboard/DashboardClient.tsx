'use client'

import { useState, useEffect } from 'react'
import { SummaryCards } from './SummaryCards'
import { SpendingByCategoryChart } from './SpendingByCategoryChart'
import { MonthlyTrendChart } from './MonthlyTrendChart'
import { WeeklyComparisonChart } from './WeeklyComparisonChart'
import { RecentTransactions } from './RecentTransactions'
import { BudgetAlertBanner } from './BudgetAlertBanner'
import { formatMonthYear } from '@/lib/utils/dates'
import { Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  MonthlySummary,
  CategorySpending,
  MonthlyTrend,
  WeeklyComparison,
  Transaction,
  BudgetAlert,
} from '@/types/database'

interface DashboardClientProps {
  userId: string
  userName: string
  initialData: {
    summaryData: MonthlySummary[]
    prevSummaryData: MonthlySummary[]
    categorySpending: CategorySpending[]
    monthlyTrends: MonthlyTrend[]
    weeklyComparison: WeeklyComparison[]
    recentTransactions: Transaction[]
    budgetAlerts: BudgetAlert[]
  }
}

type PeriodType = 'current' | 'previous' | '3months' | '6months'

export function DashboardClient({ userId, userName, initialData }: DashboardClientProps) {
  const [period, setPeriod] = useState<PeriodType>('current')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(initialData)
  const supabase = createClient()

  const getPeriodDates = (periodType: PeriodType) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    switch (periodType) {
      case 'current':
        return { year, month, months: 1, label: formatMonthYear(year, month) }
      case 'previous':
        const prevMonth = month === 1 ? 12 : month - 1
        const prevYear = month === 1 ? year - 1 : year
        return { year: prevYear, month: prevMonth, months: 1, label: formatMonthYear(prevYear, prevMonth) }
      case '3months':
        return { year, month, months: 3, label: 'Últimos 3 meses' }
      case '6months':
        return { year, month, months: 6, label: 'Últimos 6 meses' }
    }
  }

  const loadPeriodData = async (periodType: PeriodType) => {
    setLoading(true)
    const { year, month, months } = getPeriodDates(periodType)

    // Calculate previous month for comparison
    const prevMonthNum = month === 1 ? 12 : month - 1
    const prevYearNum = month === 1 ? year - 1 : year

    try {
      const [
        monthlySummaryResult,
        prevMonthlySummaryResult,
        categorySpendingResult,
        monthlyTrendsResult,
        weeklyComparisonResult,
        recentTransactionsResult,
        budgetAlertsResult,
      ] = await Promise.all([
        supabase.rpc('get_monthly_summary', { p_year: year, p_month: month }),
        supabase.rpc('get_monthly_summary', { p_year: prevYearNum, p_month: prevMonthNum }),
        supabase.rpc('get_spending_by_category', { p_year: year, p_month: month }),
        supabase.rpc('get_monthly_trends', { p_months: months }),
        supabase.rpc('get_weekly_comparison'),
        supabase
          .from('transactions')
          .select('*, categories(*)')
          .eq('user_id', userId)
          .order('transaction_date', { ascending: false })
          .limit(5),
        supabase
          .from('budget_alerts')
          .select('*, budgets(*, categories(*))')
          .eq('user_id', userId)
          .is('dismissed_at', null)
          .order('triggered_at', { ascending: false }),
      ])

      const summaryData = (monthlySummaryResult.data ?? []) as MonthlySummary[]
      const prevSummaryData = (prevMonthlySummaryResult.data ?? []) as MonthlySummary[]
      const categorySpending = (categorySpendingResult.data ?? []) as CategorySpending[]
      const monthlyTrends = (monthlyTrendsResult.data ?? []) as MonthlyTrend[]
      const weeklyComparison = (weeklyComparisonResult.data ?? []) as WeeklyComparison[]
      const recentTransactions = (recentTransactionsResult.data ?? []) as Transaction[]
      const budgetAlerts = (budgetAlertsResult.data ?? []) as BudgetAlert[]

      setData({
        summaryData,
        prevSummaryData,
        categorySpending,
        monthlyTrends,
        weeklyComparison,
        recentTransactions,
        budgetAlerts,
      })
    } catch (error) {
      console.error('Error loading period data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = async (newPeriod: PeriodType) => {
    if (newPeriod === period) return
    setPeriod(newPeriod)
    await loadPeriodData(newPeriod)
  }

  const { summaryData, prevSummaryData, categorySpending, monthlyTrends, weeklyComparison, recentTransactions, budgetAlerts } = data

  const income = summaryData.find((s) => s.type === 'income')?.total ?? 0
  const expense = summaryData.find((s) => s.type === 'expense')?.total ?? 0
  const prevIncome = prevSummaryData.find((s) => s.type === 'income')?.total ?? 0
  const prevExpense = prevSummaryData.find((s) => s.type === 'expense')?.total ?? 0

  const { label } = getPeriodDates(period)

  // Calculate days remaining in current month and daily spending projection
  const today = new Date()
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const currentDay = today.getDate()
  const daysRemaining = lastDayOfMonth - currentDay
  const daysElapsed = currentDay
  const dailyAvg = daysElapsed > 0 ? expense / daysElapsed : 0
  const projectedMonthEnd = Math.round(dailyAvg * lastDayOfMonth)

  // Personalized greeting based on time of day
  const hour = today.getHours()
  const timeGreeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  const timeEmoji = hour < 12 ? '🌅' : hour < 20 ? '☀️' : '🌙'

  return (
    <div className="space-y-6">
      {/* Header with functional period selector */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary font-sans">
            <span className="mr-2">{timeEmoji}</span>
            {timeGreeting}, {userName}
            <span className="ml-2">⚔️</span>
          </h1>
          <p className="text-text-secondary mt-2 text-sm flex items-center gap-2 font-sans">
            <Calendar className="h-4 w-4" />
            <span className="capitalize">{label}</span>
            <span className="text-text-muted">·</span>
            <span>{daysRemaining > 0 ? `quedan ${daysRemaining} días del mes` : 'último día del mes'}</span>
          </p>
        </div>

        {/* Functional period selector */}
        <div className="glass-card rounded-xl px-3 py-2 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-text-muted" />
          <select
            className="bg-transparent text-sm font-medium text-text-primary border-0 outline-none cursor-pointer"
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value as PeriodType)}
            disabled={loading}
          >
            <option value="current">Este mes</option>
            <option value="previous">Mes anterior</option>
            <option value="3months">Últimos 3 meses</option>
            <option value="6months">Últimos 6 meses</option>
          </select>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500 mx-auto"></div>
          <p className="text-sm text-text-secondary mt-2">Cargando datos...</p>
        </div>
      )}

      {/* Content with opacity during loading */}
      <div className={`space-y-6 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
        {budgetAlerts.length > 0 && (
          <BudgetAlertBanner alerts={budgetAlerts} />
        )}

        <SummaryCards
          income={income}
          expense={expense}
          prevIncome={prevIncome}
          prevExpense={prevExpense}
          daysRemaining={daysRemaining}
          projectedMonthEnd={projectedMonthEnd}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingByCategoryChart data={categorySpending} />
          <WeeklyComparisonChart data={weeklyComparison} />
        </div>

        <MonthlyTrendChart data={monthlyTrends} />

        <RecentTransactions transactions={recentTransactions} />
      </div>
    </div>
  )
}