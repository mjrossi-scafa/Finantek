import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { evaluateAchievements, AchievementTrigger } from '@/lib/utils/achievements'
import { Achievement, UserAchievement } from '@/types/database'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { trigger } = (await request.json()) as { trigger: AchievementTrigger }

  // Get all achievements
  const { data: allAchievements } = await supabase.from('achievements').select('*')
  // Get already unlocked
  const { data: unlocked } = await supabase
    .from('user_achievements')
    .select('achievement_id, achievements(key)')
    .eq('user_id', user.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unlockedKeys = new Set(
    (unlocked ?? []).map((u: any) => u.achievements?.key).filter(Boolean) as string[]
  )

  // Build context based on trigger
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // Transaction count
  const { count: transactionCount } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Receipt count (completed)
  const { count: receiptCount } = await supabase
    .from('receipts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  // Budget count
  const { count: budgetCount } = await supabase
    .from('budgets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Total tracked amount
  const { data: totalData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', user.id)
  const totalTrackedAmount = (totalData ?? []).reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)

  // Consecutive weeks with at least one transaction
  const { data: weekTransactions } = await supabase
    .from('transactions')
    .select('transaction_date')
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })

  let consecutiveWeeks = 0
  if (weekTransactions && weekTransactions.length > 0) {
    const weeks = new Set<string>()
    for (const t of weekTransactions) {
      const d = new Date(t.transaction_date)
      // Get ISO week start (Monday)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      const weekStart = new Date(d.setDate(diff))
      weeks.add(weekStart.toISOString().split('T')[0])
    }
    const sortedWeeks = Array.from(weeks).sort().reverse()
    // Check from current week backwards
    const currentWeekStart = getWeekStart(new Date())
    let checkWeek = currentWeekStart
    for (const weekStr of sortedWeeks) {
      const ws = formatDateStr(checkWeek)
      if (weekStr === ws) {
        consecutiveWeeks++
        checkWeek = new Date(checkWeek.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (weekStr < ws) {
        break
      }
    }
  }

  // Monthly savings check for current and previous months
  const { data: monthlySummary } = await supabase.rpc('get_monthly_summary', { p_year: year, p_month: month })
  const monthIncome = (monthlySummary ?? []).find((s: { type: string; total: number }) => s.type === 'income')?.total ?? 0
  const monthExpense = (monthlySummary ?? []).find((s: { type: string; total: number }) => s.type === 'expense')?.total ?? 0
  const monthlyPositive = monthIncome > monthExpense
  const monthlySavingsRate = monthIncome > 0 ? (monthIncome - monthExpense) / monthIncome : 0

  // All expense categories used
  const { data: expenseCategories } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'expense')
  const { data: usedCategories } = await supabase
    .from('transactions')
    .select('category_id')
    .eq('user_id', user.id)
    .eq('type', 'expense')
  const usedSet = new Set((usedCategories ?? []).map((t: { category_id: string }) => t.category_id))
  const allExpenseCategoriesUsed = (expenseCategories ?? []).every((c: { id: string }) => usedSet.has(c.id))

  // ==========================
  // NEW CONTEXTS
  // ==========================

  // Planner
  const { count: plannedCount } = await supabase
    .from('planned_expenses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: recurringPlannedCount } = await supabase
    .from('planned_expenses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .neq('recurrence', 'none')

  const { count: plannedPaidCount } = await supabase
    .from('planned_expenses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_paid', true)

  const currentMonthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonthStart = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`

  const { data: plannedMonthly } = await supabase
    .from('planned_expenses')
    .select('amount')
    .eq('user_id', user.id)
    .gte('planned_date', currentMonthStart)
    .lt('planned_date', nextMonthStart)
  const plannedAmountMonthly = (plannedMonthly ?? []).reduce(
    (sum: number, p: { amount: number }) => sum + p.amount,
    0
  )

  // Insights
  const { count: insightCount } = await supabase
    .from('weekly_insights')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Telegram
  const { count: telegramLinkedCount } = await supabase
    .from('telegram_users')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  const telegramLinked = (telegramLinkedCount ?? 0) > 0

  // Active budgets (current month or annual)
  const { count: activeBudgetsCount } = await supabase
    .from('budgets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .or(`and(period_type.eq.monthly,year.eq.${year},month.eq.${month}),period_type.eq.annual`)

  // Previous month savings data for improvement tracking
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const { data: prevSummary } = await supabase.rpc('get_monthly_summary', { p_year: prevYear, p_month: prevMonth })
  const prevMonthExpense = (prevSummary ?? []).find(
    (s: { type: string; total: number }) => s.type === 'expense'
  )?.total ?? 0
  const monthExpenseReduction =
    prevMonthExpense > 0 ? (prevMonthExpense - monthExpense) / prevMonthExpense : 0

  // Time-based (secret achievements)
  const nowHour = now.getHours()
  const lateNightTransaction = trigger === 'transaction_created' && nowHour >= 2 && nowHour < 5
  const earlyMorningTransaction = trigger === 'transaction_created' && nowHour < 7
  const isJan1 = now.getMonth() === 0 && now.getDate() === 1

  // All achievements unlocked (except "total_master" itself)
  const totalAchievements = (allAchievements ?? []).filter((a) => a.key !== 'total_master').length
  const allAchievementsUnlocked = unlockedKeys.size >= totalAchievements && totalAchievements > 0

  const newlyUnlocked = evaluateAchievements(
    (allAchievements ?? []) as Achievement[],
    unlockedKeys,
    {
      userId: user.id,
      transactionCount: transactionCount ?? 0,
      receiptCount: receiptCount ?? 0,
      budgetCount: budgetCount ?? 0,
      totalTrackedAmount,
      consecutiveWeeks,
      monthlySavingsRate,
      monthlyPositive,
      allExpenseCategoriesUsed,
      // New
      plannedCount: plannedCount ?? 0,
      recurringPlannedCount: recurringPlannedCount ?? 0,
      plannedPaidCount: plannedPaidCount ?? 0,
      plannedAmountMonthly,
      insightCount: insightCount ?? 0,
      telegramLinked,
      activeBudgetsCount: activeBudgetsCount ?? 0,
      monthExpenseReduction,
      lateNightTransaction,
      earlyMorningTransaction,
      isJan1,
      allAchievementsUnlocked,
    }
  )

  // Insert newly unlocked
  if (newlyUnlocked.length > 0) {
    await supabase.from('user_achievements').insert(
      newlyUnlocked.map((a) => ({
        user_id: user.id,
        achievement_id: a.id,
      }))
    )
  }

  return NextResponse.json({ newlyUnlocked })
}

function getWeekStart(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}
