import { useQuery } from '@tanstack/react-query'
import { Package, Tag, Users, ShoppingCart, ArrowUpRight } from 'lucide-react'
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
        {Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)}
      </div>
    )
  }

  const cards = [
    {
      label: 'Total Reparaciones',
      value: stats?.total_products ?? 0,
      sub: `${stats?.active_products ?? 0} activas`,
      icon: Package,
      gradient: 'from-violet-500 to-violet-700',
      glow: 'rgba(109,40,217,0.25)',
      to: '/products',
    },
    {
      label: 'Categorías',
      value: stats?.total_categories ?? 0,
      icon: Tag,
      gradient: 'from-fuchsia-500 to-fuchsia-700',
      glow: 'rgba(168,85,247,0.2)',
      to: '/categories',
    },
    ...(isAdmin
      ? [{
          label: 'Usuarios',
          value: stats?.total_users ?? 0,
          icon: Users,
          gradient: 'from-amber-400 to-amber-600',
          glow: 'rgba(245,158,11,0.2)',
          to: '/users',
        }]
      : []),
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
      {cards.map(({ label, value, sub, icon: Icon, gradient, glow, to }) => (
        <Link
          key={label}
          to={to}
          className="group bg-white rounded-2xl p-5 border border-slate-200/70 shadow-card hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center flex-shrink-0`}
              style={{ boxShadow: `0 4px 14px -3px ${glow}` }}
            >
              <Icon className="text-white" size={18} />
            </div>
            <ArrowUpRight
              size={15}
              className="text-slate-300 group-hover:text-violet-500 transition-colors mt-0.5"
            />
          </div>
          <p className="text-[1.6rem] font-bold text-slate-900 leading-none">{value}</p>
          <p className="text-[13px] text-slate-500 mt-1.5 font-medium">{label}</p>
          {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
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

  const products = data?.data ?? []

  return (
    <div className="grid grid-cols-1 gap-5">
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-semibold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
            <ShoppingCart size={15} className="text-slate-400" />
            Últimas Reparaciones
          </h2>
          <Link to="/products" className="text-[12px] text-violet-600 hover:text-violet-700 font-medium transition-colors">
            Ver todos →
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-slate-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {products.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="text-slate-400" size={15} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${p.id}`}
                    className="text-[13px] font-medium text-slate-800 hover:text-violet-600 truncate block transition-colors"
                  >
                    {p.name}
                  </Link>
                  <p className="text-[11px] text-slate-400">
                    {p.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
                <span
                  className={`text-[11px] flex-shrink-0 font-semibold px-2 py-0.5 rounded-full ${
                    p.active
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {p.active ? 'En curso' : 'Cerrado'}
                </span>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-[13px] text-slate-400 text-center py-8">
                No hay reparaciones aún
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
    <div className="p-4 sm:p-6 lg:p-7">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          Bienvenido, {user?.username ?? '—'}
        </h1>
        <p className="text-[13px] text-slate-400 mt-0.5">Resumen del inventario</p>
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
