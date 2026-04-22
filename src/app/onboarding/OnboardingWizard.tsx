'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SamuraiKenji, KenjiPose } from '@/components/samurai/SamuraiKenji'
import { cn } from '@/lib/utils'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  Bot,
  Target,
  Palette,
  ArrowRight,
  Loader2,
} from 'lucide-react'

interface OnboardingWizardProps {
  userId: string
  initialEmail: string
  initialName: string
  initialCurrency: string
  existingCategories: { id: string; name: string; icon: string | null; type: string }[]
}

const CURRENCIES = [
  { code: 'CLP', label: 'Peso Chileno', symbol: '$', flag: '🇨🇱' },
  { code: 'USD', label: 'Dólar USA', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'MXN', label: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
  { code: 'ARS', label: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
  { code: 'JPY', label: 'Yen Japonés', symbol: '¥', flag: '🇯🇵' },
  { code: 'GBP', label: 'Libra', symbol: '£', flag: '🇬🇧' },
  { code: 'PEN', label: 'Sol Peruano', symbol: 'S/', flag: '🇵🇪' },
]

const PRESET_CATEGORIES = [
  { icon: '🍔', name: 'Comida' },
  { icon: '🚗', name: 'Transporte' },
  { icon: '🛒', name: 'Supermercado' },
  { icon: '🎬', name: 'Entretenimiento' },
  { icon: '🏠', name: 'Hogar' },
  { icon: '👕', name: 'Ropa' },
  { icon: '💊', name: 'Salud' },
  { icon: '✈️', name: 'Viajes' },
  { icon: '🎓', name: 'Educación' },
  { icon: '💡', name: 'Servicios' },
  { icon: '🍻', name: 'Bares' },
  { icon: '💼', name: 'Trabajo' },
]

type WizardState = {
  name: string
  currency: string
  monthlyIncome: number | null
  incomeSkipped: boolean
  selectedCategories: string[]
  firstTxAmount: string
  firstTxCategory: string
  firstTxDescription: string
  receiptSkipped: boolean
}

export function OnboardingWizard({
  userId,
  initialEmail,
  initialName,
  initialCurrency,
  existingCategories,
}: OnboardingWizardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [data, setData] = useState<WizardState>({
    name: initialName,
    currency: initialCurrency || 'CLP',
    monthlyIncome: null,
    incomeSkipped: false,
    selectedCategories: [],
    firstTxAmount: '',
    firstTxCategory: '',
    firstTxDescription: '',
    receiptSkipped: false,
  })

  const totalSteps = 7
  const progress = (step / totalSteps) * 100

  const pose: KenjiPose = useMemo(() => {
    if (step === 1) return 'saludo'
    if (step === 7) return 'meditando'
    if (step === 4 && data.firstTxAmount && data.firstTxCategory) return 'celebrando'
    return 'explicando'
  }, [step, data.firstTxAmount, data.firstTxCategory])

  const dialogue = useMemo(() => {
    switch (step) {
      case 1:
        return `Konnichiwa. Soy Kenji, tu guía en el dojo de Katana. ¿Cómo te llamas?`
      case 2:
        return `¿Cuánto entra a tu dojo cada mes? Sirve para sugerirte límites justos. Puedes saltar si prefieres.`
      case 3:
        return `Elige las categorías que más usas. Así arrancas con tus propias armas, no las del dojo.`
      case 4:
        return `Registra un gasto reciente que recuerdes. Así aprendes cómo funciona en 30 segundos.`
      case 5:
        return `¿Sabías que puedo leer tus recibos? Sube una foto y la magia pasa. Puedes probar ahora o después.`
      case 6:
        return `Estos tres extras te harán más poderoso. Actívalos ahora o déjalos para otro día.`
      case 7:
        return `Ya eres samurái. El dojo es tuyo. Domo arigatou.`
      default:
        return ''
    }
  }, [step])

  function update<K extends keyof WizardState>(key: K, value: WizardState[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function finalizeOnboarding() {
    setLoading(true)
    setError(null)

    try {
      // 1. Update profile
      const profileUpdate: Record<string, unknown> = {
        display_name: data.name.trim() || null,
        currency: data.currency,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      }
      if (data.monthlyIncome !== null && !data.incomeSkipped) {
        profileUpdate.monthly_income_estimate = data.monthlyIncome
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId)
      if (profileError) throw profileError

      // 2. Create selected categories that don't exist yet
      const existingNames = new Set(existingCategories.map((c) => c.name.toLowerCase()))
      const newCategories = data.selectedCategories
        .filter((name) => !existingNames.has(name.toLowerCase()))
        .map((name, idx) => {
          const preset = PRESET_CATEGORIES.find((p) => p.name === name)
          return {
            user_id: userId,
            name,
            icon: preset?.icon ?? '📌',
            type: 'expense' as const,
            is_default: false,
            sort_order: existingCategories.length + idx,
          }
        })

      let allCategories = existingCategories
      if (newCategories.length > 0) {
        const { data: inserted, error: catError } = await supabase
          .from('categories')
          .insert(newCategories)
          .select('id, name, icon, type')
        if (catError) throw catError
        allCategories = [...existingCategories, ...(inserted ?? [])]
      }

      // 3. Create first transaction (if user entered one)
      if (data.firstTxAmount && data.firstTxCategory) {
        const amountNumber = parseInt(data.firstTxAmount.replace(/\D/g, ''), 10)
        if (amountNumber > 0) {
          const category = allCategories.find((c) => c.name === data.firstTxCategory)
          if (category) {
            const { error: txError } = await supabase.from('transactions').insert({
              user_id: userId,
              category_id: category.id,
              type: 'expense',
              amount: amountNumber,
              description: data.firstTxDescription || data.firstTxCategory,
              transaction_date: new Date().toISOString().slice(0, 10),
              source: 'manual',
            })
            if (txError) throw txError
          }
        }
      }

      router.push('/dashboard')
      router.refresh()
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Algo falló, intenta de nuevo'
      setError(message)
      setLoading(false)
    }
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1:
        return data.name.trim().length > 0 && data.currency.length > 0
      case 2:
        return true
      case 3:
        return data.selectedCategories.length >= 3
      case 4:
        return true
      case 5:
        return true
      case 6:
        return true
      default:
        return true
    }
  }

  function handleNext() {
    if (step === 7) {
      finalizeOnboarding()
      return
    }
    setStep((s) => Math.min(s + 1, totalSteps))
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1))
  }

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-10">
      {/* Top: progress */}
      <div className="max-w-5xl w-full mx-auto mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs sm:text-sm text-purple-300 font-mono tracking-wider">
            PASO {step} / {totalSteps}
          </span>
          <span className="text-xs sm:text-sm text-purple-300/60">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 bg-purple-950/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #C084FC 0%, #9333EA 50%, #84CC16 100%)',
              boxShadow: '0 0 12px rgba(132,204,22,0.4)',
            }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl w-full mx-auto flex-1 grid md:grid-cols-[280px_1fr] gap-6 lg:gap-10 items-start">
        {/* Samurai column */}
        <div className="hidden md:flex flex-col items-center gap-4 sticky top-6">
          <div
            key={pose}
            className="animate-kenji-enter bg-gradient-to-br from-violet-950/60 to-black/40 border border-violet-500/20 rounded-2xl p-6 w-full flex justify-center"
          >
            <SamuraiKenji pose={pose} size={180} />
          </div>
          <div className="bg-gradient-to-br from-violet-500/10 to-green-500/5 border border-violet-500/25 rounded-xl px-4 py-3 text-sm text-purple-200 italic text-center relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-violet-500/25 border-l border-t border-violet-500/25 rotate-45" />
            {dialogue}
          </div>
        </div>

        {/* Mobile samurai (smaller) */}
        <div className="md:hidden flex items-center gap-3 bg-gradient-to-br from-violet-950/60 to-black/40 border border-violet-500/20 rounded-2xl p-3">
          <SamuraiKenji pose={pose} size={72} />
          <p className="text-xs text-purple-200 italic flex-1">{dialogue}</p>
        </div>

        {/* Step content column */}
        <div className="bg-[#13091F]/80 backdrop-blur-sm border border-violet-500/15 rounded-3xl p-6 sm:p-8 min-h-[420px] flex flex-col">
          <div className="flex-1">
            {step === 1 && <Step1Welcome data={data} update={update} />}
            {step === 2 && <Step2Income data={data} update={update} />}
            {step === 3 && <Step3Categories data={data} update={update} existingCategories={existingCategories} />}
            {step === 4 && <Step4FirstTransaction data={data} update={update} />}
            {step === 5 && <Step5Receipt data={data} update={update} />}
            {step === 6 && <Step6Extras />}
            {step === 7 && <Step7Farewell data={data} />}
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-violet-500/10">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1 || loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-purple-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance() || loading}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all',
                'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/20',
                'hover:from-violet-500 hover:to-violet-400 hover:shadow-violet-500/40',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : step === 7 ? (
                <>
                  Entrar al dojo
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Email footer */}
      <div className="max-w-5xl w-full mx-auto mt-6 text-center">
        <p className="text-xs text-purple-400/40">
          Sesión: {initialEmail}
        </p>
      </div>
    </div>
  )
}

