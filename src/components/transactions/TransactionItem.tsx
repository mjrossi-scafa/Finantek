'use client'

import { useState, useRef, memo } from 'react'
import { Transaction, Category } from '@/types/database'
import { formatCLP } from '@/lib/utils/currency'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit2, Trash2, Clock, Check, X, Copy, Sparkles } from 'lucide-react'

interface TransactionItemProps {
  transaction: Transaction & { categories?: Category }
  isSelected: boolean
  isDeleting: boolean
  selectionMode: boolean
  isRecent?: boolean
  onToggleSelection: () => void
  onEdit: () => void
  onDelete: () => void
  onStartDelete: () => void
  onCancelDelete: () => void
  onDuplicate?: () => void
  onLongPress: () => void
}

export const TransactionItem = memo(function TransactionItem({
  transaction,
  isSelected,
  isDeleting,
  selectionMode,
  isRecent = false,
  onToggleSelection,
  onEdit,
  onDelete,
  onStartDelete,
  onCancelDelete,
  onDuplicate,
  onLongPress
}: TransactionItemProps) {
  const [swipeX, setSwipeX] = useState(0)
  const touchStart = useRef(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      onLongPress()
    }, 500)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Clear long press if user moves
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    const currentX = e.touches[0].clientX
    const deltaX = currentX - touchStart.current
    setSwipeX(Math.max(-100, Math.min(100, deltaX)))
  }

  const handleTouchEnd = () => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    if (swipeX < -80) {
      // Swipe left - delete
      onStartDelete()
    } else if (swipeX > 80) {
      // Swipe right - edit
      onEdit()
    }

    setSwipeX(0)
  }

  const handleClick = () => {
    if (selectionMode) {
      onToggleSelection()
    } else if (!isDeleting) {
      onEdit()
    }
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl glass-card transition-all group ${
        selectionMode ? 'cursor-pointer' : 'cursor-pointer'
      } ${
        isSelected ? 'bg-purple-900/20 border border-purple-500/40' : 'hover:bg-surface-hover'
      }`}
      style={{ transform: `translateX(${swipeX}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {/* Swipe action backgrounds */}
      {Math.abs(swipeX) > 20 && (
        <>
          {/* Delete background (left swipe) */}
          {swipeX < 0 && (
            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-end pr-6">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>
          )}
          {/* Edit background (right swipe) */}
          {swipeX > 0 && (
            <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-start pl-6">
              <Edit2 className="h-5 w-5 text-purple-400" />
            </div>
          )}
        </>
      )}

      {/* Transaction content */}
      <div className="flex items-center gap-4 p-3 relative z-10 bg-surface-card">
        {/* Checkbox (when in selection mode) */}
        {selectionMode && (
          <div className="shrink-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelection}
              onClick={(e) => e.stopPropagation()}
              className="border-purple-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
          </div>
        )}

        {/* Icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 transition-all group-hover:scale-105"
          style={{ backgroundColor: (transaction.categories?.color ?? '#8B5CF6') + '20' }}
        >
          {transaction.categories?.icon ?? '💸'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isDeleting ? (
            // Inline delete confirmation
            <div className="flex items-center gap-3 animate-in slide-in-from-left duration-200">
              <span className="text-sm text-text-primary">¿Eliminar?</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-xs"
              >
                <Check className="h-3 w-3" />
                Sí
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCancelDelete()
                }}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors text-xs"
              >
                <X className="h-3 w-3" />
                No
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-text-primary truncate">
                  {transaction.description || transaction.categories?.name || 'Sin descripción'}
                </p>
                {isRecent && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-violet-300 border border-violet-500/30 shrink-0">
                    <Sparkles className="h-2.5 w-2.5" />
                    Nuevo
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-tertiary">{transaction.categories?.name}</span>
                {transaction.source !== 'manual' && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-violet-primary/10 text-violet-light">
                    {transaction.source === 'receipt' ? '📸 Recibo' : '📄 PDF'}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {!isDeleting && (
          <>
            {/* Time - hidden on mobile */}
            <div className="text-xs text-text-tertiary flex items-center gap-1 hidden md:flex">
              <Clock className="h-3 w-3" />
              <span>{new Date(transaction.created_at).toLocaleTimeString('es', {
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>

            {/* Amount & Actions */}
            <div className="flex items-center gap-3">
              <span
                className={`font-bold text-sm font-mono tabular-nums ${
                  transaction.type === 'income' ? 'text-success' : 'text-danger'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}{formatCLP(transaction.amount)}
              </span>

              {/* Actions (visible on hover, hidden in selection mode) */}
              {!selectionMode && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onDuplicate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDuplicate()
                      }}
                      className="p-1.5 rounded-lg text-text-tertiary hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                      title="Duplicar con fecha de hoy"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                    className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-primary transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onStartDelete()
                    }}
                    className="p-1.5 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
})