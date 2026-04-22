import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * Delete user account and all associated data.
 * Deletes the profile (cascades to user data) and the auth.users record
 * so the email can be reused.
 */
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Delete profile → cascades to all user data via RLS/foreign keys
  const { error: profileError } = await supabase.from('profiles').delete().eq('id', user.id)
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // Delete auth.users record using service role (admin privileges)
  const serviceClient = await createServiceClient()
  const { error: authError } = await serviceClient.auth.admin.deleteUser(user.id)
  if (authError) {
    return NextResponse.json(
      { error: `Perfil borrado pero auth falló: ${authError.message}` },
      { status: 500 }
    )
  }

  // Sign out
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
