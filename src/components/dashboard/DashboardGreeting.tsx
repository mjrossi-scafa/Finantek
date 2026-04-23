import { getChileHour } from '@/lib/utils/timezone'

interface DashboardGreetingProps {
  userName: string
}

export function DashboardGreeting({ userName }: DashboardGreetingProps) {
  const hour = getChileHour()
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  const emoji = hour < 12 ? '🌅' : hour < 20 ? '☀️' : '🌙'

  return (
    <div className="flex items-center gap-2">
      <span className="text-xl leading-none" aria-hidden="true">
        {emoji}
      </span>
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
        {greeting}, {userName}
      </h1>
    </div>
  )
}
