import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { ExtractedTransactionReview } from '@/components/receipts/ExtractedTransactionReview'
import { Category, ExtractedTransaction, Receipt } from '@/types/database'
import { Loader2 } from 'lucide-react'
import ReceiptProcessor from './ReceiptProcessor'

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: receipt } = await supabase
    .from('receipts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!receipt) notFound()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order')

  const r = receipt as Receipt

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <PageHeader
        title="Revisar recibo"
        description={r.file_name}
      />

      {r.status === 'pending' && (
        <ReceiptProcessor receiptId={r.id} />
      )}

      {r.status === 'processing' && (
        <div className="glass-card rounded-2xl p-6 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-violet-light" />
          <p className="text-sm text-text-secondary">La IA esta extrayendo las transacciones...</p>
        </div>
      )}

      {r.status === 'failed' && (
        <div className="glass-card rounded-2xl p-6 border-danger/20">
          <h3 className="text-sm font-bold text-danger mb-2">Error al procesar</h3>
          <p className="text-sm text-text-tertiary">{r.error_message}</p>
        </div>
      )}

      {r.status === 'completed' && r.extracted_data && (
        <ExtractedTransactionReview
          receiptId={r.id}
          initialTransactions={r.extracted_data as ExtractedTransaction[]}
          categories={(categories ?? []) as Category[]}
        />
      )}
    </div>
  )
}
