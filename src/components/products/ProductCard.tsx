import { useState, useRef, memo } from 'react'
import { Edit, Trash2, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { Product } from '../../types'
import { usePermissions } from '../../hooks/usePermissions'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

const statusConfig = {
  reparado:    { label: 'Reparado',    Icon: CheckCircle2, colorCls: 'text-emerald-400', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)' },
  en_progreso: { label: 'En progreso', Icon: Clock,        colorCls: 'text-amber-400',   bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  no_reparado: { label: 'No reparado', Icon: XCircle,      colorCls: 'text-red-400',     bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)' },
}

const ProductCard = memo(function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const navigate = useNavigate()
  const { canManage, canDeleteProduct } = usePermissions()
  const canDelete = canDeleteProduct(product)

  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const didSwipe = useRef(false)

  const images: string[] = []
  product.images?.forEach((img) => { if (img.image_url) images.push(img.image_url) })
  if (images.length === 0 && product.image_url) images.push(product.image_url)

  const total = images.length
  const hasMultiple = total > 1

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((i) => (i - 1 + total) % total)
  }

  const next = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentIndex((i) => (i + 1) % total)
  }

  const goTo = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setCurrentIndex(index)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    didSwipe.current = false
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasMultiple) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      didSwipe.current = true
      setCurrentIndex((i) => diff > 0 ? (i + 1) % total : (i - 1 + total) % total)
    }
    touchStartX.current = null
  }

  const handleImageClick = () => {
    if (didSwipe.current) { didSwipe.current = false; return }
    navigate(`/products/${product.id}`)
  }

  const status = statusConfig[product.status as keyof typeof statusConfig] ?? statusConfig.no_reparado
  const StatusIcon = status.Icon

  return (
    <div className="group relative rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="absolute left-0 top-0 bottom-0 w-1 z-10" style={{ background: status.color }} />

      {/* ── Carousel ── */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Ver detalle de ${product.name}`}
        className="relative aspect-video overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset"
        style={{ background: 'var(--bg-card)' }}
        onClick={handleImageClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleImageClick() } }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.length > 0 ? (
          <div
            className="flex h-full transition-transform duration-300 ease-in-out"
            style={{
              width: `${total * 100}%`,
              transform: `translateX(-${currentIndex * (100 / total)}%)`,
            }}
          >
            {images.map((src, i) => (
              <div key={i} style={{ width: `${100 / total}%` }} className="flex-shrink-0 h-full">
                <img src={src} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5" style={{ background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)' }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            <span className="text-[10px] text-zinc-600 font-medium">Sin imagen</span>
          </div>
        )}

        {/* Prev / Next — desktop hover */}
        {hasMultiple && (
          <>
            <button
              onClick={prev}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-black/40 hover:bg-black/65 text-white rounded-full opacity-0 group-hover:opacity-100 touch-always-visible transition-opacity"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={next}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-black/40 hover:bg-black/65 text-white rounded-full opacity-0 group-hover:opacity-100 touch-always-visible transition-opacity"
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={14} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => goTo(e, i)}
                  aria-label={`Ir a imagen ${i + 1}`}
                  className={`rounded-full transition-all ${i === currentIndex ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2 z-10">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${status.colorCls}`}
            style={{ background: status.bg, border: `1px solid ${status.border}` }}
          >
            <StatusIcon size={11} strokeWidth={2.5} />
            {status.label}
          </span>
        </div>
      </div>

      {/* ── Info ── */}
      <Link to={`/products/${product.id}`} className="block p-4">
        <h3 className="font-bold text-zinc-100 text-base leading-tight line-clamp-2 mb-1">
          {product.name}
        </h3>

        {product.category && (
          <p className="text-xs text-amber-600 font-medium mb-1.5">{product.category.name}</p>
        )}

        {product.repair_description && (
          <p className="text-xs text-zinc-400 mb-3 line-clamp-2 leading-relaxed">{product.repair_description}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-base font-bold text-zinc-100">
              {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
              product.paid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
            }`}>
              {product.paid ? 'Pagado' : 'Pendiente'}
            </span>
          </div>

          {/* Action buttons — visible on hover (desktop) or always on touch devices */}
          {(canManage || canDelete) && (
            <div className="flex items-center gap-1.5">
              {canManage && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(product) }}
                  className="p-2 rounded-xl hover:bg-amber-500/15 text-zinc-400 hover:text-amber-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  style={{ background: 'var(--bg-card)' }}
                  aria-label="Editar"
                >
                  <Edit size={13} />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(product) }}
                  className="p-2 rounded-xl hover:bg-red-500/15 text-zinc-400 hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  style={{ background: 'var(--bg-card)' }}
                  aria-label="Eliminar"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
})

export default ProductCard
