import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('[auth/callback] received request', {
    url: request.url,
    hasCode: !!code,
    next,
  })

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[auth/callback] exchange failed:', error.message, error.status)
      const url = new URL('/login', origin)
      url.searchParams.set('error', 'oauth_failed')
      url.searchParams.set('reason', error.message.slice(0, 80))
      return NextResponse.redirect(url)
    }
    console.log('[auth/callback] exchange success, user:', data.user?.email)
    return NextResponse.redirect(new URL(next, origin))
  }

  console.warn('[auth/callback] no code in query')
  const url = new URL('/login', origin)
  url.searchParams.set('error', 'no_code')
  return NextResponse.redirect(url)
}
