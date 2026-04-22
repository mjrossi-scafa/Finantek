'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'katana-focus-mode'

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getSnapshot(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

function getServerSnapshot(): boolean {
  return false
}

export function useFocusMode() {
  const isHidden = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggle = () => {
    const newValue = !isHidden
    localStorage.setItem(STORAGE_KEY, String(newValue))
    // Trigger storage event for same-tab updates
    window.dispatchEvent(new Event('storage'))
  }

  const maskAmount = (value: string | number): string => {
    if (!mounted || !isHidden) {
      return typeof value === 'number' ? String(value) : value
    }
    return '•••••'
  }

  return { isHidden: mounted ? isHidden : false, toggle, maskAmount, mounted }
}
