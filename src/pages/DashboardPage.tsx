import { useQuery } from '@tanstack/react-query'
import { Package, Tag, Users, ArrowUpRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
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
      color: '#8b5cf6',
      glow: 'rgba(139,92,246,0.18)',
      bg: 'rgba(139,92,246,0.07)',
      border: 'rgba(139,92,246,0.14)',
      to: '/products',
    },
    {
      label: 'Categorías',
      value: stats?.total_categories ?? 0,
      icon: Tag,
      color: '#d946ef',
      glow: 'rgba(217,70,239,0.14)',
      bg: 'rgba(217,70,239,0.07)',
      border: 'rgba(217,70,239,0.13)',
      to: '/categories',
    },
    ...(isAdmin
      ? [{
          label: 'Usuarios',
          value: stats?.total_users ?? 0,
          icon: Users,
          color: '#f59e0b',
          glow: 'rgba(245,158,11,0.14)',
          bg: 'rgba(245,158,11,0.07)',
          border: 'rgba(245,158,11,0.13)',
          to: '/users',
        }]
      : []),
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map(({ label, value, sub, icon: Icon, color, glow, bg, border, to }) => (
        <Link
          key={label}
          to={to}
          className="group relative rounded-2xl p-4 sm:p-5 bg-white overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
          style={{
            border: `1px solid ${border}`,
            boxShadow: `0 2px 12px -4px ${glow}, 0 1px 3px rgba(0,0,0,0.04)`,
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: bg }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <ArrowUpRight
              size={14}
              className="mt-0.5 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ color: 'rgba(148,163,184,0.5)' }}
            />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 leading-none tabular-nums">{value}</p>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 font-medium">{label}</p>
          {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
        </Link>
      ))}
    </div>
  )
}

function RecentProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', { page: 1, page_size: 8 }],
    queryFn: () => productsApi.list({ page: 1, page_size: 8 }),
    staleTime: 30_000,
  })

  const products = data?.data ?? []

  const statusConfig = {
    reparado: { label: 'Reparado', icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)' },
    en_progreso: { label: 'En progreso', icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)' },
    no_reparado: { label: 'No reparado', icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Últimas Reparaciones</h2>
          <p className="text-xs text-slate-400 mt-0.5">Actividad reciente del taller</p>
        </div>
        <Link
          to="/products"
          className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
        >
          Ver todas
          <ArrowUpRight size={13} />
        </Link>
      </div>

      <div className="divide-y divide-slate-50">
        {isLoading ? (
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-100 rounded w-3/5" />
                <div className="h-2.5 bg-slate-100 rounded w-1/4" />
              </div>
              <div className="h-5 w-20 bg-slate-100 rounded-full" />
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="py-14 text-center">
            <Package className="mx-auto mb-3 text-slate-300" size={36} />
            <p className="text-sm text-slate-400 font-medium">No hay reparaciones aún</p>
            <Link to="/products" className="mt-3 inline-block text-xs font-semibold text-violet-600 hover:underline">
              Crear primera reparación
            </Link>
          </div>
        ) : (
          products.map((p) => {
            const status = statusConfig[p.status as keyof typeof statusConfig] ?? statusConfig.no_reparado
            const StatusIcon = status.icon
            return (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50/60 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200/50">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="text-slate-300" size={15} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate group-hover:text-violet-700 transition-colors">
                    {p.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {p.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    {p.category && (
                      <>
                        <span className="mx-1.5 text-slate-300">·</span>
                        <span className="text-violet-500">{p.category.name}</span>
                      </>
                    )}
                  </p>
                </div>
                <div
                  className="flex items-center gap-1.5 flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}
                >
                  <StatusIcon size={11} />
                  <span className="hidden sm:inline">{status.label}</span>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-1">Panel de control</p>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
          Bienvenido,{' '}
          <span className="text-gradient">{user?.username ?? '—'}</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Aquí tienes un resumen de tu taller</p>
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
