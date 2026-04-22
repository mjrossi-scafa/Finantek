import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/shared/PageHeader'
import { InsightsClient } from './InsightsClient'
import { WeeklyInsight } from '@/types/database'
import { Sparkles } from 'lucide-react'

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: insights } = await supabase
    .from('weekly_insights')
    .select('*')
    .eq('user_id', user.id)
    .order('week_start', { ascending: false })
    .limit(24)

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        icon={<Sparkles className="h-7 w-7 text-violet-light" />}
        title="Insights IA"
        description="Análisis semanal de tus hábitos financieros con Gemini"
      />
      <InsightsClient insights={(insights ?? []) as WeeklyInsight[]} />
    </div>
  )
}
