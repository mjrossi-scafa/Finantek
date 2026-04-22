'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SamuraiKenji, KenjiPose } from '@/components/samurai/SamuraiKenji'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react'

export interface TourStep {
  id: string
  // Selector: tries each until one matches (mobile + desktop)
  targets: string[]
  title: string
  description: string
  pose: KenjiPose
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  // Route that must be active for this step (optional redirect)
  requireRoute?: string
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    targets: [],
    title: 'Te muestro el dojo',
    description:
      'En 60 segundos conoces cada sección importante. Si quieres explorar solo, dale Saltar.',
    pose: 'saludo',
    placement: 'center',
    requireRoute: '/dashboard',
  },
  {
    id: 'katana-widget',
    targets: ['[data-tour="katana-widget"]'],
    title: 'Tu samurái',
    description:
      'Cambia de color según tu salud financiera: violeta normal, verde si ahorras, amarillo alerta, rojo gastaste demás, dorado por logros.',
    pose: 'explicando',
    placement: 'right',
    requireRoute: '/dashboard',
  },
  {
    id: 'transactions',
    targets: ['[data-tour="nav-transactions"]', '[data-tour="mnav-transactions"]'],
    title: 'Transacciones',
    description:
      'El corazón de Katana. Aquí registras cada gasto o ingreso manualmente. También ves el historial completo y los filtras.',
    pose: 'explicando',
    placement: 'right',
  },
  {
    id: 'receipts',
    targets: ['[data-tour="nav-receipts"]'],
    title: 'Recibos con IA',
    description:
      'Sube la foto de cualquier boleta y Gemini te lee monto, fecha, comercio y te sugiere categoría. Funciona hasta con fotos mal sacadas.',
    pose: 'celebrando',
    placement: 'right',
  },
  {
    id: 'budgets',
    targets: ['[data-tour="nav-budgets"]'],
    title: 'Presupuestos',
    description:
      'Pones un límite mensual por categoría (ej: máximo 200.000 en Comida). Katana te avisa al 80% y al 100%.',
    pose: 'explicando',
    placement: 'right',
  },
  {
    id: 'planner',
    targets: ['[data-tour="nav-planner"]', '[data-tour="mnav-planner"]'],
    title: 'Planificador',
    description:
      'Agenda gastos futuros: arriendo, suscripciones, cuentas. Te aviso antes de cada vencimiento y puedes marcarlos como pagados.',
    pose: 'explicando',
    placement: 'right',
  },
  {
    id: 'trips',
    targets: ['[data-tour="nav-trips"]', '[data-tour="mnav-trips"]'],
    title: 'Viajes',
    description:
      'Cuando viajas a otro país, creas un viaje, eliges la moneda, y cada gasto se convierte automático a tu moneda base. Perfecto para Japón.',
    pose: 'explicando',
    placement: 'right',
  },
  {
    id: 'insights',
    targets: ['[data-tour="nav-insights"]'],
    title: 'Insights con IA',
    description:
      'Cada semana analizo tus patrones y te doy un resumen: dónde gastaste más, tendencias, recomendaciones. Se genera solo.',
    pose: 'explicando',
    placement: 'right',
  },
  {
    id: 'achievements',
    targets: ['[data-tour="nav-achievements"]', '[data-tour="mnav-achievements"]'],
    title: 'Logros',
    description:
      'Cada acción te da puntos y desbloqueas logros: registrar 7 días seguidos, ahorrar 20%, subir tu primer recibo. Revisa aquí tu progreso.',
    pose: 'celebrando',
    placement: 'right',
  },
  {
    id: 'farewell',
    targets: [],
    title: '¡Ya conoces el dojo!',
    description:
      'Explora a tu ritmo. Si quieres rever el tour, está en Configuración → Ver tour. Domo arigatou.',
    pose: 'meditando',
    placement: 'center',
  },
]

interface AppTourProps {
  userId: string
  open: boolean
  onClose: () => void
}

