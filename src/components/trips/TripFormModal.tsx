'use client'

import { useState, useEffect } from 'react'
import { Trip } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { X, Save, Plane, RefreshCw, Trash2, Loader2 } from 'lucide-react'
import { GradientButton } from '@/components/shared/GradientButton'
import { getExchangeRate } from '@/lib/utils/exchangeRates'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: (trip: Trip) => void
  userId: string
  editing?: Trip
}

const CURRENCIES = [
  { value: 'JPY', label: '🇯🇵 Yen Japonés (¥)', emoji: '🗾' },
  { value: 'USD', label: '🇺🇸 Dólar (US$)', emoji: '🗽' },
  { value: 'EUR', label: '🇪🇺 Euro (€)', emoji: '🏰' },
  { value: 'ARS', label: '🇦🇷 Peso Argentino', emoji: '🇦🇷' },
  { value: 'PEN', label: '🇵🇪 Sol Peruano', emoji: '🇵🇪' },
  { value: 'MXN', label: '🇲🇽 Peso Mexicano', emoji: '🇲🇽' },
  { value: 'COP', label: '🇨🇴 Peso Colombiano', emoji: '🇨🇴' },
  { value: 'GBP', label: '🇬🇧 Libra', emoji: '🇬🇧' },
  { value: 'BRL', label: '🇧🇷 Real', emoji: '🇧🇷' },
  { value: 'CLP', label: '🇨🇱 Peso Chileno', emoji: '🇨🇱' },
]

const TRIP_EMOJIS = ['✈️', '🗾', '🗽', '🏰', '🏖️', '🏔️', '🌋', '🏛️', '🌴', '🎡', '🗼', '🌸', '🏞️', '⛩️']

