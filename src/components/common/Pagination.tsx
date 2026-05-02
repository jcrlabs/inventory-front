import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}

export default function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
      {/* Desktop: rango completo */}
      <p className="hidden sm:block text-sm text-zinc-400">
        Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}
      </p>
      {/* Mobile: compacto */}
      <p className="sm:hidden text-xs text-zinc-500 tabular-nums">
        {page} / {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg text-zinc-400 hover:bg-[var(--bg-hover)] hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
            if (idx > 0 && (arr[idx - 1] as number) + 1 !== p) acc.push('ellipsis')
            acc.push(p)
            return acc
          }, [])
          .map((p, idx) =>
            p === 'ellipsis' ? (
              <span key={`e-${idx}`} className="px-2 text-zinc-500">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p as number)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-amber-600 text-white'
                    : 'text-zinc-300 hover:bg-[var(--bg-hover)] hover:text-zinc-100'
                }`}
              >
                {p}
              </button>
            )
          )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-lg text-zinc-400 hover:bg-[var(--bg-hover)] hover:text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
