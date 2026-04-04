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
