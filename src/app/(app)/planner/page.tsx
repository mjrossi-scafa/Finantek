import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlannerClient } from './PlannerClient'
import { Category, PlannedExpense, Transaction } from '@/types/database'

export default async function PlannerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Only load CURRENT month transactions for the unified calendar view
  // (historical 3-month data is loaded on-demand when opening AI Suggestions)
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  const [plannedRes, categoriesRes, transactionsRes] = await Promise.all([
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
    supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .gte('transaction_date', currentMonthStart)
      .order('transaction_date', { ascending: false }),
  ])

  return (
    <PlannerClient
      initialPlanned={(plannedRes.data as PlannedExpense[]) || []}
      categories={(categoriesRes.data as Category[]) || []}
      transactions={(transactionsRes.data as Transaction[]) || []}
      userId={user.id}
    />
  )
}
