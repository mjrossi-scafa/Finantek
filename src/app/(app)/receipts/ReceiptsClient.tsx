'use client'

import { useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Receipt } from '@/types/database'
import { formatDate } from '@/lib/utils/dates'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { GradientButton } from '@/components/shared/GradientButton'
import {
  Upload,
  FileImage,
  FileText,
  Loader2,
  ChevronRight,
  Trash2,
  Search,
  FileCheck,
  Clock,
  Sparkles,
  Lightbulb,
  X,
} from 'lucide-react'

interface ReceiptsClientProps {
  initialReceipts: Receipt[]
  stats: {
    monthTotal: number
    monthCompleted: number
    monthTransactions: number
  }
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  completed: 'Completado',
  failed: 'Error',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  processing: 'bg-violet-primary/10 text-violet-light border border-violet-500/20',
  completed: 'bg-bamboo-take/10 text-bamboo-take border border-bamboo-take/20',
  failed: 'bg-vermillion-shu/10 text-vermillion-shu border border-vermillion-shu/20',
}

export function ReceiptsClient({ initialReceipts, stats }: ReceiptsClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all')
  const [showTips, setShowTips] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  const MAX_SIZE = 10 * 1024 * 1024

  async function uploadFile(file: File): Promise<string | null> {
    if (!ACCEPTED.includes(file.type)) {
      toast.error(`${file.name}: Formato no soportado`, { description: 'Usa JPG, PNG, WebP o PDF' })
      return null
    }
    if (file.size > MAX_SIZE) {
      toast.error(`${file.name}: Archivo muy grande`, { description: 'El maximo es 10MB' })
      return null
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/receipts', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir')
      return data.receiptId
    } catch (err) {
      toast.error(`${file.name}: ${(err as Error).message}`)
      return null
    }
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress({ current: 0, total: files.length })
    const uploadedIds: string[] = []

    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ current: i + 1, total: files.length })
      const id = await uploadFile(files[i])
      if (id) uploadedIds.push(id)
    }

    setUploading(false)

    if (uploadedIds.length === 0) {
      toast.error('Ningún archivo se pudo subir')
      return
    }

    if (files.length === 1 && uploadedIds.length === 1) {
      // Single file: redirect to processor
      toast.success('Recibo subido, procesando con IA...')
      router.push(`/receipts/${uploadedIds[0]}`)
    } else {
      // Multiple files: show message and refresh
      toast.success(`${uploadedIds.length} recibos subidos. Puedes procesarlos uno por uno.`)
      router.refresh()
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) uploadFiles(files)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) uploadFiles(files)
  }

  async function handleDelete(id: string, fileName: string) {
    if (!confirm(`¿Eliminar "${fileName}"? Esta acción no se puede deshacer.`)) return

    try {
      const res = await fetch(`/api/receipts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')

      setReceipts((prev) => prev.filter((r) => r.id !== id))
      toast.success('Recibo eliminado')
    } catch (err) {
      toast.error('Error al eliminar', { description: (err as Error).message })
    }
  }

  // Filter receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (searchQuery && !r.file_name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [receipts, searchQuery, statusFilter])

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      {stats.monthTotal > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileCheck className="h-4 w-4 text-violet-light" />
              <p className="text-xs text-text-muted">Este mes</p>
            </div>
            <p className="text-xl font-bold font-mono text-text-primary">{stats.monthTotal}</p>
            <p className="text-xs text-text-muted mt-1">
              {stats.monthTotal === 1 ? 'recibo subido' : 'recibos subidos'}
            </p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-bamboo-take" />
              <p className="text-xs text-text-muted">Procesados</p>
            </div>
            <p className="text-xl font-bold font-mono text-bamboo-take">{stats.monthCompleted}</p>
            <p className="text-xs text-text-muted mt-1">con IA</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-violet-light" />
              <p className="text-xs text-text-muted">Transacciones</p>
            </div>
            <p className="text-xl font-bold font-mono text-violet-light">{stats.monthTransactions}</p>
            <p className="text-xs text-text-muted mt-1">extraídas</p>
          </div>
        </div>
      )}

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer',
          dragging
            ? 'border-violet-primary bg-violet-primary/5 glow-violet scale-[1.01]'
            : 'border-surface-border hover:border-violet-primary/40 hover:bg-surface-hover/50'
        )}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={handleFileChange}
          multiple
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-violet-light animate-spin" />
            <p className="font-semibold text-text-primary">
              Subiendo {uploadProgress.current} de {uploadProgress.total}...
            </p>
            <p className="text-sm text-text-tertiary">La IA procesará cada recibo</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-3">
              <FileImage className="h-8 w-8 text-text-tertiary" />
              <FileText className="h-8 w-8 text-text-tertiary" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">
                Arrastra uno o varios recibos
              </p>
              <p className="text-sm text-text-tertiary mt-1">JPG, PNG, WebP o PDF · Máximo 10MB por archivo</p>
            </div>
            <GradientButton variant="outline" size="sm">
              <Upload className="h-4 w-4" />
              Seleccionar archivos
            </GradientButton>
          </div>
        )}
      </div>

      {/* Tips collapsible */}
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          onClick={() => setShowTips(!showTips)}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-surface-hover transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-semibold text-text-primary">Tips para mejores resultados</span>
          </div>
          <ChevronRight className={`h-4 w-4 text-text-muted transition-transform ${showTips ? 'rotate-90' : ''}`} />
        </button>
        {showTips && (
          <div className="px-3 pb-3 pt-1 space-y-2 text-sm text-text-secondary border-t border-surface-border">
            <p className="flex items-start gap-2">
              <span>💡</span>
              <span><strong>Buena iluminación:</strong> Evita sombras sobre el recibo</span>
            </p>
            <p className="flex items-start gap-2">
              <span>📐</span>
              <span><strong>Recibo completo:</strong> Asegúrate que aparezcan todos los items y el total</span>
            </p>
            <p className="flex items-start gap-2">
              <span>🔤</span>
              <span><strong>Texto legible:</strong> Enfoca bien, sin movimiento</span>
            </p>
            <p className="flex items-start gap-2">
              <span>📄</span>
              <span><strong>PDFs:</strong> Los PDFs de cartolas bancarias funcionan genial</span>
            </p>
            <p className="flex items-start gap-2">
              <span>🚀</span>
              <span><strong>Varios a la vez:</strong> Puedes arrastrar múltiples archivos</span>
            </p>
          </div>
        )}
      </div>

      {/* Filters + search */}
      {receipts.length > 0 && (
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Buscar por nombre de archivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-surface border border-surface-border text-text-primary outline-none focus:border-violet-500/50 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="flex rounded-xl bg-surface border border-surface-border p-1">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'completed', label: 'Completados' },
              { key: 'pending', label: 'Pendientes' },
              { key: 'failed', label: 'Error' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key as typeof statusFilter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  statusFilter === key
                    ? 'bg-violet-500/20 text-violet-light'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Receipts list */}
      {filteredReceipts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.15em]">
              Historial
            </h2>
            <span className="text-xs text-text-muted">
              {filteredReceipts.length === receipts.length
                ? `${receipts.length} ${receipts.length === 1 ? 'recibo' : 'recibos'}`
                : `${filteredReceipts.length} de ${receipts.length}`}
            </span>
          </div>

          {filteredReceipts.map((receipt) => (
            <div
              key={receipt.id}
              className="glass-card rounded-xl p-3 md:p-4 flex items-center gap-3 transition-fintech hover:bg-surface-hover group"
            >
              <div className="text-2xl flex-shrink-0">
                {receipt.file_type === 'application/pdf' ? '📄' : '🖼️'}
              </div>
              <Link href={`/receipts/${receipt.id}`} className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-text-primary truncate">
                  {receipt.file_name}
                </p>
                <p className="text-xs text-text-tertiary">
                  {formatDate(receipt.created_at.split('T')[0])}
                  {receipt.status === 'failed' && receipt.error_message && (
                    <span className="ml-2 text-vermillion-shu">· {receipt.error_message.slice(0, 40)}</span>
                  )}
                </p>
              </Link>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${STATUS_COLORS[receipt.status]}`}>
                  {STATUS_LABELS[receipt.status]}
                </span>
                <button
                  onClick={() => handleDelete(receipt.id, receipt.file_name)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-vermillion-shu hover:bg-vermillion-shu/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar recibo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <Link
                  href={`/receipts/${receipt.id}`}
                  className="text-text-tertiary group-hover:text-violet-light transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state for filters */}
      {receipts.length > 0 && filteredReceipts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-text-muted">No se encontraron recibos con esos filtros</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
            }}
            className="mt-2 text-sm text-violet-light hover:text-violet-primary"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
