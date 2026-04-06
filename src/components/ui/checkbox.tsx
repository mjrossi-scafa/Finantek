"use client"

import * as React from "react"
import { Check } from "lucide-react"

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  className = "",
  onClick,
}: CheckboxProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e)
    }
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={`
        h-4 w-4 rounded border-2 flex items-center justify-center
        transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${
          checked
            ? 'bg-purple-600 border-purple-600 text-white'
            : 'border-gray-300 hover:border-gray-400 bg-transparent'
        }
        ${className}
      `}
    >
      {checked && <Check className="h-3 w-3" />}
    </button>
  )
}