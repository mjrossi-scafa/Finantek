'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Category, Profile } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GradientButton } from '@/components/shared/GradientButton'
import { TelegramBotSection } from '@/components/settings/TelegramBotSection'
import { toast } from 'sonner'
import { Plus, Trash2, Save, LogOut } from 'lucide-react'

interface SettingsClientProps {
  profile: Profile | null
  categories: Category[]
  userId: string
}

export function SettingsClient({ profile, categories, userId }: SettingsClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [savingProfile, setSavingProfile] = useState(false)

  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense')
  const [newCatIcon, setNewCatIcon] = useState('📁')
  const [newCatColor, setNewCatColor] = useState('#8B5CF6')

  const inputClasses = "h-12 bg-surface border-surface-border text-text-primary placeholder:text-text-tertiary rounded-xl focus:border-violet-primary focus:ring-violet-primary/20"

  async function saveProfile() {
    setSavingProfile(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) toast.error('Error al guardar')
    else toast.success('Perfil actualizado')
    setSavingProfile(false)
  }

  async function addCategory() {
    if (!newCatName.trim()) {
      toast.error('Ingresa un nombre para la categoría')
      return
    }

    const { error } = await supabase.from('categories').insert({
      user_id: userId,
      name: newCatName.trim(),
      type: newCatType,
      icon: newCatIcon,
      color: newCatColor,
      sort_order: categories.length + 1,
    })

    if (error) toast.error('Error al crear categoría')
    else {
      toast.success('Categoría creada')
      setNewCatName('')
      router.refresh()
    }
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      toast.error('No se puede eliminar', {
        description: 'La categoría puede tener transacciones asociadas.',
      })
    } else {
      toast.success('Categoría eliminada')
      router.refresh()
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const incomeCategories = categories.filter((c) => c.type === 'income')

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-bold text-text-primary mb-4">Perfil</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-text-secondary text-sm font-medium">Correo electronico</Label>
            <Input value={profile?.email ?? ''} disabled className={inputClasses + ' opacity-50'} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-text-secondary text-sm font-medium">Nombre</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tu nombre"
              className={inputClasses}
            />
          </div>
          <GradientButton onClick={saveProfile} loading={savingProfile} size="sm">
            <Save className="h-4 w-4" />
            Guardar
          </GradientButton>
        </div>
      </div>

      {/* Telegram Bot */}
      <TelegramBotSection userId={userId} />

      {/* Categories */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-bold text-text-primary mb-4">Categorías</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.15em]">Gastos</h3>
            <div className="space-y-1">
              {expenseCategories.map((c) => (
                <div key={c.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface-hover transition-colors group">
                  <span>{c.icon}</span>
                  <span className="flex-1 text-sm text-text-primary">{c.name}</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color ?? '#8B5CF6' }} />
                  {!c.is_default && (
                    <button
                      onClick={() => deleteCategory(c.id)}
                      className="h-6 w-6 rounded-md flex items-center justify-center text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-surface-border" />

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.15em]">Ingresos</h3>
            <div className="space-y-1">
              {incomeCategories.map((c) => (
                <div key={c.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface-hover transition-colors group">
                  <span>{c.icon}</span>
                  <span className="flex-1 text-sm text-text-primary">{c.name}</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color ?? '#8B5CF6' }} />
                  {!c.is_default && (
                    <button
                      onClick={() => deleteCategory(c.id)}
                      className="h-6 w-6 rounded-md flex items-center justify-center text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-surface-border" />

          {/* New category form */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.15em]">Nueva categoria</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNewCatType('expense')}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all duration-200 ${newCatType === 'expense' ? 'bg-danger text-white' : 'bg-surface border border-surface-border text-text-tertiary hover:bg-surface-hover'}`}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setNewCatType('income')}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all duration-200 ${newCatType === 'income' ? 'bg-success text-white' : 'bg-surface border border-surface-border text-text-tertiary hover:bg-surface-hover'}`}
              >
                Ingreso
              </button>
            </div>
            <div className="flex gap-2">
              <Input
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                className={inputClasses + ' w-14 text-center'}
                maxLength={4}
              />
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nombre de la categoria"
                className={inputClasses + ' flex-1'}
              />
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-12 h-12 rounded-xl border border-surface-border cursor-pointer bg-surface"
              />
            </div>
            <GradientButton onClick={addCategory} variant="outline" fullWidth size="sm">
              <Plus className="h-4 w-4" />
              Agregar categoria
            </GradientButton>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="glass-card rounded-2xl p-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-danger hover:bg-danger/10 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesion
        </button>
      </div>
    </div>
  )
}
