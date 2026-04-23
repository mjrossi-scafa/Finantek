import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import {
  MonthlySummary,
  CategorySpending,
  MonthlyTrend,
  WeeklyComparison,
  Transaction,
  BudgetAlert,
  PlannedExpense,
  Trip,
  Category,
} from '@/types/database'
import { ActiveTripBanner } from '@/components/dashboard/ActiveTripBanner'
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap'
import { WeeklyComparisonCard } from '@/components/dashboard/WeeklyComparisonCard'
import { TodayCard } from '@/components/dashboard/TodayCard'
import { calculateWeeklyComparison } from '@/lib/utils/weeklyComparison'
import { getChileToday } from '@/lib/utils/timezone'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // Calculate previous month for real comparison
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year

  // Get user profile for personalized greeting
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email')
    .eq('id', user.id)
    .single()

  // Calculate end of current month for planned expenses query
  const currentMonthEnd = new Date(year, month, 0).toISOString().split('T')[0]
  const todayDate = now.toISOString().split('T')[0]

  const todayChile = getChileToday()

  const [
    monthlySummaryResult,
    prevMonthlySummaryResult,
    categorySpendingResult,
    monthlyTrendsResult,
    weeklyComparisonResult,
    recentTransactionsResult,
    budgetAlertsResult,
    plannedExpensesResult,
    todayTransactionsResult,
    categoriesResult,
  ] = await Promise.all([
    supabase.rpc('get_monthly_summary', { p_year: year, p_month: month }),
    supabase.rpc('get_monthly_summary', { p_year: prevYear, p_month: prevMonth }),
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
    supabase
      .from('planned_expenses')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .eq('is_paid', false)
      .gte('planned_date', todayDate)
      .lte('planned_date', currentMonthEnd)
      .order('planned_date', { ascending: true }),
    supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .eq('transaction_date', todayChile)
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order'),
  ])

  const summaryData = (monthlySummaryResult.data ?? []) as MonthlySummary[]
  const prevSummaryData = (prevMonthlySummaryResult.data ?? []) as MonthlySummary[]
  const categorySpending = (categorySpendingResult.data ?? []) as CategorySpending[]
  const monthlyTrends = (monthlyTrendsResult.data ?? []) as MonthlyTrend[]
  const weeklyComparison = (weeklyComparisonResult.data ?? []) as WeeklyComparison[]
  const recentTransactions = (recentTransactionsResult.data ?? []) as Transaction[]
  const budgetAlerts = (budgetAlertsResult.data ?? []) as BudgetAlert[]
  const plannedExpenses = (plannedExpensesResult.data ?? []) as PlannedExpense[]
  const todayTransactions = (todayTransactionsResult.data ?? []) as Array<Transaction & { categories?: Category }>
  const categoriesList = (categoriesResult.data ?? []) as Category[]

  // Daily average of the month so far (expense). Uses monthly summary + Chile day number.
  const monthExpense = Number(summaryData.find((s) => s.type === 'expense')?.total ?? 0)
  const dayOfMonthChile = Number(todayChile.split('-')[2])
  const dailyAvgMonth = dayOfMonthChile > 0 ? Math.round(monthExpense / dayOfMonthChile) : 0

  // Active trip
  const { data: activeTripData } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()
  const activeTrip = activeTripData as Trip | null

  let tripSpent = 0
  let tripCount = 0
  if (activeTrip) {
    const { data: tripTx } = await supabase
      .from('transactions')
      .select('amount')
      .eq('trip_id', activeTrip.id)
      .eq('type', 'expense')
    tripSpent = (tripTx ?? []).reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)
    tripCount = (tripTx ?? []).length
  }

  // Activity heatmap: last 365 days of expense transactions (Chile timezone)
  const [y, m, d] = todayChile.split('-').map(Number)
  const oneYearAgoChile = new Date(Date.UTC(y, m - 1, d))
  oneYearAgoChile.setUTCDate(oneYearAgoChile.getUTCDate() - 365)
  const oneYearAgoStr = `${oneYearAgoChile.getUTCFullYear()}-${String(oneYearAgoChile.getUTCMonth() + 1).padStart(2, '0')}-${String(oneYearAgoChile.getUTCDate()).padStart(2, '0')}`

  const { data: heatmapTx, error: heatmapErr } = await supabase
    .from('transactions')
    .select('transaction_date, amount')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .gte('transaction_date', oneYearAgoStr)

  if (heatmapErr) console.error('[dashboard] heatmap query error:', heatmapErr)

  const heatmapMap: Record<string, { amount: number; count: number }> = {}
  for (const tx of (heatmapTx ?? []) as { transaction_date: string; amount: number | string }[]) {
    const amt = typeof tx.amount === 'string' ? Number(tx.amount) : tx.amount
    if (!heatmapMap[tx.transaction_date]) heatmapMap[tx.transaction_date] = { amount: 0, count: 0 }
    heatmapMap[tx.transaction_date].amount += amt
    heatmapMap[tx.transaction_date].count++
  }
  const heatmapData = Object.entries(heatmapMap).map(([date, v]) => ({
    date, amount: v.amount, count: v.count,
  }))

  // Weekly comparison: last 14 days
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  const { data: weeklyTx } = await supabase
    .from('transactions')
    .select('transaction_date, amount, category_id, categories(name, icon, color)')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .gte('transaction_date', fourteenDaysAgo.toISOString().split('T')[0])
    .order('transaction_date', { ascending: false })

  const weeklyData = calculateWeeklyComparison(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (weeklyTx ?? []).map((t: any) => ({
      transaction_date: t.transaction_date,
      amount: t.amount,
      category_id: t.category_id,
      categories: Array.isArray(t.categories) ? t.categories[0] : t.categories,
    }))
  )

  // Extract user's first name for greeting and capitalize it
  const rawName = profile?.display_name?.split(' ')[0] || user.email?.split('@')[0] || 'Samurai'
  const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Today snapshot */}
      <TodayCard
        todayTransactions={todayTransactions}
        dailyAvgMonth={dailyAvgMonth}
        activeTrip={activeTrip}
        todayStr={todayChile}
        categories={categoriesList}
        userId={user.id}
      />

      {/* Active trip banner */}
      {activeTrip && (
        <ActiveTripBanner
          trip={activeTrip}
          spent={tripSpent}
          count={tripCount}
        />
      )}

      {/* Weekly comparison - full featured */}
      <WeeklyComparisonCard data={weeklyData} />

      {/* Activity heatmap */}
      <ActivityHeatmap data={heatmapData} todayStr={todayChile} />

      {/* Client-side dashboard with functional filters */}
      <DashboardClient
        userId={user.id}
        userName={userName}
        initialData={{
          summaryData,
          prevSummaryData,
          categorySpending,
          monthlyTrends,
          weeklyComparison,
          recentTransactions,
          budgetAlerts,
          plannedExpenses,
        }}
      />
    </div>
  )
}
