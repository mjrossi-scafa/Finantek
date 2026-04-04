import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { Category } from '@/types/database'

export default async function NewTransactionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order')

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-bold text-text-primary mb-6">Nueva transaccion</h2>
        <TransactionForm
          categories={(categories ?? []) as Category[]}
          userId={user.id}
        />
      </div>
    </div>
  )
}
