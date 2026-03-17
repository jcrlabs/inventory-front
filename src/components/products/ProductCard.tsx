import { useState, useRef } from 'react'
import { Package, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Badge from '../common/Badge'
import type { Product } from '../../types'
import { usePermissions } from '../../hooks/usePermissions'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const navigate = useNavigate()
  const { canManage, canDeleteProduct } = usePermissions()
  const canDelete = canDeleteProduct(product)

  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const didSwipe = useRef(false)

  // Build image list: gallery URLs first, fallback to legacy single image
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

  // Touch swipe handlers
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

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">

      {/* ── Carousel ──────────────────────────────────────────────────────── */}
      <div
        className="relative aspect-video bg-gray-100 overflow-hidden cursor-pointer"
        onClick={handleImageClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.length > 0 ? (
          /* Sliding strip */
          <div
            className="flex h-full transition-transform duration-300 ease-in-out"
            style={{
              width: `${total * 100}%`,
              transform: `translateX(-${currentIndex * (100 / total)}%)`,
            }}
          >
            {images.map((src, i) => (
              <div
                key={i}
                style={{ width: `${100 / total}%` }}
                className="flex-shrink-0 h-full"
              >
                <img
                  src={src}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="text-gray-300 group-hover:text-gray-400 transition-colors" size={48} />
          </div>
        )}

        {/* Prev / Next arrows — visible on hover (desktop) */}
        {hasMultiple && (
          <>
            <button
              onClick={prev}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 p-1 bg-black/40 hover:bg-black/65 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={next}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 p-1 bg-black/40 hover:bg-black/65 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Imagen siguiente"
            >
              <ChevronRight size={15} />
            </button>

            {/* Dots — always visible so mobile users know there are more images */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => goTo(e, i)}
                  aria-label={`Ir a imagen ${i + 1}`}
                  className={`rounded-full transition-all ${
                    i === currentIndex
                      ? 'w-3 h-1.5 bg-white'
                      : 'w-1.5 h-1.5 bg-white/55 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Active badge */}
        <div className="absolute top-2 right-2 z-10">
          <Badge variant={product.active ? 'success' : 'error'}>
            {product.active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      {/* ── Info (Link for proper anchor / right-click / open in tab) ─────── */}
      <Link to={`/products/${product.id}`} className="block p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
          {product.name}
        </h3>

        {product.category && (
          <p className="text-xs text-violet-700 font-medium mb-2">{product.category.name}</p>
        )}

        {product.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
            <span
              className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
                product.paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              {product.paid ? 'Pagado' : 'Pendiente'}
            </span>
          </div>
        </div>
      </Link>

      {/* ── Action buttons ─────────────────────────────────────────────────── */}
      {(canManage || canDelete) && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {canManage && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(product) }}
              className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-violet-50 text-gray-500 hover:text-violet-700 transition-colors"
              title="Editar"
            >
              <Edit size={14} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(product) }}
              className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
