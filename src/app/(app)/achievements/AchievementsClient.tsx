'use client'

import { useState, useMemo, useEffect } from 'react'
import { Achievement, UserAchievement } from '@/types/database'
import { AchievementContext, calculateProgress } from '@/lib/utils/achievements'
import { formatDate } from '@/lib/utils/dates'
import { formatCLP } from '@/lib/utils/currency'
import {
  Trophy, Star, Lock, Search, Filter, SortAsc,
  Sparkles, Target, TrendingUp, Award, Zap,
} from 'lucide-react'
import { Confetti } from '@/components/shared/Confetti'
import { playAchievementUnlock } from '@/lib/utils/haptic'

interface Props {
  achievements: Achievement[]
  userAchievements: UserAchievement[]
  ctx: AchievementContext
}

type FilterStatus = 'all' | 'unlocked' | 'locked'
type FilterCategory = 'all' | 'tracking' | 'saving' | 'budget' | 'receipt' | 'milestone' | 'planner' | 'insights' | 'telegram' | 'secret'
type SortBy = 'category' | 'progress' | 'points' | 'recent'

const CATEGORY_LABELS: Record<string, string> = {
  tracking: 'Registro',
  saving: 'Ahorro',
  budget: 'Presupuestos',
  receipt: 'Recibos',
  milestone: 'Hitos',
  planner: 'Planificador',
  insights: 'Insights',
  telegram: 'Telegram',
  secret: 'Secretos',
}

const CATEGORY_ICONS: Record<string, string> = {
  tracking: '📝',
  saving: '💰',
  budget: '🎯',
  receipt: '📸',
  milestone: '🏆',
  planner: '📅',
  insights: '🧠',
  telegram: '📱',
  secret: '🔓',
}

// Tiers based on total points
function getTier(points: number): { name: string; color: string; emoji: string; next: number | null } {
  if (points >= 2000) return { name: 'Diamante', color: 'text-cyan-300', emoji: '💎', next: null }
  if (points >= 1000) return { name: 'Platino', color: 'text-violet-300', emoji: '🏆', next: 2000 }
  if (points >= 500) return { name: 'Oro', color: 'text-yellow-400', emoji: '🥇', next: 1000 }
  if (points >= 200) return { name: 'Plata', color: 'text-gray-300', emoji: '🥈', next: 500 }
  if (points >= 50) return { name: 'Bronce', color: 'text-orange-400', emoji: '🥉', next: 200 }
  return { name: 'Novato', color: 'text-text-muted', emoji: '⚔️', next: 50 }
}

