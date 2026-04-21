'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'katana-focus-mode'

export function useFocusMode() {
  const [isHidden, setIsHidden] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') setIsHidden(true)
  }, [])

  const toggle = () => {
    const newValue = !isHidden
    setIsHidden(newValue)
    localStorage.setItem(STORAGE_KEY, String(newValue))
  }

  const maskAmount = (value: string | number): string => {
    if (!mounted || !isHidden) {
      return typeof value === 'number' ? String(value) : value
    }
    return '•••••'
  }

  return { isHidden, toggle, maskAmount, mounted }
}