// ========= STEPS =========

function Step1Welcome({
  data,
  update,
}: {
  data: WizardState
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Bienvenido al dojo.
        </h2>
        <p className="text-purple-300/80 text-sm">
          Vamos a configurar Katana en 2 minutos.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-purple-300 uppercase tracking-wider">
          ¿Cómo te llamas?
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Tu nombre"
          autoFocus
          className="w-full px-4 py-3 bg-violet-950/40 border border-violet-500/20 rounded-xl text-white placeholder:text-purple-400/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-purple-300 uppercase tracking-wider">
          Moneda principal
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => update('currency', c.code)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-3 rounded-xl border transition-all',
                data.currency === c.code
                  ? 'bg-violet-500/20 border-violet-400 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-violet-950/30 border-violet-500/10 text-purple-300 hover:border-violet-500/40'
              )}
            >
              <span className="text-lg">{c.flag}</span>
              <span className="text-xs font-bold">{c.code}</span>
              <span className="text-[10px] opacity-60">{c.symbol}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step2Income({
  data,
  update,
}: {
  data: WizardState
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void
}) {
  const income = data.monthlyIncome ?? 0

  function handleSkip() {
    update('monthlyIncome', null)
    update('incomeSkipped', true)
  }

  function handleSliderChange(val: number) {
    update('monthlyIncome', val)
    update('incomeSkipped', false)
  }

  const currencySymbol = CURRENCIES.find((c) => c.code === data.currency)?.symbol ?? '$'
  const formatted = income > 0 ? `${currencySymbol}${income.toLocaleString('es-CL')}` : `${currencySymbol}0`

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Tu ingreso mensual aproximado
        </h2>
        <p className="text-purple-300/80 text-sm">
          Opcional. Solo sirve para sugerirte presupuestos realistas. No se comparte con nadie.
        </p>
      </div>

      <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20 rounded-2xl p-6 text-center">
        <p className="text-xs text-purple-300 uppercase tracking-wider mb-2">Estimado</p>
        <p className="text-4xl font-bold font-mono bg-gradient-to-r from-violet-300 to-green-400 bg-clip-text text-transparent">
          {data.incomeSkipped ? 'Prefiero no decir' : formatted}
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="range"
          min="0"
          max="5000000"
          step="50000"
          value={income}
          disabled={data.incomeSkipped}
          onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-violet-950/60 rounded-full appearance-none cursor-pointer accent-violet-500 disabled:opacity-40"
          style={{
            background: data.incomeSkipped
              ? undefined
              : `linear-gradient(to right, #A855F7 0%, #A855F7 ${(income / 5000000) * 100}%, rgba(67,13,93,0.6) ${(income / 5000000) * 100}%, rgba(67,13,93,0.6) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-purple-400/60">
          <span>{currencySymbol}0</span>
          <span>{currencySymbol}5M+</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSkip}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all',
          data.incomeSkipped
            ? 'bg-violet-500/20 border border-violet-400 text-white'
            : 'bg-violet-950/30 border border-violet-500/10 text-purple-300 hover:border-violet-500/30'
        )}
      >
        <SkipForward className="h-4 w-4" />
        Prefiero no decir
      </button>
    </div>
  )
}

function Step3Categories({
  data,
  update,
  existingCategories,
}: {
  data: WizardState
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void
  existingCategories: { id: string; name: string; icon: string | null; type: string }[]
}) {
  function toggle(name: string) {
    const current = data.selectedCategories
    if (current.includes(name)) {
      update('selectedCategories', current.filter((n) => n !== name))
    } else {
      update('selectedCategories', [...current, name])
    }
  }

  const existingNames = new Set(existingCategories.map((c) => c.name.toLowerCase()))
  const count = data.selectedCategories.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          ¿En qué gastas habitualmente?
        </h2>
        <p className="text-purple-300/80 text-sm">
          Elige al menos 3. Luego puedes agregar más en Transacciones.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PRESET_CATEGORIES.map((cat) => {
          const selected = data.selectedCategories.includes(cat.name)
          const existed = existingNames.has(cat.name.toLowerCase())
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => toggle(cat.name)}
              className={cn(
                'flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-all text-left',
                selected
                  ? 'bg-violet-500/20 border-violet-400 text-white shadow-lg shadow-violet-500/20'
                  : 'bg-violet-950/30 border-violet-500/10 text-purple-300 hover:border-violet-500/40'
              )}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="flex-1">{cat.name}</span>
              {selected && <Check className="h-4 w-4 text-violet-300" />}
              {existed && !selected && (
                <span className="text-[10px] text-green-400 opacity-70">ya</span>
              )}
            </button>
          )
        })}
      </div>

      <div
        className={cn(
          'px-4 py-3 rounded-xl text-sm border text-center',
          count >= 3
            ? 'bg-green-500/10 border-green-500/30 text-green-300'
            : 'bg-violet-950/30 border-violet-500/20 text-purple-300/70'
        )}
      >
        {count >= 3
          ? `Perfecto, ${count} categorías seleccionadas`
          : `Selecciona al menos ${3 - count} más (${count}/3)`}
      </div>
    </div>
  )
}

function Step4FirstTransaction({
  data,
  update,
}: {
  data: WizardState
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void
}) {
  const available = data.selectedCategories.length > 0
    ? data.selectedCategories
    : PRESET_CATEGORIES.map((c) => c.name)

  const currencySymbol = CURRENCIES.find((c) => c.code === data.currency)?.symbol ?? '$'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Tu primer gasto
        </h2>
        <p className="text-purple-300/80 text-sm">
          Registra algo real que recuerdes. Así aprendes el flujo. Si prefieres, puedes saltarlo.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-purple-300 uppercase tracking-wider">
          Monto
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300">
            {currencySymbol}
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={data.firstTxAmount}
            onChange={(e) => {
              const clean = e.target.value.replace(/\D/g, '')
              update('firstTxAmount', clean ? parseInt(clean, 10).toLocaleString('es-CL') : '')
            }}
            placeholder="8.500"
            className="w-full pl-10 pr-4 py-3 bg-violet-950/40 border border-violet-500/20 rounded-xl text-white text-lg font-mono placeholder:text-purple-400/30 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-purple-300 uppercase tracking-wider">
          Categoría
        </label>
        <div className="flex flex-wrap gap-2">
          {available.map((name) => {
            const preset = PRESET_CATEGORIES.find((p) => p.name === name)
            const selected = data.firstTxCategory === name
            return (
              <button
                key={name}
                type="button"
                onClick={() => update('firstTxCategory', name)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-all',
                  selected
                    ? 'bg-violet-500/25 border-violet-400 text-white'
                    : 'bg-violet-950/30 border-violet-500/10 text-purple-300 hover:border-violet-500/40'
                )}
              >
                <span>{preset?.icon ?? '📌'}</span>
                <span>{name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-medium text-purple-300 uppercase tracking-wider">
          Descripción (opcional)
        </label>
        <input
          type="text"
          value={data.firstTxDescription}
          onChange={(e) => update('firstTxDescription', e.target.value)}
          placeholder="Ej: Almuerzo en el trabajo"
          className="w-full px-4 py-3 bg-violet-950/40 border border-violet-500/20 rounded-xl text-white placeholder:text-purple-400/30 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
        />
      </div>
    </div>
  )
}

function Step5Receipt({
  data,
  update,
}: {
  data: WizardState
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Recibos con IA 📸
        </h2>
        <p className="text-purple-300/80 text-sm">
          Sacas foto a un recibo, Gemini lo lee por ti y agrega las transacciones solo. Nuestra feature estrella.
        </p>
      </div>

      <div className="bg-gradient-to-br from-violet-600/10 to-green-500/5 border border-violet-500/20 rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-2xl flex-shrink-0">
            📄
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Subes una foto</h3>
            <p className="text-purple-300/70 text-sm">
              De un ticket, boleta, o factura que tengas a mano.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-2xl flex-shrink-0">
            ✨
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">La IA lee todo</h3>
            <p className="text-purple-300/70 text-sm">
              Monto, fecha, comercio y hasta sugerencia de categoría.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-2xl flex-shrink-0">
            ⚡
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Apruebas y listo</h3>
            <p className="text-purple-300/70 text-sm">
              En 5 segundos el gasto está en tu dashboard.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="/receipts"
          target="_blank"
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-500/20 border border-violet-400 text-white font-semibold hover:bg-violet-500/30 transition-all"
        >
          Probar ahora
          <ArrowRight className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={() => update('receiptSkipped', true)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
            data.receiptSkipped
              ? 'bg-violet-500/10 border-violet-500/30 text-violet-300'
              : 'bg-violet-950/30 border-violet-500/10 text-purple-300 hover:border-violet-500/30'
          )}
        >
          <SkipForward className="h-4 w-4" />
          Después lo pruebo
        </button>
      </div>
    </div>
  )
}

function Step6Extras() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Tres extras opcionales
        </h2>
        <p className="text-purple-300/80 text-sm">
          Todos se configuran en 1 minuto. Puedes activarlos después en Configuración.
        </p>
      </div>

      <div className="space-y-3">
        <ExtraCard
          icon={<Bot className="h-6 w-6" />}
          title="Bot de Telegram"
          description="Registra gastos escribiendo un mensaje. Sin abrir la app."
          cta="Conectar"
          href="/settings?tab=telegram"
          color="violet"
        />
        <ExtraCard
          icon={<Target className="h-6 w-6" />}
          title="Primer presupuesto"
          description="Pon un límite mensual a una categoría y recibe alertas."
          cta="Crear"
          href="/budgets"
          color="green"
        />
        <ExtraCard
          icon={<Palette className="h-6 w-6" />}
          title="Tema visual"
          description="Claro, oscuro o automático según hora del día."
          cta="Elegir"
          href="/settings"
          color="yellow"
        />
      </div>

      <p className="text-center text-xs text-purple-400/60">
        Puedes saltar todo esto y configurarlo después desde el menú.
      </p>
    </div>
  )
}

function ExtraCard({
  icon,
  title,
  description,
  cta,
  href,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  cta: string
  href: string
  color: 'violet' | 'green' | 'yellow'
}) {
  const palette = {
    violet: 'from-violet-500/15 border-violet-500/30 text-violet-300',
    green: 'from-green-500/15 border-green-500/30 text-green-300',
    yellow: 'from-yellow-500/15 border-yellow-500/30 text-yellow-300',
  }[color]

  return (
    <div
      className={cn(
        'flex items-center gap-4 bg-gradient-to-br to-black/30 border rounded-2xl p-4',
        palette
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold mb-0.5">{title}</h3>
        <p className="text-xs text-purple-300/70">{description}</p>
      </div>
      <a
        href={href}
        target="_blank"
        className="px-3 py-2 rounded-lg bg-black/30 text-xs font-semibold hover:bg-black/50 transition-colors flex-shrink-0"
      >
        {cta}
      </a>
    </div>
  )
}

function Step7Farewell({ data }: { data: WizardState }) {
  const achievements = [
    `Perfil: ${data.name || 'configurado'} · ${data.currency}`,
    `${data.selectedCategories.length} categorías elegidas`,
    data.firstTxAmount ? 'Primera transacción registrada' : null,
    !data.incomeSkipped && data.monthlyIncome ? 'Ingreso mensual configurado' : null,
  ].filter(Boolean) as string[]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Ya eres samurái 🗡️
        </h2>
        <p className="text-purple-300/80 text-sm">
          El dojo es tuyo. Esto fue lo que logramos juntos:
        </p>
      </div>

      <div className="space-y-2">
        {achievements.map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl"
          >
            <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
            <span className="text-sm text-green-100">{a}</span>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-violet-500/10 to-green-500/5 border border-violet-500/20 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-3 text-sm">Próximos pasos sugeridos:</h3>
        <ul className="space-y-2 text-sm text-purple-300/80">
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>Sube un recibo con IA en <strong className="text-white">Recibos</strong></span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>Revisa tus <strong className="text-white">Insights</strong> semanales</span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400">→</span>
            <span>Instala la app en tu celular (PWA) desde el ícono de descarga del navegador</span>
          </li>
        </ul>
      </div>

      <p className="text-center text-purple-300 italic text-sm">
        &ldquo;Domo arigatou. Que la disciplina te acompañe.&rdquo; — Kenji
      </p>
    </div>
  )
}
