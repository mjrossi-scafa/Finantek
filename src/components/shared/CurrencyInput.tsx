'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { formatCLP, parseCLP } from '@/lib/utils/currency'

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  disabled?: boolean
  id?: string
}

export function CurrencyInput({ value, onChange, placeholder = '$0', disabled, id }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')

  useEffect(() => {
    if (value > 0) {
      setDisplayValue(formatCLP(value))
    } else {
      setDisplayValue('')
    }
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const numeric = parseCLP(raw)
    setDisplayValue(raw)
    onChange(numeric)
  }

  function handleBlur() {
    if (value > 0) {
      setDisplayValue(formatCLP(value))
    } else {
      setDisplayValue('')
    }
  }

  function handleFocus() {
    if (value > 0) {
      setDisplayValue(value.toString())
    }
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
      className="font-mono bg-surface border-surface-border text-text-primary placeholder:text-text-tertiary rounded-xl focus:border-violet-primary focus:ring-violet-primary/20"
    />
  )
}
