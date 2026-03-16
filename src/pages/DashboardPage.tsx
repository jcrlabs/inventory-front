import { useQuery } from '@tanstack/react-query'
import { Package, Tag, TrendingUp, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { productsApi } from '../api/products'
import { categoriesApi } from '../api/categories'
import { useAuthStore } from '../store/authStore'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data: productsData } = useQuery({
    queryKey: ['products', 'dashboard'],
    queryFn: () => productsApi.list({ page: 1, page_size: 100 }),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

  const products = productsData?.data ?? []
  const totalProducts = productsData?.total ?? 0
  const totalCategories = categoriesData?.total ?? 0
  const lowStock = products.filter((p) => p.stock <= 5 && p.stock > 0).length
  const outOfStock = products.filter((p) => p.stock === 0).length
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)

  const stats = [
    {
      label: 'Total Productos',
      value: totalProducts,
      icon: Package,
      color: 'bg-sky-500',
      to: '/products',
    },
    {
      label: 'Categorías',
      value: totalCategories,
      icon: Tag,
      color: 'bg-violet-500',
      to: '/categories',
    },
    {
      label: 'Valor del Stock',
      value: totalValue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }),
      icon: TrendingUp,
      color: 'bg-emerald-500',
      to: '/products',
    },
    {
      label: 'Sin Stock',
      value: outOfStock,
      icon: AlertTriangle,
      color: 'bg-red-500',
      to: '/products?active=true',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.username} 👋
        </h1>
        <p className="text-gray-500 mt-1">Resumen del inventario</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(({ label, value, icon: Icon, color, to }) => (
          <Link
            key={label}
            to={to}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                <Icon className="text-white" size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock alert */}
        {(lowStock > 0 || outOfStock > 0) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={18} />
              Alertas de Stock
            </h2>
            <div className="space-y-3">
              {products
                .filter((p) => p.stock <= 5)
                .sort((a, b) => a.stock - b.stock)
                .slice(0, 8)
                .map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <Link to={`/products/${p.id}`} className="text-sm text-gray-700 hover:text-sky-600 truncate">
                      {p.name}
                    </Link>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-3 flex-shrink-0 ${
                        p.stock === 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Últimos Productos</h2>
            <Link to="/products" className="text-sm text-sky-500 hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {products.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="text-gray-400" size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${p.id}`} className="text-sm font-medium text-gray-900 hover:text-sky-600 truncate block">
                    {p.name}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {p.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
                <span className={`text-xs flex-shrink-0 ${p.active ? 'text-green-600' : 'text-red-500'}`}>
                  {p.active ? '●' : '○'}
                </span>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No hay productos aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
