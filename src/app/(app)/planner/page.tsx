import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlannerClient } from './PlannerClient'
import { Category, PlannedExpense } from '@/types/database'

export default async function PlannerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [plannedRes, categoriesRes] = await Promise.all([
    supabase
      .from('planned_expenses')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .order('planned_date', { ascending: true }),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .order('sort_order'),
  ])

  return (
    <PlannerClient
      initialPlanned={(plannedRes.data as PlannedExpense[]) || []}
      categories={(categoriesRes.data as Category[]) || []}
      userId={user.id}
    />
  )
}
