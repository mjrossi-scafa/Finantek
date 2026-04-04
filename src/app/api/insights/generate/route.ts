import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWeeklyInsight } from '@/lib/anthropic/insightGenerator'
import { WeeklyComparison } from '@/types/database'
import { getCurrentWeekBounds, getPreviousWeekBounds } from '@/lib/utils/dates'

export const maxDuration = 30

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { start: weekStart, end: weekEnd } = getCurrentWeekBounds()

  // Check if insight already exists for this week
  const { data: existing } = await supabase
    .from('weekly_insights')
    .select('id')
    .eq('user_id', user.id)
    .eq('week_start', weekStart)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Ya existe un insight para esta semana' }, { status: 400 })
  }

  // Get weekly comparison data
  const { data: weeklyData } = await supabase.rpc('get_weekly_comparison')
  const weeklyComparison = (weeklyData ?? []) as WeeklyComparison[]

  const thisWeekTotal = weeklyComparison.reduce((sum, w) => sum + w.this_week, 0)
  const lastWeekTotal = weeklyComparison.reduce((sum, w) => sum + w.last_week, 0)

  // Get current month budgets for context
  const now = new Date()
  const { data: spending } = await supabase.rpc('get_spending_by_category', {
    p_year: now.getFullYear(),
    p_month: now.getMonth() + 1,
  })

  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, categories(*)')
    .eq('user_id', user.id)
    .eq('period_type', 'monthly')
    .eq('year', now.getFullYear())
    .eq('month', now.getMonth() + 1)

  const spendingMap = new Map<string, number>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (spending ?? []).map((s: any) => [s.category_id as string, Number(s.total)])
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const budgetContext = (budgets ?? []).map((b: any) => ({
    categoryName: (b.categories?.name ?? '') as string,
    limit: Number(b.amount),
    spent: spendingMap.get(b.category_id) ?? 0,
  }))

  const insightText = await generateWeeklyInsight(
    weeklyComparison,
    weeklyComparison,
    thisWeekTotal,
    lastWeekTotal,
    budgetContext
  )

  const { data: insight, error } = await supabase
    .from('weekly_insights')
    .insert({
      user_id: user.id,
      week_start: weekStart,
      week_end: weekEnd,
      insight_text: insightText,
      spending_data: { thisWeek: thisWeekTotal, lastWeek: lastWeekTotal },
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ insight })
}
