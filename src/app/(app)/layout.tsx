import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { MobileDrawer } from '@/components/layout/MobileDrawer'
import { AppTourMount } from '@/components/tour/AppTourMount'

export type KatanaState = 'violet' | 'green' | 'yellow' | 'red' | 'gold'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: onboardingProfile } = await supabase
    .from('profiles')
    .select('onboarding_completed, app_tour_completed')
    .eq('id', user.id)
    .single()

  if (onboardingProfile && !onboardingProfile.onboarding_completed) {
    redirect('/onboarding')
  }

  const shouldRunTour = Boolean(
    onboardingProfile?.onboarding_completed && !onboardingProfile?.app_tour_completed
  )

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // Parallel queries for user stats
  const [
    userAchievementsResult,
    monthlySummaryResult,
    budgetAlertsResult,
    recentAchievementResult,
  ] = await Promise.all([
    supabase
      .from('user_achievements')
      .select('achievements(points)')
      .eq('user_id', user.id),
    supabase.rpc('get_monthly_summary', { p_year: year, p_month: month }),
    supabase
      .from('budget_alerts')
      .select('alert_type')
      .eq('user_id', user.id)
      .is('dismissed_at', null),
    supabase
      .from('user_achievements')
      .select('unlocked_at')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false })
      .limit(1),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPoints = (userAchievementsResult.data ?? []).reduce((sum: number, ua: any) => {
    const pts = ua.achievements?.points ?? 0
    return sum + pts
  }, 0)

  // Calculate katana state based on financial health
  const summary = (monthlySummaryResult.data ?? []) as { type: string; total: number }[]
  const income = summary.find((s) => s.type === 'income')?.total ?? 0
  const expense = summary.find((s) => s.type === 'expense')?.total ?? 0
  const savingsRate = income > 0 ? (income - expense) / income : 0

  const budgetAlerts = (budgetAlertsResult.data ?? []) as { alert_type: string }[]
  const has100Alert = budgetAlerts.some((a) => a.alert_type === '100_percent')
  const has80Alert = budgetAlerts.some((a) => a.alert_type === '80_percent')

  // Check if any achievement was unlocked in the last 5 minutes
  const recentAchievement = (recentAchievementResult.data ?? [])[0] as { unlocked_at: string } | undefined
  const isRecentAchievement = recentAchievement
    ? Date.now() - new Date(recentAchievement.unlocked_at).getTime() < 5 * 60 * 1000
    : false

  // Determine katana state (priority order)
  let katanaState: KatanaState = 'violet'
  if (isRecentAchievement) katanaState = 'gold'
  else if (has100Alert || (income > 0 && expense > income)) katanaState = 'red'
  else if (has80Alert) katanaState = 'yellow'
  else if (savingsRate >= 0.2) katanaState = 'green'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar totalPoints={totalPoints} katanaState={katanaState} />
      <MobileDrawer totalPoints={totalPoints} />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 pt-14 md:pt-0">
        {children}
      </main>
      <MobileNav />
      <AppTourMount userId={user.id} shouldRun={shouldRunTour} />
    </div>
  )
}