export function TripFormModal({ open, onClose, onSuccess, userId, editing }: Props) {
  const supabase = createClient()
  const [name, setName] = useState('')
  const [destination, setDestination] = useState('')
  const [emoji, setEmoji] = useState('✈️')
  const [currency, setCurrency] = useState('JPY')
  const [exchangeRate, setExchangeRate] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [fetchingRate, setFetchingRate] = useState(false)

  const inputClasses = "h-11 bg-surface border-surface-border text-text-primary rounded-xl focus:border-violet-primary focus:ring-violet-primary/20"

  useEffect(() => {
    if (!open) return
    if (editing) {
      setName(editing.name)
      setDestination(editing.destination || '')
      setEmoji(editing.emoji)
      setCurrency(editing.currency)
      setExchangeRate(String(editing.exchange_rate))
      setStartDate(editing.start_date)
      setEndDate(editing.end_date)
      setBudget(editing.budget ? String(editing.budget) : '')
      setNotes(editing.notes || '')
    } else {
      setName('')
      setDestination('')
      setEmoji('✈️')
      setCurrency('JPY')
      setExchangeRate('')
      const today = new Date().toISOString().split('T')[0]
      setStartDate(today)
      setEndDate(today)
      setBudget('')
      setNotes('')
    }
  }, [open, editing])

  // Auto-fetch exchange rate when currency changes (if not editing)
  useEffect(() => {
    if (!open || currency === 'CLP') return
    if (editing && editing.currency === currency) return // don't override existing rate
    fetchRate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, open])

  async function fetchRate() {
    if (currency === 'CLP') {
      setExchangeRate('1')
      return
    }
    setFetchingRate(true)
    try {
      const rate = await getExchangeRate(currency, 'CLP')
      setExchangeRate(rate.toFixed(4))
    } catch {
      toast.error('No se pudo obtener la tasa de cambio')
    } finally {
      setFetchingRate(false)
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Ingresa un nombre')
      return
    }
    if (!startDate || !endDate) {
      toast.error('Selecciona las fechas')
      return
    }
    if (endDate < startDate) {
      toast.error('La fecha de fin debe ser después de la de inicio')
      return
    }
    const rate = parseFloat(exchangeRate)
    if (isNaN(rate) || rate <= 0) {
      toast.error('Ingresa una tasa de cambio válida')
      return
    }

    setSaving(true)
    try {
      if (editing) {
        const { data, error } = await supabase
          .from('trips')
          .update({
            name: name.trim(),
            destination: destination.trim() || null,
            emoji,
            currency,
            exchange_rate: rate,
            start_date: startDate,
            end_date: endDate,
            budget: budget ? parseInt(budget.replace(/\D/g, ''), 10) : null,
            notes: notes.trim() || null,
          })
          .eq('id', editing.id)
          .select()
          .single()

        if (error) throw error
        toast.success('Viaje actualizado ✓')
        onSuccess(data as Trip)
      } else {
        const { data, error } = await supabase
          .from('trips')
          .insert({
            user_id: userId,
            name: name.trim(),
            destination: destination.trim() || null,
            emoji,
            currency,
            exchange_rate: rate,
            start_date: startDate,
            end_date: endDate,
            budget: budget ? parseInt(budget.replace(/\D/g, ''), 10) : null,
            notes: notes.trim() || null,
            is_active: false,
          })
          .select()
          .single()

        if (error) throw error
        toast.success('✈️ Viaje creado')
        onSuccess(data as Trip)
      }
    } catch (err) {
      toast.error('Error al guardar', { description: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!editing) return
    if (!confirm('¿Eliminar este viaje? Las transacciones asociadas no se eliminarán pero perderán la referencia al viaje.')) return

    setDeleting(true)
    const { error } = await supabase.from('trips').delete().eq('id', editing.id)
    if (error) {
      toast.error('Error al eliminar', { description: error.message })
      setDeleting(false)
    } else {
      toast.success('Viaje eliminado')
      onClose()
      window.location.reload()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface-primary border border-surface-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-border sticky top-0 bg-surface-primary z-10">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-violet-light" />
            <h2 className="text-lg font-bold text-text-primary">
              {editing ? 'Editar viaje' : 'Nuevo viaje'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Emoji picker */}
          <div>
            <Label className="text-text-secondary text-sm font-medium mb-2 block">Icono</Label>
            <div className="flex gap-1.5 flex-wrap">
              {TRIP_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-lg text-xl transition-all ${
                    emoji === e
                      ? 'bg-violet-500/20 ring-2 ring-violet-500'
                      : 'bg-surface border border-surface-border hover:border-violet-500/40'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label className="text-text-secondary text-sm font-medium mb-1.5 block">Nombre del viaje</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Japón 2026"
              autoFocus
              className={inputClasses}
            />
          </div>

          {/* Destination */}
          <div>
            <Label className="text-text-secondary text-sm font-medium mb-1.5 block">Destino (opcional)</Label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ej: Tokyo, Osaka, Kyoto"
              className={inputClasses}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-text-secondary text-sm font-medium mb-1.5 block">Fecha inicio</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <Label className="text-text-secondary text-sm font-medium mb-1.5 block">Fecha fin</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Currency + Rate */}
          <div className="grid grid-cols-[1.5fr,1fr] gap-3">
            <div>
              <Label className="text-text-secondary text-sm font-medium mb-1.5 block">Moneda</Label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-11 w-full px-3 rounded-xl bg-surface border border-surface-border text-text-primary outline-none focus:border-violet-500"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-text-secondary text-sm font-medium mb-1.5 block">
                <div className="flex items-center justify-between">
                  <span>1 {currency} = CLP</span>
                  <button
                    type="button"
                    onClick={fetchRate}
                    disabled={fetchingRate}
                    className="text-violet-light hover:text-violet-primary transition-colors disabled:opacity-50"
                    title="Actualizar tasa"
                  >
                    {fetchingRate ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                  </button>
                </div>
              </Label>
              <Input
                type="number"
                step="0.0001"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                placeholder="0.00"
                className={inputClasses + ' font-mono'}
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <Label className="text-text-secondary text-sm font-medium mb-1.5 block">
              Presupuesto total (CLP) — opcional
            </Label>
            <div className="flex items-center gap-1 px-3 rounded-xl bg-surface border border-surface-border h-11">
              <span className="text-text-muted text-sm">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={budget}
                onChange={(e) => setBudget(e.target.value.replace(/\D/g, ''))}
                placeholder="1500000"
                className="flex-1 bg-transparent border-0 outline-none text-text-primary font-mono"
              />
            </div>
            {budget && (
              <p className="text-xs text-text-muted mt-1">
                ≈ {(parseInt(budget, 10) / (parseFloat(exchangeRate) || 1)).toLocaleString('en-US', { maximumFractionDigits: 0 })} {currency}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label className="text-text-secondary text-sm font-medium mb-1.5 block">Notas (opcional)</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Itinerario, lugares importantes..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-text-primary outline-none focus:border-violet-500 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 p-5 border-t border-surface-border sticky bottom-0 bg-surface-primary">
          {editing ? (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-vermillion-shu hover:bg-vermillion-shu/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              Cancelar
            </button>
            <GradientButton onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear viaje'}
            </GradientButton>
          </div>
        </div>
      </div>
    </div>
  )
}
