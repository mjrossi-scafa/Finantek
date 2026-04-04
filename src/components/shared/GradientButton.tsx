'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface GradientButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullWidth?: boolean
}

export function GradientButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className,
  fullWidth = false,
}: GradientButtonProps) {
  const variants = {
    primary: 'gradient-indigo text-white hover:glow-indigo-strong shadow-lg',
    success: 'gradient-bamboo text-white hover:glow-bamboo shadow-lg',
    outline: 'glass-card border border-indigo-ai/30 text-indigo-light hover:bg-indigo-ai/8 hover:border-indigo-ai/50',
  }

  const sizes = {
    sm: 'px-4 py-2.5 text-xs tracking-zen',
    md: 'px-6 py-3 text-sm tracking-zen',
    lg: 'px-8 py-4 text-base tracking-zen',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'rounded-full font-weight-semibold transition-wa inline-flex items-center justify-center gap-2.5',
        'disabled:opacity-40 disabled:pointer-events-none disabled:grayscale',
        'active:scale-[0.96] active:transition-wa-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-ai/50',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
