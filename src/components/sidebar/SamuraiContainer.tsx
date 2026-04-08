'use client'
import { SamuraiWidget } from './SamuraiWidget'

export function SamuraiContainer() {
  return (
    <div className="hidden lg:block">
      <SamuraiWidget />

      {/* Footer duplicado eliminado - solo aparece en SamuraiWidget */}
    </div>
  )
}