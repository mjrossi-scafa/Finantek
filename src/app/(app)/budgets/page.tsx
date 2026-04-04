import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { BudgetsClient } from './BudgetsClient'
import { Budget, Category } from '@/types/database'

export default async function BudgetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  const [budgetsResult, categoriesResult, spendingResult] = await Promise.all([
    supabase
      .from('budgets')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order'),
    supabase.rpc('get_spending_by_category', { p_year: year, p_month: month }),
  ])

  const budgets = (budgetsResult.data ?? []) as Budget[]
  const categories = (categoriesResult.data ?? []) as Category[]
  const spending = (spendingResult.data ?? []) as { category_id: string; total: number }[]

  const spendingMap = new Map(spending.map((s) => [s.category_id, s.total]))

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Presupuestos"
        description="Establece límites mensuales o anuales por categoría"
      />
      <BudgetsClient
        budgets={budgets}
        categories={categories}
        spendingMap={Object.fromEntries(spendingMap)}
        userId={user.id}
      />
    </div>
  )
}
