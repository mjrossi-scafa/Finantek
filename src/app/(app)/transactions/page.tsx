import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TransactionsClient } from './TransactionsClient'
import { Transaction, Category } from '@/types/database'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [transactionsRes, categoriesRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('*, categories(*)')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order')
  ])

  return (
    <TransactionsClient
      initialTransactions={(transactionsRes.data as Transaction[]) || []}
      categories={(categoriesRes.data as Category[]) || []}
      userId={user.id}
    />
  )
}
