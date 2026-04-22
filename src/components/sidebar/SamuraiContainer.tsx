'use client'
import { SamuraiWidget } from './SamuraiWidget'
import type { KatanaState } from '@/app/(app)/layout'

interface Props {
  katanaState?: KatanaState
}

export function SamuraiContainer({ katanaState = 'violet' }: Props) {
  return (
    <div className="hidden lg:block">
      <SamuraiWidget katanaState={katanaState} />
    </div>
  )
}