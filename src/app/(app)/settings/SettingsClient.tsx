'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Category, Profile, UserPreferences } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GradientButton } from '@/components/shared/GradientButton'
import { TelegramBotSection } from '@/components/settings/TelegramBotSection'
import { EditCategoryModal } from '@/components/settings/EditCategoryModal'
import { EmojiPicker } from '@/components/settings/EmojiPicker'
import { toast } from 'sonner'
import {
  Plus, Trash2, Save, LogOut, User, Lock, Download,
  Bell, Globe, DollarSign, AlertTriangle, Edit2, Palette, RefreshCw,
} from 'lucide-react'

interface SettingsClientProps {
  profile: Profile | null
  categories: Category[]
  userId: string
  transactionCount: number
  achievementCount: number
}

const TIMEZONES = [
  { value: 'America/Santiago', label: '🇨🇱 Chile (Santiago)' },
  { value: 'America/Argentina/Buenos_Aires', label: '🇦🇷 Argentina' },
  { value: 'America/Lima', label: '🇵🇪 Perú' },
  { value: 'America/Mexico_City', label: '🇲🇽 México' },
  { value: 'America/Bogota', label: '🇨🇴 Colombia' },
  { value: 'America/New_York', label: '🇺🇸 Nueva York' },
  { value: 'Europe/Madrid', label: '🇪🇸 España' },
  { value: 'UTC', label: '🌐 UTC' },
]

const CURRENCIES = [
  { value: 'CLP', label: 'CLP · Peso Chileno' },
  { value: 'ARS', label: 'ARS · Peso Argentino' },
  { value: 'PEN', label: 'PEN · Sol Peruano' },
  { value: 'MXN', label: 'MXN · Peso Mexicano' },
  { value: 'COP', label: 'COP · Peso Colombiano' },
  { value: 'USD', label: 'USD · Dólar' },
  { value: 'EUR', label: 'EUR · Euro' },
]

