'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trip } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { formatCLP } from '@/lib/utils/currency'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Plus, MapPin, Calendar as CalIcon, DollarSign, Power,
  ChevronRight, Sparkles, Plane,
} from 'lucide-react'
import { GradientButton } from '@/components/shared/GradientButton'
import { TripFormModal } from '@/components/trips/TripFormModal'

interface TripsClientProps {
  initialTrips: Trip[]
  tripSpending: Record<string, { total: number; count: number }>
  userId: string
}

export function TripsClient({ initialTrips, tripSpending, userId }: TripsClientProps) {
  const supabase = createClient()
  const router = useRouter()
  const [trips, setTrips] = useState(initialTrips)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | undefined>()

  const today = new Date().toISOString().split('T')[0]

  const activeTrip = trips.find((t) => t.is_active)
  const upcomingTrips = trips.filter((t) => !t.is_active && t.start_date > today)
  const pastTrips = trips.filter((t) => !t.is_active && t.end_date < today)

  async function toggleActive(trip: Trip) {
    const newActive = !trip.is_active
    const { error } = await supabase
      .from('trips')
      .update({ is_active: newActive })
      .eq('id', trip.id)

    if (error) {
      toast.error('Error al cambiar estado')
      return
    }

    setTrips((prev) =>
      prev.map((t) => ({
        ...t,
        is_active: t.id === trip.id ? newActive : (newActive ? false : t.is_active),
      }))
    )
    toast.success(newActive ? `✈️ Viaje '${trip.name}' activado` : 'Viaje desactivado')
    router.refresh()
  }

  function handleCreate() {
    setEditingTrip(undefined)
    setFormOpen(true)
  }

  function handleEdit(trip: Trip) {
    setEditingTrip(trip)
    setFormOpen(true)
  }

  function handleSuccess(trip: Trip) {
    if (editingTrip) {
      setTrips((prev) => prev.map((t) => (t.id === trip.id ? trip : t)))
    } else {
      setTrips((prev) => [trip, ...prev])
    }
    setFormOpen(false)
    setEditingTrip(undefined)
    router.refresh()
  }

  if (trips.length === 0) {
    return (
      <>
        <div className="glass-card rounded-2xl p-12 text-center border-2 border-dashed border-violet-500/20">
          <div className="text-5xl mb-4">✈️</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">¿Te vas de viaje?</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Crea un viaje para registrar gastos en moneda extranjera. Katana convertirá automáticamente todos los montos a CLP.
          </p>
          <GradientButton onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Crear mi primer viaje
          </GradientButton>
        </div>

        <TripFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSuccess={handleSuccess}
          userId={userId}
          editing={editingTrip}
        />
      </>
    )
  }

  return (
    <>
      <div className="flex justify-end">
        <GradientButton onClick={handleCreate} className="rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo viaje
        </GradientButton>
      </div>

      {/* Active trip - hero */}
      {activeTrip && (
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-violet-500/20 via-indigo-500/10 to-purple-500/10 border-2 border-violet-500/40">
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bamboo-take/20 border border-bamboo-take/40 text-bamboo-take text-xs font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-bamboo-take animate-pulse" />
              En curso
            </span>
          </div>

          <div className="flex items-start gap-4 mb-5">
            <div className="text-5xl">{activeTrip.emoji}</div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-text-primary">{activeTrip.name}</h2>
              {activeTrip.destination && (
                <p className="text-text-secondary flex items-center gap-1.5 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {activeTrip.destination}
                </p>
              )}
            </div>
          </div>

          <ActiveTripStats
            trip={activeTrip}
            spending={tripSpending[activeTrip.id]}
          />

          <div className="flex items-center justify-between mt-5 pt-5 border-t border-surface-border/50">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <CalIcon className="h-3.5 w-3.5" />
              <span>
                {new Date(activeTrip.start_date + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                {' → '}
                {new Date(activeTrip.end_date + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(activeTrip)}
                className="text-xs text-text-secondary hover:text-violet-light transition-colors"
              >
                Editar
              </button>
              <span className="text-text-muted">·</span>
              <Link
                href={`/trips/${activeTrip.id}`}
                className="text-xs text-violet-light hover:text-violet-primary flex items-center gap-1"
              >
                Ver detalle <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcomingTrips.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.15em]">Próximos viajes</h3>
          <div className="space-y-2">
            {upcomingTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                spending={tripSpending[trip.id]}
                onActivate={() => toggleActive(trip)}
                onEdit={() => handleEdit(trip)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {pastTrips.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.15em]">Viajes pasados</h3>
          <div className="space-y-2">
            {pastTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                spending={tripSpending[trip.id]}
                onActivate={() => toggleActive(trip)}
                onEdit={() => handleEdit(trip)}
                isPast
              />
            ))}
          </div>
        </div>
      )}

      <TripFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingTrip(undefined)
        }}
        onSuccess={handleSuccess}
        userId={userId}
        editing={editingTrip}
      />
    </>
  )
}

