import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { AchievementsClient } from './AchievementsClient'
import { Achievement, UserAchievement } from '@/types/database'
import { AchievementContext } from '@/lib/utils/achievements'
import { Trophy } from 'lucide-react'

export default async function AchievementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // Fetch all data in parallel
  const [
    achievementsResult,
    userAchievementsResult,
    transactionCountResult,
    receiptCountResult,
    budgetCountResult,
    plannedCountResult,
    recurringPlannedCountResult,
    plannedPaidCountResult,
    insightCountResult,
    telegramResult,
    transactionsResult,
  ] = await Promise.all([
    supabase.from('achievements').select('*').order('category').order('points'),
    supabase.from('user_achievements').select('*, achievements(*)').eq('user_id', user.id),
    supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('receipts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
    supabase.from('budgets').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('planned_expenses').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('planned_expenses').select('*', { count: 'exact', head: true }).eq('user_id', user.id).neq('recurrence', 'none'),
    supabase.from('planned_expenses').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_paid', true),
    supabase.from('weekly_insights').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('telegram_users').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('transactions').select('amount').eq('user_id', user.id),
  ])

  const allAchievements = (achievementsResult.data ?? []) as Achievement[]
  const userAchievements = (userAchievementsResult.data ?? []) as UserAchievement[]

  const totalTrackedAmount = (transactionsResult.data ?? []).reduce(
    (sum: number, t: { amount: number }) => sum + t.amount,
    0
  )

  // Planned amount this month
  const currentMonthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const nextMonthStart =
    month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`
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

  // Active budgets
  const { count: activeBudgetsCount } = await supabase
    .from('budgets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .or(`and(period_type.eq.monthly,year.eq.${year},month.eq.${month}),period_type.eq.annual`)

  const ctx: AchievementContext = {
    userId: user.id,
    transactionCount: transactionCountResult.count ?? 0,
    receiptCount: receiptCountResult.count ?? 0,
    budgetCount: budgetCountResult.count ?? 0,
    totalTrackedAmount,
    plannedCount: plannedCountResult.count ?? 0,
    recurringPlannedCount: recurringPlannedCountResult.count ?? 0,
    plannedPaidCount: plannedPaidCountResult.count ?? 0,
    plannedAmountMonthly,
    insightCount: insightCountResult.count ?? 0,
    telegramLinked: (telegramResult.count ?? 0) > 0,
    activeBudgetsCount: activeBudgetsCount ?? 0,
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        icon={<Trophy className="h-7 w-7 text-yellow-400" />}
        title="Logros"
        description="Desbloquea logros mientras avanzas en tu camino del samurai financiero"
      />

      <AchievementsClient
        achievements={allAchievements}
        userAchievements={userAchievements}
        ctx={ctx}
      />
    </div>
  )
}
