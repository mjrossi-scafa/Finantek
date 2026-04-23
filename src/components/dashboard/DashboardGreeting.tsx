import { getChileHour } from '@/lib/utils/timezone'

interface DashboardGreetingProps {
  userName: string
}

export function DashboardGreeting({ userName }: DashboardGreetingProps) {
  const hour = getChileHour()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  const emoji = hour < 12 ? '🌅' : hour < 20 ? '☀️' : '🌙'

  return (
    // Left padding in mobile to clear the fixed hamburger button (top-3 left-3, 40px wide).
    <div className="flex items-center gap-2 pl-12 md:pl-0">
      <span className="text-xl leading-none" aria-hidden="true">
        {emoji}
      </span>
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
        {greeting}, {userName}
      </h1>
    </div>
  )
}
