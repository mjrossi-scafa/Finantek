import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { SettingsClient } from './SettingsClient'
import { Category, Profile } from '@/types/database'
import { Settings as SettingsIcon } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, categoriesResult, transactionCountResult, achievementsCountResult] = await Promise.all([
    supabase.from('profiles').select('*, telegram_link_code, telegram_link_expires_at').eq('id', user.id).single(),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('type')
      .order('sort_order'),
    supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('user_achievements').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const profile = profileResult.data as Profile | null

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-3xl mx-auto">
      <PageHeader
        icon={<SettingsIcon className="h-7 w-7 text-violet-light" />}
        title="Configuración"
        description="Gestiona tu perfil, preferencias y cuenta"
      />
      <SettingsClient
        profile={profile}
        categories={(categoriesResult.data ?? []) as Category[]}
        userId={user.id}
        transactionCount={transactionCountResult.count ?? 0}
        achievementCount={achievementsCountResult.count ?? 0}
      />
    </div>
  )
}