export function SettingsClient({
  profile,
  categories,
  userId,
  transactionCount,
  achievementCount,
}: SettingsClientProps) {
  const supabase = createClient()
  const router = useRouter()

  // Profile state
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [timezone, setTimezone] = useState(profile?.timezone ?? 'America/Santiago')
  const [currency, setCurrency] = useState(profile?.currency ?? 'CLP')
  const [savingProfile, setSavingProfile] = useState(false)

  // Preferences state
  const defaultPrefs: UserPreferences = {
    notifications: { budget_alerts: true, weekly_insights: true, daily_reminders: true },
    reminder_hour: 21,
  }
  const [preferences, setPreferences] = useState<UserPreferences>(profile?.preferences ?? defaultPrefs)
  const [savingPrefs, setSavingPrefs] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Category state
  const [newCatName, setNewCatName] = useState('')
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense')
  const [newCatIcon, setNewCatIcon] = useState('📁')
  const [newCatColor, setNewCatColor] = useState('#8B5CF6')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  const inputClasses = "h-11 bg-surface border-surface-border text-text-primary placeholder:text-text-tertiary rounded-xl focus:border-violet-primary focus:ring-violet-primary/20"
  const selectClasses = "h-11 bg-surface border border-surface-border text-text-primary rounded-xl px-3 outline-none focus:border-violet-primary w-full"

  // Stats
  const memberSince = profile?.created_at ? new Date(profile.created_at) : null
  const daysAsMember = memberSince
    ? Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  async function saveProfile() {
    setSavingProfile(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        timezone,
        currency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) toast.error('Error al guardar')
    else toast.success('Perfil actualizado ✓')
    setSavingProfile(false)
  }

  async function savePreferences() {
    setSavingPrefs(true)
    const { error } = await supabase
      .from('profiles')
      .update({ preferences, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (error) toast.error('Error al guardar preferencias')
    else toast.success('Preferencias guardadas ✓')
    setSavingPrefs(false)
  }

  async function changePassword() {
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      toast.error('Error al cambiar contraseña', { description: error.message })
    } else {
      toast.success('Contraseña actualizada ✓')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setChangingPassword(false)
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
      setNewCatIcon('📁')
      router.refresh()
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('¿Eliminar esta categoría?')) return

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

  async function handleRetakeTutorial() {
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: false })
      .eq('id', userId)
    if (error) {
      toast.error('No se pudo reiniciar el tutorial', { description: error.message })
      return
    }
    router.push('/onboarding')
  }

  async function handleRetakeTour() {
    const { error } = await supabase
      .from('profiles')
      .update({ app_tour_completed: false })
      .eq('id', userId)
    if (error) {
      toast.error('No se pudo reiniciar el tour', { description: error.message })
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function exportData() {
    toast.loading('Preparando exportación...', { id: 'export' })
    try {
      const res = await fetch('/api/account/export')
      if (!res.ok) throw new Error('Error al exportar')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `katana-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Datos exportados ✓', { id: 'export' })
    } catch (err) {
      toast.error('Error al exportar', { id: 'export', description: (err as Error).message })
    }
  }

  async function deleteAccount() {
    if (deleteConfirmText !== 'ELIMINAR') {
      toast.error('Debes escribir ELIMINAR para confirmar')
      return
    }

    setDeletingAccount(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (!res.ok) throw new Error('Error al eliminar cuenta')

      toast.success('Cuenta eliminada')
      router.push('/login')
      router.refresh()
    } catch (err) {
      toast.error('Error al eliminar cuenta', { description: (err as Error).message })
      setDeletingAccount(false)
    }
  }

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const incomeCategories = categories.filter((c) => c.type === 'income')

  return (
    <div className="space-y-6">
      {/* Stats banner */}
      <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/20">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {(displayName || profile?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-text-primary truncate">
              {displayName || 'Sin nombre'}
            </p>
            <p className="text-xs text-text-muted truncate">{profile?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-surface-border/50">
          <div className="text-center">
            <p className="text-lg font-bold font-mono text-text-primary">{daysAsMember}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wide">Días en Katana</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold font-mono text-text-primary">{transactionCount}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wide">Transacciones</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold font-mono text-yellow-400">{achievementCount}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wide">Logros</p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-violet-light" />
          <h2 className="text-sm font-bold text-text-primary">Perfil</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-text-secondary text-sm font-medium">Correo electrónico</Label>
            <Input value={profile?.email ?? ''} disabled className={inputClasses + ' opacity-60'} />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-text-secondary text-sm font-medium flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Moneda
              </Label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={selectClasses}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-text-secondary text-sm font-medium flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Zona horaria
              </Label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={selectClasses}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          </div>

          <GradientButton onClick={saveProfile} loading={savingProfile} size="sm">
            <Save className="h-4 w-4" />
            Guardar cambios
          </GradientButton>
        </div>
      </div>

      {/* Password */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-4 w-4 text-violet-light" />
          <h2 className="text-sm font-bold text-text-primary">Seguridad</h2>
        </div>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-text-secondary text-sm font-medium">Nueva contraseña</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className={inputClasses}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-text-secondary text-sm font-medium">Confirmar contraseña</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className={inputClasses}
            />
          </div>
          <GradientButton
            onClick={changePassword}
            loading={changingPassword}
            disabled={!newPassword || !confirmPassword}
            size="sm"
          >
            <Lock className="h-4 w-4" />
            Cambiar contraseña
          </GradientButton>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-violet-light" />
          <h2 className="text-sm font-bold text-text-primary">Notificaciones</h2>
        </div>
        <div className="space-y-3">
          {[
            { key: 'budget_alerts' as const, label: 'Alertas de presupuesto', desc: 'Cuando te acerques al límite' },
            { key: 'weekly_insights' as const, label: 'Insights semanales', desc: 'Análisis IA cada lunes' },
            { key: 'daily_reminders' as const, label: 'Recordatorios diarios', desc: 'Del bot de Telegram' },
          ].map(({ key, label, desc }) => (
            <label
              key={key}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-surface-border cursor-pointer hover:border-violet-500/30 transition-colors"
            >
              <input
                type="checkbox"
                checked={preferences.notifications[key]}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    notifications: { ...preferences.notifications, [key]: e.target.checked },
                  })
                }
                className="h-4 w-4 rounded border-surface-border text-violet-500 focus:ring-violet-500"
              />
              <div className="flex-1">
                <p className="text-sm text-text-primary font-medium">{label}</p>
                <p className="text-xs text-text-muted">{desc}</p>
              </div>
            </label>
          ))}

          <div className="space-y-2 pt-2">
            <Label className="text-text-secondary text-sm font-medium">Hora del recordatorio diario</Label>
            <select
              value={preferences.reminder_hour}
              onChange={(e) =>
                setPreferences({ ...preferences, reminder_hour: parseInt(e.target.value, 10) })
              }
              className={selectClasses}
            >
              {[9, 15, 18, 21].map((h) => (
                <option key={h} value={h}>
                  {h}:00 hrs {h === 9 ? '🌅' : h === 15 ? '☀️' : h === 18 ? '🌇' : '🌙'}
                </option>
              ))}
            </select>
          </div>

          <GradientButton onClick={savePreferences} loading={savingPrefs} size="sm">
            <Save className="h-4 w-4" />
            Guardar preferencias
          </GradientButton>
        </div>
      </div>

      {/* Telegram Bot */}
      <TelegramBotSection userId={userId} />

      {/* Categories */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-4 w-4 text-violet-light" />
          <h2 className="text-sm font-bold text-text-primary">Categorías</h2>
        </div>
        <div className="space-y-4">
          {/* Expense categories */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.15em]">Gastos</h3>
            <div className="space-y-1">
              {expenseCategories.map((c) => (
                <CategoryRow
                  key={c.id}
                  category={c}
                  onEdit={() => setEditingCategory(c)}
                  onDelete={() => deleteCategory(c.id)}
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-surface-border" />

          {/* Income categories */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.15em]">Ingresos</h3>
            <div className="space-y-1">
              {incomeCategories.map((c) => (
                <CategoryRow
                  key={c.id}
                  category={c}
                  onEdit={() => setEditingCategory(c)}
                  onDelete={() => deleteCategory(c.id)}
                />
              ))}
            </div>
          </div>

          <div className="h-px bg-surface-border" />

          {/* New category form */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.15em]">Nueva categoría</h3>
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
              <EmojiPicker value={newCatIcon} onChange={setNewCatIcon} />
              <Input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nombre de la categoría"
                className={inputClasses + ' flex-1'}
              />
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="w-11 h-11 rounded-xl border border-surface-border cursor-pointer bg-surface"
              />
            </div>
            <GradientButton onClick={addCategory} variant="outline" fullWidth size="sm">
              <Plus className="h-4 w-4" />
              Agregar categoría
            </GradientButton>
          </div>
        </div>
      </div>

      {/* Retake tutorial */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-violet-light" />
          <h2 className="text-sm font-bold text-text-primary">Tutoriales con Kenji</h2>
        </div>
        <div>
          <p className="text-sm text-text-muted mb-3">
            Vuelve al wizard de bienvenida para configurar moneda, categorías, transacción y Telegram desde cero.
          </p>
          <GradientButton onClick={handleRetakeTutorial} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
            Rehacer onboarding inicial
          </GradientButton>
        </div>
        <div className="border-t border-surface-border/30 pt-4">
          <p className="text-sm text-text-muted mb-3">
            Repasa el tour guiado de la app (dashboard, transacciones, recibos, presupuestos, viajes, insights).
          </p>
          <GradientButton onClick={handleRetakeTour} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
            Ver tour de la app
          </GradientButton>
        </div>
      </div>

      {/* Data export */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-4 w-4 text-violet-light" />
          <h2 className="text-sm font-bold text-text-primary">Exportar datos</h2>
        </div>
        <p className="text-sm text-text-muted mb-3">
          Descarga todas tus transacciones en formato CSV. Compatible con Excel, Google Sheets, etc.
        </p>
        <GradientButton onClick={exportData} variant="outline" size="sm">
          <Download className="h-4 w-4" />
          Descargar CSV ({transactionCount} transacciones)
        </GradientButton>
      </div>

      {/* Logout + Delete account */}
      <div className="glass-card rounded-2xl p-4 space-y-2">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-vermillion-shu hover:bg-vermillion-shu/10 transition-all"
          >
            <AlertTriangle className="h-4 w-4" />
            Eliminar cuenta
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-vermillion-shu/10 border border-vermillion-shu/30 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-vermillion-shu flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-vermillion-shu">¿Eliminar cuenta permanentemente?</p>
                <p className="text-xs text-text-secondary mt-1">
                  Esto eliminará <strong>todos tus datos</strong>: transacciones, presupuestos, recibos, planificados, logros. Esta acción NO se puede deshacer.
                </p>
              </div>
            </div>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Escribe ELIMINAR para confirmar"
              className={inputClasses}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText('')
                }}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleteConfirmText !== 'ELIMINAR' || deletingAccount}
                className="flex-1 py-2 rounded-lg text-sm font-semibold bg-vermillion-shu text-white hover:bg-vermillion-shu/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingAccount ? 'Eliminando...' : 'Eliminar todo'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit category modal */}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={() => {
            setEditingCategory(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-surface-hover transition-colors group">
      <span>{category.icon}</span>
      <span className="flex-1 text-sm text-text-primary">{category.name}</span>
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color ?? '#8B5CF6' }} />
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="h-6 w-6 rounded-md flex items-center justify-center text-text-tertiary hover:text-violet-light hover:bg-violet-500/10 transition-colors"
          title="Editar"
        >
          <Edit2 className="h-3 w-3" />
        </button>
        {!category.is_default && (
          <button
            onClick={onDelete}
            className="h-6 w-6 rounded-md flex items-center justify-center text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}