export function AchievementsClient({ achievements, userAchievements, ctx }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
  const [sortBy, setSortBy] = useState<SortBy>('category')
  const [confettiTrigger, setConfettiTrigger] = useState<number | null>(null)

  // Trigger confetti + sound when a new achievement is unlocked (within last 5 seconds)
  useEffect(() => {
    const recent = userAchievements.filter((ua) => {
      if (!ua.unlocked_at) return false
      const unlockedMs = new Date(ua.unlocked_at).getTime()
      return Date.now() - unlockedMs < 5000
    })
    if (recent.length > 0) {
      setConfettiTrigger(Date.now())
      playAchievementUnlock() // Sound + haptic
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const unlockedMap = useMemo(() => {
    return new Map(userAchievements.map((ua) => [ua.achievement_id, ua]))
  }, [userAchievements])

  const totalPoints = userAchievements.reduce(
    (sum, ua) => sum + (ua.achievements?.points ?? 0),
    0
  )

  const tier = getTier(totalPoints)

  // Find next achievement closest to unlock
  const nextToUnlock = useMemo(() => {
    const candidates = achievements
      .filter((a) => !unlockedMap.has(a.id) && !a.is_secret)
      .map((a) => {
        const progress = calculateProgress(a, ctx)
        return { achievement: a, progress }
      })
      .filter((x) => x.progress !== null && x.progress!.pct > 0 && x.progress!.pct < 100)
      .sort((a, b) => (b.progress?.pct ?? 0) - (a.progress?.pct ?? 0))

    return candidates[0]
  }, [achievements, unlockedMap, ctx])

  // Stats
  const unlockedCount = userAchievements.length
  const totalCount = achievements.length
  const completionPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  // Filter & sort achievements
  const filteredAchievements = useMemo(() => {
    let list = [...achievements]

    // Filter by status
    if (filterStatus === 'unlocked') {
      list = list.filter((a) => unlockedMap.has(a.id))
    } else if (filterStatus === 'locked') {
      list = list.filter((a) => !unlockedMap.has(a.id))
    }

    // Filter by category
    if (filterCategory !== 'all') {
      list = list.filter((a) => a.category === filterCategory)
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter((a) => {
        // Don't reveal secrets in search
        if (a.is_secret && !unlockedMap.has(a.id)) return false
        return (
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
        )
      })
    }

    // Sort
    list.sort((a, b) => {
      const aUnlocked = unlockedMap.has(a.id)
      const bUnlocked = unlockedMap.has(b.id)

      switch (sortBy) {
        case 'progress': {
          if (aUnlocked && !bUnlocked) return -1
          if (!aUnlocked && bUnlocked) return 1
          if (!aUnlocked && !bUnlocked) {
            const progA = calculateProgress(a, ctx)?.pct ?? 0
            const progB = calculateProgress(b, ctx)?.pct ?? 0
            return progB - progA
          }
          return 0
        }
        case 'points':
          return b.points - a.points
        case 'recent': {
          const uaA = unlockedMap.get(a.id)
          const uaB = unlockedMap.get(b.id)
          if (uaA && uaB) return uaB.unlocked_at.localeCompare(uaA.unlocked_at)
          if (uaA) return -1
          if (uaB) return 1
          return 0
        }
        case 'category':
        default:
          if (a.category !== b.category) return a.category.localeCompare(b.category)
          return a.points - b.points
      }
    })

    return list
  }, [achievements, unlockedMap, filterStatus, filterCategory, searchQuery, sortBy, ctx])

  // Group by category (for display when sorted by category)
  const groupedByCategory = useMemo(() => {
    if (sortBy !== 'category') return null

    const groups = new Map<string, Achievement[]>()
    for (const a of filteredAchievements) {
      if (!groups.has(a.category)) groups.set(a.category, [])
      groups.get(a.category)!.push(a)
    }
    return Array.from(groups.entries())
  }, [filteredAchievements, sortBy])

  // Count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, { total: number; unlocked: number }> = {}
    for (const a of achievements) {
      if (!counts[a.category]) counts[a.category] = { total: 0, unlocked: 0 }
      counts[a.category].total++
      if (unlockedMap.has(a.id)) counts[a.category].unlocked++
    }
    return counts
  }, [achievements, unlockedMap])

  return (
    <div className="space-y-6">
      <Confetti trigger={confettiTrigger} />

      {/* Hero stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier card */}
        <div className="glass-card rounded-2xl p-6 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Nivel actual</p>
              <h2 className="text-3xl font-bold text-text-primary flex items-center gap-2">
                <span className="text-4xl">{tier.emoji}</span>
                <span className={tier.color}>{tier.name}</span>
              </h2>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="text-3xl font-bold font-mono text-text-primary">{totalPoints}</span>
              </div>
              <p className="text-xs text-text-muted mt-1">puntos totales</p>
            </div>
          </div>

          {tier.next && (
            <div className="relative">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="text-text-muted">Siguiente nivel</span>
                <span className="font-mono text-violet-light">
                  {totalPoints} / {tier.next}
                </span>
              </div>
              <div className="h-2 bg-surface-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${(totalPoints / tier.next) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Progress card */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <p className="text-sm font-semibold text-text-primary">Progreso total</p>
          </div>
          <p className="text-3xl font-bold font-mono text-text-primary mb-2">
            {unlockedCount}
            <span className="text-lg text-text-muted">/{totalCount}</span>
          </p>
          <div className="h-2 bg-surface-border rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-bamboo-take to-yellow-400 transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-xs text-text-muted">{completionPct}% completado</p>
        </div>
      </div>

      {/* Next to unlock */}
      {nextToUnlock && nextToUnlock.progress && (
        <div className="glass-card rounded-2xl p-5 border border-violet-500/30 bg-gradient-to-r from-violet-500/5 to-indigo-500/5">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{nextToUnlock.achievement.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-yellow-400" />
                <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wide">
                  Próximo a desbloquear
                </p>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-1">
                {nextToUnlock.achievement.name}
              </h3>
              <p className="text-sm text-text-secondary mb-3">
                {nextToUnlock.achievement.description}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-surface-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${nextToUnlock.progress.pct}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-violet-light font-semibold whitespace-nowrap">
                  {nextToUnlock.progress.pct}%
                </span>
              </div>
              <p className="text-xs text-text-muted mt-2">
                {nextToUnlock.achievement.condition_type === 'total_tracked_amount' ||
                nextToUnlock.achievement.condition_type === 'planned_amount_monthly'
                  ? `${formatCLP(nextToUnlock.progress.current)} de ${formatCLP(nextToUnlock.progress.target)}`
                  : `${nextToUnlock.progress.current} de ${nextToUnlock.progress.target}`}
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-md bg-violet-primary/10 text-violet-light shrink-0">
              {nextToUnlock.achievement.points} pts
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        {/* Search + sort */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Buscar logro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-surface border border-surface-border text-text-primary outline-none focus:border-violet-500/50 text-sm"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2 rounded-xl bg-surface border border-surface-border text-text-primary outline-none focus:border-violet-500/50 text-sm"
          >
            <option value="category">Por categoría</option>
            <option value="progress">Por progreso</option>
            <option value="points">Por puntos</option>
            <option value="recent">Recientes</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-full bg-surface border border-surface-border p-1">
            {[
              { key: 'all', label: 'Todos' },
              { key: 'unlocked', label: `Desbloqueados (${unlockedCount})` },
              { key: 'locked', label: `Bloqueados (${totalCount - unlockedCount})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key as FilterStatus)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  filterStatus === key
                    ? 'bg-violet-500/20 text-violet-light'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCategory('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filterCategory === 'all'
                ? 'bg-violet-500/20 text-violet-light border border-violet-500/40'
                : 'bg-surface border border-surface-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <Filter className="h-3 w-3" />
            Todas
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const counts = categoryCounts[key]
            if (!counts) return null
            return (
              <button
                key={key}
                onClick={() => setFilterCategory(key as FilterCategory)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  filterCategory === key
                    ? 'bg-violet-500/20 text-violet-light border border-violet-500/40'
                    : 'bg-surface border border-surface-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{CATEGORY_ICONS[key]}</span>
                {label}
                <span className="text-text-muted">({counts.unlocked}/{counts.total})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Achievements list */}
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm text-text-muted">No se encontraron logros con esos filtros</p>
        </div>
      ) : groupedByCategory ? (
        <div className="space-y-6">
          {groupedByCategory.map(([category, categoryAchievements]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{CATEGORY_ICONS[category]}</span>
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-[0.15em]">
                  {CATEGORY_LABELS[category] ?? category}
                </h2>
                <div className="flex-1 h-px bg-surface-border/50" />
                <span className="text-xs text-text-muted">
                  {categoryAchievements.filter((a) => unlockedMap.has(a.id)).length}/{categoryAchievements.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    userAchievement={unlockedMap.get(achievement.id)}
                    ctx={ctx}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              userAchievement={unlockedMap.get(achievement.id)}
              ctx={ctx}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AchievementCard({
  achievement,
  userAchievement,
  ctx,
}: {
  achievement: Achievement
  userAchievement?: UserAchievement
  ctx: AchievementContext
}) {
  const isUnlocked = !!userAchievement
  const isSecret = achievement.is_secret && !isUnlocked
  const progress = !isUnlocked ? calculateProgress(achievement, ctx) : null

  return (
    <div
      className={`glass-card rounded-2xl p-4 transition-all hover:scale-[1.02] ${
        isUnlocked
          ? 'border-yellow-500/20 hover:border-yellow-500/40 hover:shadow-lg'
          : 'opacity-70 hover:opacity-100'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`text-3xl flex-shrink-0 ${isUnlocked ? '' : isSecret ? '' : 'grayscale opacity-60'}`}>
          {isSecret ? '🔒' : achievement.icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + points */}
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-sm text-text-primary truncate">
              {isSecret ? '???' : achievement.name}
            </p>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                isUnlocked
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-violet-primary/10 text-violet-light'
              }`}
            >
              {achievement.points} pts
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-text-tertiary mt-0.5 leading-relaxed">
            {isSecret ? 'Logro secreto · Descúbrelo' : achievement.description}
          </p>

          {/* Unlocked date */}
          {isUnlocked && userAchievement && (
            <div className="flex items-center gap-1.5 mt-2">
              <Award className="h-3 w-3 text-yellow-400" />
              <p className="text-[10px] text-yellow-400 font-medium">
                {formatDate(userAchievement.unlocked_at.split('T')[0])}
              </p>
            </div>
          )}

          {/* Progress bar for locked */}
          {progress && !isSecret && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-surface-border rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      progress.pct >= 75
                        ? 'bg-gradient-to-r from-bamboo-take to-yellow-400'
                        : 'bg-gradient-to-r from-violet-500 to-indigo-500'
                    }`}
                    style={{ width: `${progress.pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-text-muted whitespace-nowrap">
                  {progress.pct}%
                </span>
              </div>
              <p className="text-[10px] text-text-muted mt-1">
                {achievement.condition_type === 'total_tracked_amount' ||
                achievement.condition_type === 'planned_amount_monthly'
                  ? `${formatCLP(progress.current)} / ${formatCLP(progress.target)}`
                  : `${progress.current} / ${progress.target}`}
              </p>
            </div>
          )}

          {/* Secret locked state */}
          {isSecret && (
            <div className="flex items-center gap-1.5 mt-2">
              <Lock className="h-3 w-3 text-text-muted" />
              <p className="text-[10px] text-text-muted italic">Cumple una acción especial</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
