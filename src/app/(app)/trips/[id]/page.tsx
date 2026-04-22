import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Trip, Transaction } from '@/types/database'
import { TripDetailClient } from './TripDetailClient'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trip } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!trip) notFound()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, categories(*)')
    .eq('trip_id', id)
    .order('transaction_date', { ascending: false })

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Breadcrumbs
        items={[
          { label: 'Viajes', href: '/trips' },
          { label: (trip as Trip).name },
        ]}
      />

      <TripDetailClient
        trip={trip as Trip}
        transactions={(transactions ?? []) as Transaction[]}
      />
    </div>
  )
}
