import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { InsightsClient } from './InsightsClient'
import { WeeklyInsight } from '@/types/database'

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: insights } = await supabase
    .from('weekly_insights')
    .select('*')
    .eq('user_id', user.id)
    .order('week_start', { ascending: false })
    .limit(12)

  return (
    <div className="space-y-6 p-6">
      <InsightsClient insights={(insights ?? []) as WeeklyInsight[]} />
    </div>
  )
}
