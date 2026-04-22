import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Trip, Transaction } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { ArrowLeft, Calendar, MapPin, DollarSign, TrendingUp, Download } from 'lucide-react'
import { TripDetailClient } from './TripDetailClient'

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
      <Link
        href="/trips"
        className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-violet-light transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Todos los viajes
      </Link>

      <TripDetailClient
        trip={trip as Trip}
        transactions={(transactions ?? []) as Transaction[]}
      />
    </div>
  )
}
