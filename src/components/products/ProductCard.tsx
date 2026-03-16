import { Package, Edit, Trash2, Eye } from 'lucide-react'
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
  const { canManage, canDelete } = usePermissions()

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="text-gray-300" size={48} />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant={product.active ? 'success' : 'error'}>
            {product.active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
            {product.name}
          </h3>
        </div>

        {product.category && (
          <p className="text-xs text-sky-600 font-medium mb-2">{product.category.name}</p>
        )}

        {product.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
            <p className="text-xs text-gray-500">
              Stock: <span className={`font-medium ${product.stock <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                {product.stock}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Link
              to={`/products/${product.id}`}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              title="Ver detalle"
            >
              <Eye size={16} />
            </Link>
            {canManage && (
              <button
                onClick={() => onEdit(product)}
                className="p-1.5 rounded-lg hover:bg-sky-50 text-gray-500 hover:text-sky-600 transition-colors"
                title="Editar"
              >
                <Edit size={16} />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => onDelete(product)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {product.sku && (
          <p className="text-xs text-gray-400 mt-2">SKU: {product.sku}</p>
        )}
      </div>
    </div>
  )
}
