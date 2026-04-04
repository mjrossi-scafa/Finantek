import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  // Get monthly budgets for current month
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, categories(*)')
    .eq('user_id', user.id)
    .eq('period_type', 'monthly')
    .eq('year', year)
    .eq('month', month)

  if (!budgets || budgets.length === 0) return NextResponse.json({ alerts: [] })

  // Get spending by category for current month
  const { data: spending } = await supabase.rpc('get_spending_by_category', {
    p_year: year,
    p_month: month,
  })

  const spendingMap = new Map<string, number>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (spending ?? []).map((s: any) => [s.category_id as string, Number(s.total)])
  )

  const alertsToCreate: { user_id: string; budget_id: string; alert_type: string }[] = []

  for (const budget of budgets) {
    const spent = spendingMap.get(budget.category_id) ?? 0
    const pct = (spent / Number(budget.amount)) * 100

    if (budget.alert_100 && pct >= 100) {
      alertsToCreate.push({ user_id: user.id, budget_id: budget.id, alert_type: '100_percent' })
    } else if (budget.alert_80 && pct >= 80) {
      alertsToCreate.push({ user_id: user.id, budget_id: budget.id, alert_type: '80_percent' })
    }
  }

  // Upsert alerts (avoid duplicates)
  if (alertsToCreate.length > 0) {
    await supabase.from('budget_alerts').upsert(alertsToCreate, {
      onConflict: 'budget_id,alert_type',
      ignoreDuplicates: true,
    })
  }

  // Return undismissed alerts
  const { data: activeAlerts } = await supabase
    .from('budget_alerts')
    .select('*, budgets(*, categories(*))')
    .eq('user_id', user.id)
    .is('dismissed_at', null)

  return NextResponse.json({ alerts: activeAlerts ?? [] })
}
