import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from './OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, display_name, currency, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect('/dashboard')
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, icon, type')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .order('sort_order')

  return (
    <OnboardingWizard
      userId={user.id}
      initialEmail={profile?.email ?? user.email ?? ''}
      initialName={profile?.display_name ?? ''}
      initialCurrency={profile?.currency ?? 'CLP'}
      existingCategories={categories ?? []}
    />
  )
}
