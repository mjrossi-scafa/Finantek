'use client'

import { useState, useEffect } from 'react'
import { AppTour } from './AppTour'

interface AppTourMountProps {
  userId: string
  shouldRun: boolean
}

export function AppTourMount({ userId, shouldRun }: AppTourMountProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (shouldRun) {
      const t = setTimeout(() => setOpen(true), 400)
      return () => clearTimeout(t)
    }
  }, [shouldRun])

  return <AppTour userId={userId} open={open} onClose={() => setOpen(false)} />
}