function ActiveTripStats({
  trip,
  spending,
}: {
  trip: Trip
  spending?: { total: number; count: number }
}) {
  const total = spending?.total ?? 0
  const count = spending?.count ?? 0

  // Days progress
  const today = new Date()
  const start = new Date(trip.start_date + 'T12:00:00')
  const end = new Date(trip.end_date + 'T12:00:00')
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  const daysPassed = Math.max(0, Math.min(totalDays, Math.round((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1))
  const avgPerDay = daysPassed > 0 ? Math.round(total / daysPassed) : 0

  // Budget progress
  const budgetPct = trip.budget ? Math.round((total / trip.budget) * 100) : 0

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface/50 rounded-xl p-3">
          <p className="text-[10px] text-text-muted uppercase tracking-wide">Gastado</p>
          <p className="text-lg font-bold font-mono text-text-primary mt-1">{formatCLP(total)}</p>
          <p className="text-[10px] text-text-muted mt-0.5">{count} transacciones</p>
        </div>

        <div className="bg-surface/50 rounded-xl p-3">
          <p className="text-[10px] text-text-muted uppercase tracking-wide">Día</p>
          <p className="text-lg font-bold font-mono text-violet-light mt-1">
            {daysPassed}<span className="text-sm text-text-muted">/{totalDays}</span>
          </p>
          <p className="text-[10px] text-text-muted mt-0.5">días del viaje</p>
        </div>

        <div className="bg-surface/50 rounded-xl p-3">
          <p className="text-[10px] text-text-muted uppercase tracking-wide">Promedio/día</p>
          <p className="text-lg font-bold font-mono text-text-primary mt-1">{formatCLP(avgPerDay)}</p>
          <p className="text-[10px] text-text-muted mt-0.5">diario</p>
        </div>

        <div className="bg-surface/50 rounded-xl p-3">
          <p className="text-[10px] text-text-muted uppercase tracking-wide">Moneda</p>
          <p className="text-lg font-bold font-mono text-text-primary mt-1">{trip.currency}</p>
          <p className="text-[10px] text-text-muted mt-0.5">1 = {Number(trip.exchange_rate).toFixed(2)} CLP</p>
        </div>
      </div>

      {/* Budget progress */}
      {trip.budget && trip.budget > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-text-muted">Presupuesto: {formatCLP(trip.budget)}</span>
            <span className={`font-mono font-semibold ${
              budgetPct >= 100 ? 'text-vermillion-shu' :
              budgetPct >= 80 ? 'text-yellow-400' :
              'text-bamboo-take'
            }`}>
              {budgetPct}%
            </span>
          </div>
          <div className="h-2 bg-surface-border rounded-full overflow-hidden">
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
    </>
  )
}

function TripCard({
  trip,
  spending,
  onActivate,
  onEdit,
  isPast = false,
}: {
  trip: Trip
  spending?: { total: number; count: number }
  onActivate: () => void
  onEdit: () => void
  isPast?: boolean
}) {
  return (
    <div className={`glass-card rounded-2xl p-4 transition-all hover:border-violet-500/30 group ${isPast ? 'opacity-80' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="text-3xl">{trip.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm text-text-primary truncate">{trip.name}</p>
            {trip.destination && (
              <span className="text-xs text-text-muted flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {trip.destination}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
            <span>{new Date(trip.start_date + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}</span>
            <span>→</span>
            <span>{new Date(trip.end_date + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>·</span>
            <span>{trip.currency}</span>
          </div>
        </div>

        <div className="text-right">
          <p className="font-mono font-bold text-sm text-text-primary">{formatCLP(spending?.total ?? 0)}</p>
          <p className="text-[10px] text-text-muted">{spending?.count ?? 0} transacciones</p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isPast && (
            <button
              onClick={onActivate}
              className="p-1.5 rounded-lg text-text-muted hover:text-bamboo-take hover:bg-bamboo-take/10 transition-colors"
              title="Activar viaje"
            >
              <Power className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-text-muted hover:text-violet-light hover:bg-violet-500/10 transition-colors"
            title="Editar"
          >
            <CalIcon className="h-3.5 w-3.5" />
          </button>
          <Link
            href={`/trips/${trip.id}`}
            className="p-1.5 rounded-lg text-text-muted hover:text-violet-light hover:bg-violet-500/10 transition-colors"
            title="Ver detalle"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
