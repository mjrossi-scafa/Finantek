import Link from 'next/link'
import { Trip } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { getChileToday } from '@/lib/utils/timezone'
import { Plane, ChevronRight, MapPin } from 'lucide-react'

interface Props {
  trip: Trip
  spent: number
  count: number
}

export function ActiveTripBanner({ trip, spent, count }: Props) {
  const todayStr = getChileToday()
  const status: 'upcoming' | 'inProgress' | 'past' =
    todayStr < trip.start_date ? 'upcoming' :
    todayStr > trip.end_date ? 'past' :
    'inProgress'

  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const [sy, sm, sd] = trip.start_date.split('-').map(Number)
  const [ey, em, ed] = trip.end_date.split('-').map(Number)
  const [ty, tm, td] = todayStr.split('-').map(Number)
  const startMs = Date.UTC(sy, sm - 1, sd)
  const endMs = Date.UTC(ey, em - 1, ed)
  const todayMs = Date.UTC(ty, tm - 1, td)

  const totalDays = Math.max(1, Math.round((endMs - startMs) / MS_PER_DAY) + 1)
  const daysPassed =
    status === 'upcoming' ? 0 :
    status === 'past' ? totalDays :
    Math.round((todayMs - startMs) / MS_PER_DAY) + 1
  const daysUntilStart = status === 'upcoming' ? Math.round((startMs - todayMs) / MS_PER_DAY) : 0

  const avgPerDay = daysPassed > 0 ? Math.round(spent / daysPassed) : 0
  const projection = status === 'upcoming' ? (trip.budget ?? 0) : Math.round(avgPerDay * totalDays)
  const budgetPct = trip.budget && trip.budget > 0 ? Math.round((spent / trip.budget) * 100) : null

  const statusLabel =
    status === 'upcoming' ? 'PRÓXIMO' :
    status === 'past' ? 'FINALIZADO' :
    'ACTIVO'
  const statusHeadline =
    status === 'upcoming' ? 'Viaje próximo' :
    status === 'past' ? 'Viaje finalizado' :
    'Viaje en curso'
  const statusColors =
    status === 'upcoming' ? 'bg-violet-500/20 border-violet-400/40 text-violet-300' :
    status === 'past' ? 'bg-surface-hover/60 border-surface-border text-text-muted' :
    'bg-bamboo-take/20 border-bamboo-take/40 text-bamboo-take'

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-violet-500/15 via-indigo-500/10 to-purple-500/5 border border-violet-500/30 hover:border-violet-500/50 transition-all group"
    >
      <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusColors}`}>
        {status === 'inProgress' && <div className="w-1 h-1 rounded-full bg-bamboo-take animate-pulse" />}
        {statusLabel}
      </div>

      <div className="flex items-start gap-3 mb-4 pr-20">
        <div className="text-4xl">{trip.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Plane className="h-3.5 w-3.5 text-violet-light" />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-light">{statusHeadline}</p>
          </div>
          <h3 className="text-lg font-bold text-text-primary mt-0.5 truncate">{trip.name}</h3>
          {trip.destination && (
            <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {trip.destination}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-surface/40 rounded-lg p-2">
          <p className="text-[9px] text-text-muted uppercase">Gastado</p>
          <p className="text-sm font-bold font-mono text-text-primary mt-0.5">{formatCLP(spent)}</p>
        </div>
        <div className="bg-surface/40 rounded-lg p-2">
          <p className="text-[9px] text-text-muted uppercase">
            {status === 'upcoming' ? 'Empieza en' : status === 'past' ? 'Duración' : 'Día'}
          </p>
          <p className="text-sm font-bold font-mono text-violet-light mt-0.5">
            {status === 'upcoming'
              ? (daysUntilStart === 0 ? 'Hoy' : daysUntilStart === 1 ? '1 día' : `${daysUntilStart} días`)
              : `${daysPassed}/${totalDays}`}
          </p>
        </div>
        <div className="bg-surface/40 rounded-lg p-2">
          <p className="text-[9px] text-text-muted uppercase">
            {status === 'upcoming' ? 'Presupuesto/día' : 'Promedio'}
          </p>
          <p className="text-sm font-bold font-mono text-text-primary mt-0.5">
            {status === 'upcoming'
              ? formatCLP(trip.budget ? Math.round(trip.budget / totalDays) : 0)
              : formatCLP(avgPerDay)}
          </p>
        </div>
      </div>

      {budgetPct !== null && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-text-muted">Presupuesto: {formatCLP(trip.budget!)}</span>
            <span className={`font-mono font-semibold ${
              budgetPct >= 100 ? 'text-vermillion-shu' :
              budgetPct >= 80 ? 'text-yellow-400' :
              'text-bamboo-take'
            }`}>
              {budgetPct}%
            </span>
          </div>
          <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                budgetPct >= 100 ? 'bg-vermillion-shu' :
                budgetPct >= 80 ? 'bg-yellow-500' :
                'bg-gradient-to-r from-bamboo-take to-green-500'
              }`}
              style={{ width: `${Math.min(budgetPct, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-surface-border/40 text-xs">
        <span className="text-text-muted">
          {status === 'upcoming'
            ? `Presupuesto total: ${formatCLP(trip.budget ?? 0)}`
            : `${count} transacciones · Proyección: ${formatCLP(projection)}`}
        </span>
        <span className="text-violet-light flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
          Ver detalle <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}
