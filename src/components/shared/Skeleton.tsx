import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-surface-border via-surface-hover to-surface-border bg-[length:200%_100%]',
        className
      )}
      style={{ animation: 'shimmer 2s infinite linear' }}
    />
  )
}

/**
 * Common skeleton variants for quick use
 */

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('glass-card rounded-2xl p-5 space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-2 w-full" />
    </div>
  )
}

export function SkeletonListItem({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl bg-surface-secondary', className)}>
      <Skeleton className="w-9 h-9 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-2 w-1/3" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-3`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-xl p-4 space-y-2">
          <Skeleton className="h-2 w-1/2" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-2 w-1/3" />
        </div>
      ))}
    </div>
  )
}
