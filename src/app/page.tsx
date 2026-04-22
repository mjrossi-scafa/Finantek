import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // If OAuth redirected here with a code, exchange it for a session
  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code)
    if (!error) {
      redirect(params.next || '/dashboard')
    }
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
