interface SkeletonProps {
  className?: string
}

function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-zinc-700/50 rounded-lg ${className}`} />
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

export function ProductDetailSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back link + title */}
      <div className="mb-5 sm:mb-6">
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-4">
          <div className="bg-zinc-800 rounded-2xl border border-zinc-700/80 p-5">
            <Skeleton className="h-4 w-20 mb-3" />
            <Skeleton className="aspect-square w-full rounded-xl" />
          </div>
          <div className="bg-zinc-800 rounded-2xl border border-zinc-700/80 p-5 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-800 rounded-2xl border border-zinc-700/80 p-5">
            <Skeleton className="h-4 w-36 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-8 w-28" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-24 mt-1" />
              </div>
            </div>
          </div>
          <div className="bg-zinc-800 rounded-2xl border border-zinc-700/80 p-5 space-y-2">
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="bg-zinc-800 rounded-2xl border border-zinc-700/80 p-5 space-y-3">
            <Skeleton className="h-4 w-28 mb-1" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Skeleton