export function AppTour({ userId, open, onClose }: AppTourProps) {
  const router = useRouter()
  const supabase = createClient()
  const [stepIndex, setStepIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const step = TOUR_STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === TOUR_STEPS.length - 1

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Navigate to required route if needed
  useEffect(() => {
    if (!open || !step.requireRoute) return
    if (typeof window !== 'undefined' && window.location.pathname !== step.requireRoute) {
      router.push(step.requireRoute)
    }
  }, [open, step.requireRoute, router])

  // Track target element position (tick to handle scroll/layout changes)
  useEffect(() => {
    if (!open) return

    function updateRect() {
      if (!step.targets.length) {
        setTargetRect(null)
        return
      }
      for (const sel of step.targets) {
        const el = document.querySelector(sel)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            setTargetRect(rect)
            // Scroll into view if not visible
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
            return
          }
        }
      }
      setTargetRect(null)
    }

    updateRect()
    tickRef.current = setInterval(updateRect, 250)
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)

    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
  }, [open, stepIndex, step.targets])

  function handleNext() {
    if (isLast) {
      completeTour()
      return
    }
    setStepIndex((i) => Math.min(i + 1, TOUR_STEPS.length - 1))
  }

  function handlePrev() {
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  async function completeTour() {
    await supabase
      .from('profiles')
      .update({
        app_tour_completed: true,
        app_tour_completed_at: new Date().toISOString(),
      })
      .eq('id', userId)
    onClose()
    router.refresh()
  }

  async function handleSkip() {
    await completeTour()
  }

  const placement = step.placement ?? 'bottom'
  const hasTarget = Boolean(targetRect)

  // Compute tooltip position (hook must be called before any early return)
  const tooltipStyle = useMemo<React.CSSProperties>(() => {
    if (!targetRect || placement === 'center' || isMobile) {
      return {}
    }
    if (typeof window === 'undefined') return {}

    const padding = 16
    switch (placement) {
      case 'right':
        return {
          top: Math.max(16, targetRect.top + targetRect.height / 2 - 150),
          left: Math.min(window.innerWidth - 400, targetRect.right + padding),
        }
      case 'left':
        return {
          top: Math.max(16, targetRect.top + targetRect.height / 2 - 150),
          right: Math.min(window.innerWidth - 400, window.innerWidth - targetRect.left + padding),
        }
      case 'top':
        return {
          bottom: window.innerHeight - targetRect.top + padding,
          left: Math.max(16, Math.min(window.innerWidth - 400, targetRect.left)),
        }
      case 'bottom':
      default:
        return {
          top: targetRect.bottom + padding,
          left: Math.max(16, Math.min(window.innerWidth - 400, targetRect.left)),
        }
    }
  }, [targetRect, placement, isMobile])

  if (!mounted || !open) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Dimmed overlay with cutout */}
      <div className="absolute inset-0 pointer-events-auto" onClick={() => {}}>
        {hasTarget && !isMobile ? (
          <svg className="absolute inset-0 w-full h-full" style={{ width: '100vw', height: '100vh' }}>
            <defs>
              <mask id="tour-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={targetRect!.left - 8}
                  y={targetRect!.top - 8}
                  width={targetRect!.width + 16}
                  height={targetRect!.height + 16}
                  rx="12"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(5,0,15,0.82)"
              mask="url(#tour-mask)"
              className="transition-all duration-500"
            />
          </svg>
        ) : (
          <div className="absolute inset-0 bg-[rgba(5,0,15,0.82)] backdrop-blur-[2px]" />
        )}

        {/* Glow ring around target */}
        {hasTarget && !isMobile && (
          <div
            className="absolute rounded-xl pointer-events-none transition-all duration-500 animate-tour-pulse"
            style={{
              top: targetRect!.top - 8,
              left: targetRect!.left - 8,
              width: targetRect!.width + 16,
              height: targetRect!.height + 16,
              boxShadow: '0 0 0 2px rgba(132,204,22,0.6), 0 0 40px 8px rgba(132,204,22,0.25)',
            }}
          />
        )}
      </div>

      {/* Tooltip card with Kenji */}
      <div
        className={cn(
          'pointer-events-auto absolute animate-kenji-enter',
          placement === 'center' || isMobile
            ? 'inset-x-4 bottom-6 md:inset-x-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[420px]'
            : 'w-[360px] max-w-[calc(100vw-32px)]'
        )}
        style={placement === 'center' || isMobile ? {} : tooltipStyle}
      >
        <div className="bg-gradient-to-br from-[#1a0d2e] to-[#0a0416] border border-violet-400/40 rounded-2xl shadow-2xl shadow-violet-500/20 p-5 relative overflow-hidden">
          {/* Close button */}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-purple-400 hover:text-white hover:bg-violet-500/20 transition-colors"
            aria-label="Saltar tour"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Kenji + title row */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0">
              <SamuraiKenji pose={step.pose} size={64} animated={false} />
            </div>
            <div className="flex-1 pt-1 pr-6">
              <div className="text-[10px] font-mono text-violet-400 tracking-wider mb-1">
                PASO {stepIndex + 1} / {TOUR_STEPS.length}
              </div>
              <h3 className="text-white font-bold text-lg leading-tight">{step.title}</h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-purple-200/90 leading-relaxed mb-4">
            {step.description}
          </p>

          {/* Progress bar */}
          <div className="h-1 bg-violet-950/50 rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((stepIndex + 1) / TOUR_STEPS.length) * 100}%`,
                background: 'linear-gradient(90deg, #C084FC, #84CC16)',
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirst}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-purple-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Atrás
            </button>
            <div className="flex items-center gap-2">
              {!isLast && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-3 py-2 rounded-lg text-xs text-purple-400 hover:text-purple-200 transition-colors"
                >
                  Saltar
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 active:scale-[0.98] transition-all"
              >
                {isLast ? (
                  <>
                    Listo
                    <Check className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Siguiente
                    <ChevronRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
