'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { formatCLP, parseCLP } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
}

export function CurrencyInput({ value, onChange, placeholder = '$0', disabled, id, className }: CurrencyInputProps) {
  // Derive display value from props instead of useEffect
  const [focused, setFocused] = useState(false)
  const [rawInput, setRawInput] = useState('')

  // Compute display based on focus state and value
  const displayValue = focused
    ? rawInput
    : value > 0
      ? formatCLP(value)
      : ''

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setRawInput(raw)
    const numeric = parseCLP(raw)
    onChange(numeric)
  }

  function handleBlur() {
    setFocused(false)
  }

  function handleFocus() {
    setFocused(true)
    setRawInput(value > 0 ? value.toString() : '')
  }

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "font-mono bg-surface border-surface-border text-text-primary placeholder:text-text-tertiary rounded-xl focus:border-violet-primary focus:ring-violet-primary/20",
        className
      )}
    />
  )
}
