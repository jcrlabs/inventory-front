import { useState, useRef } from 'react'
import { Package, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { Product } from '../../types'
import { usePermissions } from '../../hooks/usePermissions'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

const statusConfig = {
  reparado:    { label: 'Reparado',    color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.18)' },
  en_progreso: { label: 'En progreso', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.18)' },
  no_reparado: { label: 'No reparado', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.18)' },
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
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

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all duration-200 hover:shadow-card-md hover:-translate-y-0.5">

      {/* ── Carousel ── */}
      <div
        className="relative aspect-video bg-slate-100 overflow-hidden cursor-pointer"
        onClick={handleImageClick}
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
          <div className="w-full h-full flex items-center justify-center">
            <Package className="text-slate-200 group-hover:text-slate-300 transition-colors" size={44} />
          </div>
        )}

        {/* Prev / Next — desktop hover */}
        {hasMultiple && (
          <>
            <button
              onClick={prev}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 p-1 bg-black/40 hover:bg-black/65 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={next}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 p-1 bg-black/40 hover:bg-black/65 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="absolute top-2 left-2 z-10">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}`, backdropFilter: 'blur(4px)' }}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* ── Info ── */}
      <Link to={`/products/${product.id}`} className="block p-4">
        <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-2 mb-1">
          {product.name}
        </h3>

        {product.category && (
          <p className="text-xs text-violet-600 font-medium mb-1.5">{product.category.name}</p>
        )}

        {product.repair_description && (
          <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">{product.repair_description}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-base font-bold text-slate-900">
              {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
              product.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {product.paid ? 'Pagado' : 'Pendiente'}
            </span>
          </div>

          {/* Action buttons — visible on hover (desktop) or always on touch devices */}
          {(canManage || canDelete) && (
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity touch-always-visible">
              {canManage && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(product) }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-violet-100 text-slate-500 hover:text-violet-700 transition-colors"
                  title="Editar"
                >
                  <Edit size={13} />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(product) }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 transition-colors"
                  title="Eliminar"
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
}
