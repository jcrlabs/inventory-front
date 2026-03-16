import { useQuery } from '@tanstack/react-query'
import { Package, Tag, TrendingUp, AlertTriangle, Users, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { statsApi } from '../api/stats'
import { productsApi } from '../api/products'
import { useAuthStore } from '../store/authStore'
import { StatCardSkeleton } from '../components/common/Skeleton'
import ErrorBoundary from '../components/common/ErrorBoundary'
import { usePermissions } from '../hooks/usePermissions'

function StatsGrid() {
  const { isAdmin } = usePermissions()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.get,
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)}
      </div>
    )
  }

  const cards = [
    {
      label: 'Total Productos',
      value: stats?.total_products ?? 0,
      sub: `${stats?.active_products ?? 0} activos`,
      icon: Package,
      color: 'bg-sky-500',
      to: '/products',
    },
    {
      label: 'Categorías',
      value: stats?.total_categories ?? 0,
      icon: Tag,
      color: 'bg-violet-500',
      to: '/categories',
    },
    {
      label: 'Valor del Stock',
      value: (stats?.stock_value ?? 0).toLocaleString('es-ES', {
        style: 'currency',
        currency: 'EUR',
      }),
      sub: `${stats?.total_stock ?? 0} unidades totales`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      to: '/products',
    },
    {
      label: 'Sin Stock',
      value: stats?.out_of_stock ?? 0,
      sub: `${stats?.low_stock ?? 0} con stock bajo`,
      icon: AlertTriangle,
      color: stats?.out_of_stock ? 'bg-red-500' : 'bg-gray-400',
      to: '/products',
    },
    ...(isAdmin
      ? [{
          label: 'Usuarios',
          value: stats?.total_users ?? 0,
          icon: Users,
          color: 'bg-amber-500',
          to: '/users',
        }]
      : []),
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map(({ label, value, sub, icon: Icon, color, to }) => (
        <Link
          key={label}
          to={to}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-4`}>
            <Icon className="text-white" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </Link>
      ))}
    </div>
  )
}

function RecentProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', { page: 1, page_size: 6 }],
    queryFn: () => productsApi.list({ page: 1, page_size: 6 }),
    staleTime: 30_000,
  })

  const { data: lowStockData } = useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: () => productsApi.list({ page: 1, page_size: 8, active: true }),
    staleTime: 30_000,
  })

  const products = data?.data ?? []
  const lowStockProducts = (lowStockData?.data ?? []).filter((p) => p.stock <= 5)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={18} />
            Alertas de Stock
          </h2>
          <div className="space-y-3">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <Link
                  to={`/products/${p.id}`}
                  className="text-sm text-gray-700 hover:text-sky-600 truncate"
                >
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

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart size={18} className="text-gray-400" />
            Últimos Productos
          </h2>
          <Link to="/products" className="text-sm text-sky-500 hover:underline">
            Ver todos
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="text-gray-400" size={16} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${p.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-sky-600 truncate block"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {p.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
                <span
                  className={`text-xs flex-shrink-0 font-medium ${
                    p.active ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {p.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                No hay productos aún
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.username ?? '—'} 👋
        </h1>
        <p className="text-gray-500 mt-1">Resumen del inventario</p>
      </div>

      <ErrorBoundary>
        <StatsGrid />
      </ErrorBoundary>

      <ErrorBoundary>
        <RecentProducts />
      </ErrorBoundary>
    </div>
  )
}
