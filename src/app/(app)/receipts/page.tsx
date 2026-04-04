import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { ReceiptUploader } from '@/components/receipts/ReceiptUploader'
import { Receipt } from '@/types/database'
import { formatDate } from '@/lib/utils/dates'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  completed: 'Completado',
  failed: 'Error',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  processing: 'bg-violet-primary/10 text-violet-light',
  completed: 'bg-success/10 text-success',
  failed: 'bg-danger/10 text-danger',
}

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

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Recibos y documentos"
        description="Sube fotos de recibos o estados de cuenta para extraer transacciones automaticamente"
      />

      <ReceiptUploader />

      {receipts && receipts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.15em]">Historial</h2>
          {receipts.map((receipt: Receipt) => (
            <Link key={receipt.id} href={`/receipts/${receipt.id}`}>
              <div className="glass-card rounded-2xl p-4 md:p-6 flex items-center gap-3 transition-fintech hover:bg-surface-hover cursor-pointer group">
                <div className="text-2xl">
                  {receipt.file_type === 'application/pdf' ? '📄' : '🖼️'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-text-primary truncate">{receipt.file_name}</p>
                  <p className="text-xs text-text-tertiary">
                    {formatDate(receipt.created_at.split('T')[0])}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${STATUS_COLORS[receipt.status]}`}>
                    {STATUS_LABELS[receipt.status]}
                  </span>
                  <ChevronRight className="h-4 w-4 text-text-tertiary group-hover:text-violet-light transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
