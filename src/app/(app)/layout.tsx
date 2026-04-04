import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get total points
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievements(points)')
    .eq('user_id', user.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalPoints = (userAchievements ?? []).reduce((sum: number, ua: any) => {
    const pts = ua.achievements?.points ?? 0
    return sum + pts
  }, 0)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar totalPoints={totalPoints} />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
