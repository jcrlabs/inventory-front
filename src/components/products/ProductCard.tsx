import { Package, Edit, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../common/Badge'
import type { Product } from '../../types'
import { usePermissions } from '../../hooks/usePermissions'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { canManage, canDeleteProduct } = usePermissions()
  const canDelete = canDeleteProduct(product)

  // First image from gallery, fallback to legacy image_url
  const firstImage = product.images?.[0]?.image_url ?? product.image_url

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Whole card is a link to detail */}
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="text-gray-300 group-hover:text-gray-400 transition-colors" size={48} />
            </div>
          )}
          {/* Image count badge */}
          {product.images && product.images.length > 1 && (
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
              {product.images.length} fotos
            </span>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant={product.active ? 'success' : 'error'}>
              {product.active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>

        <div className="p-4">
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
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${product.paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {product.paid ? 'Pagado' : 'Pendiente'}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action buttons — stop propagation so they don't navigate */}
      {(canManage || canDelete) && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canManage && (
            <button
              onClick={(e) => { e.preventDefault(); onEdit(product) }}
              className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-violet-50 text-gray-500 hover:text-violet-700 transition-colors"
              title="Editar"
            >
              <Edit size={14} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => { e.preventDefault(); onDelete(product) }}
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
