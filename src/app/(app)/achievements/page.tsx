import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { Achievement, UserAchievement } from '@/types/database'
import { formatDate } from '@/lib/utils/dates'
import { Star } from 'lucide-react'

const CATEGORY_LABELS: Record<string, string> = {
  tracking: 'Registro',
  saving: 'Ahorro',
  budget: 'Presupuestos',
  receipt: 'Recibos',
  milestone: 'Hitos',
}

export default async function AchievementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [achievementsResult, userAchievementsResult] = await Promise.all([
    supabase.from('achievements').select('*').order('category').order('points'),
    supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', user.id),
  ])

  const allAchievements = (achievementsResult.data ?? []) as Achievement[]
  const userAchievements = (userAchievementsResult.data ?? []) as UserAchievement[]
  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievement_id, ua])
  )

  const totalPoints = userAchievements.reduce(
    (sum, ua) => sum + (ua.achievements?.points ?? 0),
    0
  )

  const grouped: Record<string, Achievement[]> = {}
  for (const a of allAchievements) {
    if (!grouped[a.category]) grouped[a.category] = []
    grouped[a.category].push(a)
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Logros"
        description={`${userAchievements.length}/${allAchievements.length} desbloqueados`}
        action={
          <div className="flex items-center gap-2.5 glass-card rounded-xl px-4 py-2.5">
            <Star className="h-5 w-5 text-yellow-400" />
            <span className="font-extrabold text-lg font-mono text-text-primary">{totalPoints}</span>
            <span className="text-sm text-text-secondary">puntos</span>
          </div>
        }
      />

      {Object.entries(grouped).map(([category, achievements]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.15em]">
            {CATEGORY_LABELS[category] ?? category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((achievement) => {
              const ua = unlockedMap.get(achievement.id)
              const isUnlocked = !!ua

              return (
                <div
                  key={achievement.id}
                  className={`glass-card rounded-2xl p-4 md:p-6 transition-fintech ${
                    isUnlocked
                      ? 'hover:bg-surface-hover border-violet-primary/20'
                      : 'opacity-40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>
                      {isUnlocked ? achievement.icon : '🔒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-text-primary">{achievement.name}</p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-primary/10 text-violet-light shrink-0">
                          {achievement.points} pts
                        </span>
                      </div>
                      <p className="text-xs text-text-tertiary mt-0.5">
                        {achievement.description}
                      </p>
                      {isUnlocked && ua && (
                        <p className="text-xs text-success mt-1.5 font-medium">
                          Desbloqueado el {formatDate(ua.unlocked_at.split('T')[0])}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
