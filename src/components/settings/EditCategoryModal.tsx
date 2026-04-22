'use client'

import { useState } from 'react'
import { Category } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GradientButton } from '@/components/shared/GradientButton'
import { EmojiPicker } from './EmojiPicker'
import { toast } from 'sonner'
import { X, Save } from 'lucide-react'

interface Props {
  category: Category
  onClose: () => void
  onSuccess: () => void
}

export function EditCategoryModal({ category, onClose, onSuccess }: Props) {
  const supabase = createClient()
  const [name, setName] = useState(category.name)
  const [icon, setIcon] = useState(category.icon || '📁')
  const [color, setColor] = useState(category.color || '#8B5CF6')
  const [saving, setSaving] = useState(false)

  const inputClasses = "h-11 bg-surface border-surface-border text-text-primary rounded-xl focus:border-violet-primary focus:ring-violet-primary/20"

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Ingresa un nombre')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('categories')
      .update({ name: name.trim(), icon, color })
      .eq('id', category.id)

    if (error) {
      toast.error('Error al guardar', { description: error.message })
    } else {
      toast.success('Categoría actualizada ✓')
      onSuccess()
    }
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface-primary border border-surface-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Editar categoría</h2>
            <p className="text-xs text-text-muted mt-0.5">
              {category.type === 'expense' ? 'Categoría de gasto' : 'Categoría de ingreso'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <Label className="text-text-secondary text-sm font-medium">Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-[auto,1fr] gap-3">
            <div className="space-y-2">
              <Label className="text-text-secondary text-sm font-medium">Ícono</Label>
              <EmojiPicker value={icon} onChange={setIcon} />
            </div>
            <div className="space-y-2">
              <Label className="text-text-secondary text-sm font-medium">Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-11 h-11 rounded-xl border border-surface-border cursor-pointer bg-surface"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className={inputClasses + ' flex-1 font-mono text-sm'}
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="pt-3 border-t border-surface-border/50">
            <Label className="text-text-muted text-xs mb-2 block">Vista previa</Label>
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-surface-secondary">
              <span className="text-xl">{icon}</span>
              <span className="flex-1 text-sm text-text-primary font-medium">{name || 'Nombre de categoría'}</span>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-surface-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            Cancelar
          </button>
          <GradientButton onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" />
            Guardar
          </GradientButton>
        </div>
      </div>
    </div>
  )
}
