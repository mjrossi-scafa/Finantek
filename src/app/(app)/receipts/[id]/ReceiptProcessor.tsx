'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ReceiptProcessor({ receiptId }: { receiptId: string }) {
  const router = useRouter()

  useEffect(() => {
    async function process() {
      const res = await fetch(`/api/receipts/${receiptId}/process`, { method: 'POST' })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        toast.error('Error al procesar el recibo', { description: data.error })
        router.refresh()
      }
    }
    process()
  }, [receiptId, router])

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p>Iniciando procesamiento con IA...</p>
      </CardContent>
    </Card>
  )
}
