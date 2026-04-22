'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
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
  Copy,
  RotateCcw,
  ExternalLink,
} from 'lucide-react'

interface OnboardingWizardProps {
  userId: string
  initialEmail: string
  initialName: string
  initialCurrency: string
  existingCategories: { id: string; name: string; icon: string | null; type: string }[]
}

const CURRENCIES = [
  { code: 'CLP', label: 'Peso Chileno', symbol: '$', flag: '🇨🇱', max: 5000000, step: 50000 },
  { code: 'USD', label: 'Dólar USA', symbol: '$', flag: '🇺🇸', max: 10000, step: 100 },
  { code: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺', max: 10000, step: 100 },
  { code: 'MXN', label: 'Peso Mexicano', symbol: '$', flag: '🇲🇽', max: 200000, step: 2000 },
  { code: 'ARS', label: 'Peso Argentino', symbol: '$', flag: '🇦🇷', max: 5000000, step: 50000 },
  { code: 'JPY', label: 'Yen Japonés', symbol: '¥', flag: '🇯🇵', max: 1500000, step: 10000 },
  { code: 'GBP', label: 'Libra', symbol: '£', flag: '🇬🇧', max: 8000, step: 100 },
  { code: 'PEN', label: 'Sol Peruano', symbol: 'S/', flag: '🇵🇪', max: 30000, step: 500 },
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

  const [telegramLinked, setTelegramLinked] = useState(false)

  const totalSteps = 8
  const progress = (step / totalSteps) * 100

  const pose: KenjiPose = useMemo(() => {
    if (step === 1) return 'saludo'
    if (step === 8) return 'meditando'
    if (step === 4 && data.firstTxAmount && data.firstTxCategory) return 'celebrando'
    if (step === 6 && telegramLinked) return 'celebrando'
    return 'explicando'
  }, [step, data.firstTxAmount, data.firstTxCategory, telegramLinked])

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
        return telegramLinked
          ? `¡Conectado! Ahora puedes registrar gastos desde Telegram.`
          : `Conecta el bot de Telegram ahora. Te va a ahorrar mucho tiempo después. Este paso no se salta.`
      case 7:
        return `Dos extras opcionales para dejar Katana perfecto.`
      case 8:
        return `Ya eres samurái. El dojo es tuyo. Domo arigatou.`
      default:
        return ''
    }
  }, [step, telegramLinked])

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
        // Si ya tiene 3+ categorías existentes, no necesita seleccionar nada más
        if (existingCategories.length >= 3) return true
        return data.selectedCategories.length >= 3
      case 4:
        return true
      case 5:
        return true
      case 6:
        return telegramLinked
      case 7:
        return true
      default:
        return true
    }
  }

  function handleNext() {
    if (step === 8) {
      finalizeOnboarding()
      return
    }
    setStep((s) => Math.min(s + 1, totalSteps))
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1))
  }

  return (
    <div
      className="min-h-[100dvh] flex flex-col p-4 sm:p-6 lg:p-10"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Top: progress */}
      <div className="max-w-5xl w-full mx-auto mb-4 sm:mb-8">
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

        {/* Mobile samurai */}
        <div
          key={`mobile-${pose}`}
          className="md:hidden flex items-center gap-3 bg-gradient-to-br from-violet-950/60 to-black/40 border border-violet-500/20 rounded-2xl p-3 animate-kenji-enter"
        >
          <SamuraiKenji pose={pose} size={84} animated={false} />
          <p className="text-[13px] text-purple-200 italic flex-1 leading-snug">{dialogue}</p>
        </div>

        {/* Step content column */}
        <div className="bg-[#13091F]/80 backdrop-blur-sm border border-violet-500/15 rounded-2xl sm:rounded-3xl p-5 sm:p-8 sm:min-h-[420px] flex flex-col">
          <div className="flex-1">
            {step === 1 && <Step1Welcome data={data} update={update} />}
            {step === 2 && <Step2Income data={data} update={update} />}
            {step === 3 && <Step3Categories data={data} update={update} existingCategories={existingCategories} />}
            {step === 4 && <Step4FirstTransaction data={data} update={update} />}
            {step === 5 && <Step5Receipt />}
            {step === 6 && (
              <Step6Telegram
                userId={userId}
                linked={telegramLinked}
                onLinked={() => setTelegramLinked(true)}
              />
            )}
            {step === 7 && <Step7Extras />}
            {step === 8 && <Step8Farewell data={data} telegramLinked={telegramLinked} />}
          </div>

          {error && (
            <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-violet-500/10 gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1 || loading}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-3 rounded-xl text-sm text-purple-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            >
              <ChevronLeft className="h-4 w-4" />
              Atrás
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance() || loading}
              className={cn(
                'flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all min-h-[48px] flex-1 sm:flex-initial',
                'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/20',
                'hover:from-violet-500 hover:to-violet-400 hover:shadow-violet-500/40 active:scale-[0.98]',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : step === 8 ? (
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
          autoComplete="given-name"
          className="w-full px-4 py-3 bg-violet-950/40 border border-violet-500/20 rounded-xl text-white placeholder:text-purple-400/40 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all text-base"
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
  const currencyDef = CURRENCIES.find((c) => c.code === data.currency) ?? CURRENCIES[0]
  const maxIncome = currencyDef.max
  const stepIncome = currencyDef.step

  function handleSkip() {
    update('monthlyIncome', null)
    update('incomeSkipped', true)
  }

  function handleSliderChange(val: number) {
    update('monthlyIncome', val)
    update('incomeSkipped', false)
  }

  const currencySymbol = currencyDef.symbol
  const formatted = income > 0 ? `${currencySymbol}${income.toLocaleString('es-CL')}` : `${currencySymbol}0`
  const formattedMax = `${currencySymbol}${maxIncome.toLocaleString('es-CL')}+`

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
          max={maxIncome}
          step={stepIncome}
          value={income}
          disabled={data.incomeSkipped}
          onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
          className="w-full h-3 bg-violet-950/60 rounded-full appearance-none cursor-pointer accent-violet-500 disabled:opacity-40 touch-manipulation"
          style={{
            background: data.incomeSkipped
              ? undefined
              : `linear-gradient(to right, #A855F7 0%, #A855F7 ${(income / maxIncome) * 100}%, rgba(67,13,93,0.6) ${(income / maxIncome) * 100}%, rgba(67,13,93,0.6) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-purple-400/60">
          <span>{currencySymbol}0</span>
          <span>{formattedMax}</span>
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
  const alreadyHasEnough = existingCategories.length >= 3

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {alreadyHasEnough ? 'Tus categorías' : '¿En qué gastas habitualmente?'}
        </h2>
        <p className="text-purple-300/80 text-sm">
          {alreadyHasEnough
            ? `Ya tienes ${existingCategories.length} categorías listas. Puedes marcar favoritas aquí (opcional) o pasar al siguiente.`
            : 'Elige al menos 3. Luego puedes agregar más en Transacciones.'}
        </p>
      </div>

      {alreadyHasEnough && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/25">
          <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-100 leading-snug">
            Tu cuenta ya tiene categorías creadas. Puedes seguir sin seleccionar nada o marcar las que más uses para priorizarlas.
          </p>
        </div>
      )}

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
                <span
                  className="text-[10px] text-green-400/70 font-medium"
                  title="Ya existe en tu cuenta"
                >
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>

      {!alreadyHasEnough && (
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
      )}
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
            pattern="[0-9]*"
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
          className="w-full px-4 py-3 bg-violet-950/40 border border-violet-500/20 rounded-xl text-white placeholder:text-purple-400/30 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 text-base"
        />
      </div>
    </div>
  )
}

function Step5Receipt() {
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

      <div className="bg-violet-950/30 border border-violet-500/20 rounded-xl px-4 py-3 text-center">
        <p className="text-sm text-purple-200">
          Al terminar el tutorial, entra al menú <strong className="text-white">Recibos</strong> y sube tu primera foto.
        </p>
      </div>
    </div>
  )
}

function Step6Telegram({
  userId,
  linked,
  onLinked,
}: {
  userId: string
  linked: boolean
  onLinked: () => void
}) {
  const supabase = createClient()
  const [code, setCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [stepError, setStepError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Generate or recover code on mount
  useEffect(() => {
    async function init() {
      // 1. Check if already linked
      const { data: linkRow } = await supabase
        .from('telegram_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (linkRow) {
        onLinked()
        return
      }

      // 2. Check if there's a valid code already
      const { data: profile } = await supabase
        .from('profiles')
        .select('telegram_link_code, telegram_link_expires_at')
        .eq('id', userId)
        .single()

      if (profile?.telegram_link_code && profile?.telegram_link_expires_at) {
        const exp = new Date(profile.telegram_link_expires_at)
        if (exp > new Date()) {
          setCode(profile.telegram_link_code)
          setExpiresAt(exp)
          return
        }
      }

      // 3. Generate fresh code
      await generateCode()
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll for link status every 3 seconds while not linked
  useEffect(() => {
    if (linked) {
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }

    pollRef.current = setInterval(async () => {
      const { data: linkRow } = await supabase
        .from('telegram_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (linkRow) {
        onLinked()
        if (pollRef.current) clearInterval(pollRef.current)
      }
    }, 3000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linked, userId])

  async function generateCode() {
    setGenerating(true)
    setStepError(null)
    const newCode = Math.floor(100000 + Math.random() * 900000).toString()
    const exp = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        telegram_link_code: newCode,
        telegram_link_expires_at: exp.toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      setStepError('No se pudo generar el código. Intenta de nuevo.')
    } else {
      setCode(newCode)
      setExpiresAt(exp)
    }
    setGenerating(false)
  }

  async function copyCode() {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setStepError('No se pudo copiar automáticamente. Escríbelo manualmente.')
    }
  }

  function openBot() {
    if (!code) return
    window.open(`https://t.me/risky_finance_bot?start=${code}`, '_blank', 'noopener,noreferrer')
  }

  if (linked) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Telegram conectado ✓
          </h2>
          <p className="text-purple-300/80 text-sm">
            Ya puedes registrar gastos escribiéndole al bot.
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500/15 to-violet-500/5 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center flex-shrink-0">
              <Check className="h-7 w-7 text-green-300" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">Bot vinculado</h3>
              <p className="text-sm text-green-100/80 mb-3">
                Ahora prueba enviarle un mensaje:
              </p>
              <div className="space-y-2 text-sm">
                <div className="px-3 py-2 bg-black/30 rounded-lg font-mono text-violet-200">
                  &ldquo;Gasté 8500 en almuerzo&rdquo;
                </div>
                <div className="px-3 py-2 bg-black/30 rounded-lg font-mono text-violet-200">
                  &ldquo;500 pesos café&rdquo;
                </div>
                <div className="px-3 py-2 bg-black/30 rounded-lg font-mono text-violet-200">
                  📸 Una foto de tu recibo
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-purple-300">
          Dale <strong className="text-white">Siguiente</strong> para continuar.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Conecta Telegram 🤖
        </h2>
        <p className="text-purple-300/80 text-sm">
          El bot es la manera más rápida de registrar gastos. Este paso es <strong className="text-white">obligatorio</strong> — solo toma 30 segundos.
        </p>
      </div>

      {/* Instrucciones numeradas */}
      <div className="space-y-2">
        <InstructionStep number={1} text="Abre @risky_finance_bot en Telegram (botón de abajo)" />
        <InstructionStep number={2} text="Envíale el código que ves aquí" />
        <InstructionStep number={3} text="Esta página detecta la conexión automáticamente" />
      </div>

      {/* Código grande */}
      <div className="bg-gradient-to-br from-violet-600/15 to-violet-800/10 border border-violet-400/30 rounded-2xl p-5 text-center">
        <p className="text-xs text-purple-300 uppercase tracking-wider mb-3">
          Tu código de vinculación
        </p>
        {code ? (
          <>
            <div className="flex items-center justify-center gap-2">
              <div className="font-mono text-4xl sm:text-5xl font-bold tracking-widest bg-black/40 px-6 py-4 rounded-xl text-violet-200 shadow-inner">
                {code}
              </div>
              <button
                type="button"
                onClick={copyCode}
                className="p-4 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-200 hover:bg-violet-500/30 transition-colors min-h-[60px]"
                aria-label="Copiar código"
              >
                {copied ? <Check className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            {expiresAt && (
              <p className="text-[11px] text-purple-400/60 mt-3">
                Expira: {expiresAt.toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center gap-2 py-8 text-purple-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Generando código...
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={openBot}
          disabled={!code}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-sm font-bold min-h-[52px] transition-all',
            'bg-gradient-to-r from-[#229ED9] to-[#1E88BF] text-white shadow-lg shadow-[#229ED9]/20',
            'hover:shadow-[#229ED9]/40 active:scale-[0.98] disabled:opacity-40'
          )}
        >
          <Bot className="h-5 w-5" />
          Abrir @risky_finance_bot
          <ExternalLink className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={generateCode}
          disabled={generating}
          className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl text-sm font-medium text-purple-300 border border-violet-500/20 bg-violet-950/30 hover:border-violet-500/40 disabled:opacity-40 min-h-[52px]"
        >
          <RotateCcw className={cn('h-4 w-4', generating && 'animate-spin')} />
          <span className="sm:hidden md:inline">Regenerar</span>
        </button>
      </div>

      {/* Estado polling */}
      <div className="flex items-center justify-center gap-2 text-xs text-purple-400/70 bg-violet-950/30 rounded-xl py-3 border border-violet-500/10">
        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        Esperando conexión del bot...
      </div>

      {stepError && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-300">
          {stepError}
        </div>
      )}
    </div>
  )
}

function InstructionStep({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-start gap-3 px-3 py-2 bg-violet-950/40 border border-violet-500/10 rounded-xl">
      <div className="w-6 h-6 rounded-full bg-violet-500/25 border border-violet-400/40 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs font-bold text-violet-200">{number}</span>
      </div>
      <p className="text-sm text-purple-100/90 leading-snug">{text}</p>
    </div>
  )
}

function Step7Extras() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Dos extras opcionales
        </h2>
        <p className="text-purple-300/80 text-sm">
          Se configuran en 1 minuto. Puedes activarlos después en Configuración.
        </p>
      </div>

      <div className="space-y-3">
        <ExtraCard
          icon={<Target className="h-6 w-6" />}
          title="Primer presupuesto"
          description="Pon un límite mensual a una categoría y recibe alertas al 80% y 100%."
          hint="Menú → Presupuestos"
          color="green"
        />
        <ExtraCard
          icon={<Palette className="h-6 w-6" />}
          title="Tema visual"
          description="Claro, oscuro o automático según hora del día."
          hint="Configuración → Apariencia"
          color="yellow"
        />
      </div>

      <p className="text-center text-xs text-purple-400/60">
        Todo esto se activa en cualquier momento desde el menú.
      </p>
    </div>
  )
}

function ExtraCard({
  icon,
  title,
  description,
  hint,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  hint: string
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
        'flex items-center gap-3 sm:gap-4 bg-gradient-to-br to-black/30 border rounded-2xl p-3 sm:p-4',
        palette
      )}
    >
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-black/30 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold mb-0.5 text-sm sm:text-base">{title}</h3>
        <p className="text-xs text-purple-300/70 leading-snug">{description}</p>
        <p className="text-[10px] text-purple-400/50 mt-1 font-mono">{hint}</p>
      </div>
    </div>
  )
}

function Step8Farewell({
  data,
  telegramLinked,
}: {
  data: WizardState
  telegramLinked: boolean
}) {
  const achievements = [
    `Perfil: ${data.name || 'configurado'} · ${data.currency}`,
    `${data.selectedCategories.length} categorías elegidas`,
    data.firstTxAmount ? 'Primera transacción registrada' : null,
    !data.incomeSkipped && data.monthlyIncome ? 'Ingreso mensual configurado' : null,
    telegramLinked ? 'Bot de Telegram vinculado' : null,
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
