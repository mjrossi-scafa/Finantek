'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileImage, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { GradientButton } from '@/components/shared/GradientButton'

export function ReceiptUploader() {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  const MAX_SIZE = 10 * 1024 * 1024

  async function uploadFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      toast.error('Formato no soportado', { description: 'Usa JPG, PNG, WebP o PDF' })
      return
    }
    if (file.size > MAX_SIZE) {
      toast.error('Archivo muy grande', { description: 'El maximo es 10MB' })
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/receipts', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir el archivo')
      toast.success('Recibo subido, procesando con IA...')
      router.push(`/receipts/${data.receiptId}`)
    } catch (err) {
      toast.error('Error al subir', { description: (err as Error).message })
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer',
        dragging
          ? 'border-violet-primary bg-violet-primary/5 glow-violet'
          : 'border-surface-border hover:border-violet-primary/40 hover:bg-surface-hover/50'
      )}
      onClick={() => !uploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-violet-light animate-spin" />
          <p className="font-semibold text-text-primary">Subiendo y procesando...</p>
          <p className="text-sm text-text-tertiary">La IA esta extrayendo las transacciones</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-3">
            <FileImage className="h-8 w-8 text-text-tertiary" />
            <FileText className="h-8 w-8 text-text-tertiary" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">Arrastra un recibo o haz clic para seleccionar</p>
            <p className="text-sm text-text-tertiary mt-1">JPG, PNG, WebP o PDF · Maximo 10MB</p>
          </div>
          <GradientButton variant="outline" size="sm">
            <Upload className="h-4 w-4" />
            Seleccionar archivo
          </GradientButton>
        </div>
      )}
    </div>
  )
}
