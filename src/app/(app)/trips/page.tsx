import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { TripsClient } from './TripsClient'
import { Trip } from '@/types/database'
import { Plane } from 'lucide-react'

export default async function TripsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

  // For each trip, get total spent
  const tripSpending: Record<string, { total: number; count: number }> = {}
  if (trips && trips.length > 0) {
    const tripIds = trips.map((t) => t.id)
    const { data: txs } = await supabase
      .from('transactions')
      .select('trip_id, amount')
      .in('trip_id', tripIds)
      .eq('type', 'expense')

    for (const tx of txs ?? []) {
      if (!tx.trip_id) continue
      if (!tripSpending[tx.trip_id]) tripSpending[tx.trip_id] = { total: 0, count: 0 }
      tripSpending[tx.trip_id].total += tx.amount
      tripSpending[tx.trip_id].count++
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        icon={<Plane className="h-7 w-7 text-violet-light" />}
        title="Viajes"
        description="Registra tus gastos en el extranjero con conversión automática"
      />
      <TripsClient
        initialTrips={(trips as Trip[]) || []}
        tripSpending={tripSpending}
        userId={user.id}
      />
    </div>
  )
}
