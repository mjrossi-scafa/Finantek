import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Delete user account and all associated data.
 * Note: this requires the service_role to delete the auth user.
 * For now, this deletes the profile (which cascades to all user data)
 * and signs the user out. The actual auth record remains (edge case).
 */
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Delete profile → cascades to all user data via RLS/foreign keys
  const { error } = await supabase.from('profiles').delete().eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Sign out
  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
