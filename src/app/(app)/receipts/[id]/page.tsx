import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { ReceiptDetailClient } from './ReceiptDetailClient'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { Category, Receipt } from '@/types/database'
import { FileSearch } from 'lucide-react'

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

  const r = receipt as Receipt

  // Generate signed URL for preview
  let signedUrl: string | null = null
  if (r.file_path) {
    const { data: urlData } = await supabase.storage
      .from('receipts')
      .createSignedUrl(r.file_path, 3600)
    signedUrl = urlData?.signedUrl || null
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order')

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Recibos', href: '/receipts' },
          { label: r.file_name },
        ]}
      />
      <PageHeader
        icon={<FileSearch className="h-7 w-7 text-violet-light" />}
        title="Revisar recibo"
        description={r.file_name}
      />

      <ReceiptDetailClient
        receipt={r}
        signedUrl={signedUrl}
        categories={(categories ?? []) as Category[]}
      />
    </div>
  )
}
