import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { SettingsClient } from './SettingsClient'
import { Category, Profile } from '@/types/database'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileResult, categoriesResult] = await Promise.all([
    supabase.from('profiles').select('*, telegram_link_code, telegram_link_expires_at').eq('id', user.id).single(),
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('type')
      .order('sort_order'),
  ])

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <PageHeader title="Configuración" />
      <SettingsClient
        profile={profileResult.data as Profile | null}
        categories={(categoriesResult.data ?? []) as Category[]}
        userId={user.id}
      />
    </div>
  )
}
