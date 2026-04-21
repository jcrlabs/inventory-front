interface SkeletonProps {
  className?: string
}

function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-zinc-800 rounded-2xl border border-zinc-700/70 overflow-hidden shadow-none">
      <Skeleton className="aspect-video rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-7 w-16" />
        </div>
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-zinc-800 rounded-2xl border border-zinc-700/70 shadow-none p-5">
      <Skeleton className="h-10 w-10 rounded-xl mb-4" />
      <Skeleton className="h-8 w-24 mb-1.5" />
      <Skeleton className="h-4 w-32" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }, (_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export default Skeleton
