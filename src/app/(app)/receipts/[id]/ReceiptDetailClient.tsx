'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Receipt, Category, ExtractedTransaction } from '@/types/database'
import { ExtractedTransactionReview } from '@/components/receipts/ExtractedTransactionReview'
import { Loader2, RefreshCw, Trash2, FileText, ExternalLink, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  receipt: Receipt
  signedUrl: string | null
  categories: Category[]
}

export function ReceiptDetailClient({ receipt, signedUrl, categories }: Props) {
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isPdf = receipt.file_type === 'application/pdf'

  // Auto-process on first visit if pending
  useEffect(() => {
    if (receipt.status === 'pending' && !processing) {
      processReceipt()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function processReceipt() {
    setProcessing(true)
    try {
      const res = await fetch(`/api/receipts/${receipt.id}/process`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        toast.error('Error al procesar', { description: data.error })
      }
      router.refresh()
    } catch (err) {
      toast.error('Error al procesar')
    } finally {
      setProcessing(false)
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este recibo? Esta acción no se puede deshacer.')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/receipts/${receipt.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')

      toast.success('Recibo eliminado')
      router.push('/receipts')
    } catch (err) {
      toast.error('Error al eliminar')
      setDeleting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: File preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-text-primary">📄 Archivo original</h3>
          <div className="flex items-center gap-2">
            {signedUrl && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-violet-light hover:text-violet-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Abrir original
              </a>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1 text-xs text-vermillion-shu hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Eliminar
            </button>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden sticky top-4">
          {signedUrl ? (
            isPdf ? (
              <div className="aspect-[3/4] bg-surface flex flex-col items-center justify-center p-4">
                <FileText className="h-16 w-16 text-text-muted mb-3" />
                <p className="text-sm text-text-primary font-semibold mb-1">{receipt.file_name}</p>
                <p className="text-xs text-text-muted mb-4">PDF · {Math.round((receipt.file_size || 0) / 1024)} KB</p>
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver PDF
                </a>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signedUrl}
                alt={receipt.file_name}
                className="w-full h-auto max-h-[70vh] object-contain bg-surface"
              />
            )
          ) : (
            <div className="aspect-video bg-surface flex items-center justify-center">
              <p className="text-sm text-text-muted">Archivo no disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Transactions / Status */}
      <div className="space-y-4">
        {/* Processing state */}
        {(receipt.status === 'processing' || processing) && (
          <div className="glass-card rounded-2xl p-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-violet-light" />
            <div>
              <p className="text-sm font-semibold text-text-primary">Procesando con IA...</p>
              <p className="text-xs text-text-muted mt-0.5">Gemini está extrayendo las transacciones</p>
            </div>
          </div>
        )}

        {/* Failed state with retry */}
        {receipt.status === 'failed' && (
          <div className="glass-card rounded-2xl p-6 border border-vermillion-shu/30">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-vermillion-shu flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-vermillion-shu mb-1">Error al procesar</h3>
                <p className="text-sm text-text-tertiary break-words">
                  {receipt.error_message || 'Error desconocido'}
                </p>
              </div>
            </div>

            <button
              onClick={processReceipt}
              disabled={processing}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-light hover:bg-violet-500/20 transition-all text-sm font-semibold disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reintentando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Reintentar procesamiento
                </>
              )}
            </button>
          </div>
        )}

        {/* Pending (should auto-process) */}
        {receipt.status === 'pending' && !processing && (
          <div className="glass-card rounded-2xl p-6">
            <p className="text-sm text-text-muted mb-3">El recibo está pendiente de procesar</p>
            <button
              onClick={processReceipt}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Procesar ahora
            </button>
          </div>
        )}

        {/* Completed with transactions */}
        {receipt.status === 'completed' && receipt.extracted_data && (
          <ExtractedTransactionReview
            receiptId={receipt.id}
            initialTransactions={receipt.extracted_data as ExtractedTransaction[]}
            categories={categories}
          />
        )}
      </div>
    </div>
  )
}
