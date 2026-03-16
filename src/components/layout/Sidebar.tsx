import { NavLink } from 'react-router-dom'
import { Package, Tag, Users, LayoutDashboard, LogOut, Boxes } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { usePermissions } from '../../hooks/usePermissions'
import { authApi } from '../../api/auth'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'viewer'] },
  { to: '/products', icon: Package, label: 'Productos', roles: ['admin', 'manager', 'viewer'] },
  { to: '/categories', icon: Tag, label: 'Categorías', roles: ['admin', 'manager', 'viewer'] },
  { to: '/users', icon: Users, label: 'Usuarios', roles: ['admin'] },
] as const

const roleColors: Record<string, string> = {
  admin: 'bg-rose-500/15 text-rose-400',
  manager: 'bg-amber-500/15 text-amber-400',
  viewer: 'bg-slate-500/20 text-slate-400',
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Gestor',
  viewer: 'Visor',
}

export default function Sidebar() {
  const { logout, user, refreshToken } = useAuthStore()

  const handleLogout = async () => {
    try { await authApi.logout(refreshToken ?? undefined) } catch { /* ignore */ }
    logout()
  }
  const { role } = usePermissions()
  const initial = user?.username?.[0]?.toUpperCase() ?? '?'

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col min-h-screen border-r"
      style={{ background: '#0d1424', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Brand */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 12px -2px rgba(109,40,217,0.5)' }}
          >
            <Boxes size={15} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm leading-tight tracking-tight">Inventory</p>
            <p className="text-[11px] leading-tight" style={{ color: 'rgba(148,163,184,0.6)' }}>jcrlabs</p>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="mx-4 mb-3" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      {/* Nav section */}
      <div className="px-1.5 mb-1">
        <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(148,163,184,0.4)' }}>
          Menú
        </p>
        <nav className="space-y-0.5">
          {navItems
            .filter((item) => role && (item.roles as readonly string[]).includes(role))
            .map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={15} className={isActive ? 'text-white' : 'text-slate-500'} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Separator */}
      <div className="mx-4 mb-3" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

      {/* User section */}
      <div className="px-1.5 pb-4">
        {/* User info */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5">
          <div
            className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-white leading-tight truncate">{user?.username}</p>
            <p className="text-[11px] leading-tight truncate" style={{ color: 'rgba(148,163,184,0.5)' }}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-3 mb-1">
          <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${roleColors[user?.role ?? 'viewer'] ?? roleColors.viewer}`}>
            {roleLabels[user?.role ?? 'viewer'] ?? user?.role}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150"
        >
          <LogOut size={15} className="text-slate-500" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
