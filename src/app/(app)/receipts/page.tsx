import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { ReceiptsClient } from './ReceiptsClient'
import { Receipt } from '@/types/database'
import { Receipt as ReceiptIcon } from 'lucide-react'

export default async function ReceiptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: receipts } = await supabase
    .from('receipts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Get this month's stats
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthReceipts = (receipts || []).filter((r) => r.created_at >= monthStart)
  const monthCompleted = monthReceipts.filter((r) => r.status === 'completed')

  // Count extracted transactions
  let totalTransactions = 0
  for (const r of monthCompleted) {
    if (Array.isArray(r.extracted_data)) {
      totalTransactions += r.extracted_data.length
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        icon={<ReceiptIcon className="h-7 w-7 text-violet-light" />}
        title="Recibos y documentos"
        description="Sube fotos de recibos o estados de cuenta para extraer transacciones automáticamente"
      />

      <ReceiptsClient
        initialReceipts={(receipts as Receipt[]) || []}
        stats={{
          monthTotal: monthReceipts.length,
          monthCompleted: monthCompleted.length,
          monthTransactions: totalTransactions,
        }}
      />
    </div>
  )
}
