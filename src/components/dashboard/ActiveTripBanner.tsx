import Link from 'next/link'
import { Trip } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { Plane, ChevronRight, MapPin } from 'lucide-react'

interface Props {
  trip: Trip
  spent: number
  count: number
}

export function ActiveTripBanner({ trip, spent, count }: Props) {
  const today = new Date()
  const start = new Date(trip.start_date + 'T12:00:00')
  const end = new Date(trip.end_date + 'T12:00:00')
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  const daysPassed = today < start ? 0 : today > end ? totalDays : Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const avgPerDay = daysPassed > 0 ? Math.round(spent / daysPassed) : 0
  const projection = Math.round(avgPerDay * totalDays)
  const budgetPct = trip.budget && trip.budget > 0 ? Math.round((spent / trip.budget) * 100) : null

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="block relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-violet-500/15 via-indigo-500/10 to-purple-500/5 border border-violet-500/30 hover:border-violet-500/50 transition-all group"
    >
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-bamboo-take/20 border border-bamboo-take/40 text-bamboo-take text-[10px] font-semibold">
        <div className="w-1 h-1 rounded-full bg-bamboo-take animate-pulse" />
        ACTIVO
      </div>

      <div className="flex items-start gap-3 mb-4 pr-20">
        <div className="text-4xl">{trip.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Plane className="h-3.5 w-3.5 text-violet-light" />
            <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-light">Viaje en curso</p>
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
          <p className="text-[9px] text-text-muted uppercase">Día</p>
          <p className="text-sm font-bold font-mono text-violet-light mt-0.5">{daysPassed}/{totalDays}</p>
        </div>
        <div className="bg-surface/40 rounded-lg p-2">
          <p className="text-[9px] text-text-muted uppercase">Promedio</p>
          <p className="text-sm font-bold font-mono text-text-primary mt-0.5">{formatCLP(avgPerDay)}</p>
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
        <span className="text-text-muted">{count} transacciones · Proyección: {formatCLP(projection)}</span>
        <span className="text-violet-light flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
          Ver detalle <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  )
}
