import { NavLink } from 'react-router-dom'
import { Package, Tag, Users, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { usePermissions } from '../../hooks/usePermissions'
import { authApi } from '../../api/auth'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'viewer'] },
  { to: '/products', icon: Package, label: 'Productos', roles: ['admin', 'manager', 'viewer'] },
  { to: '/categories', icon: Tag, label: 'Categorías', roles: ['admin', 'manager', 'viewer'] },
  { to: '/users', icon: Users, label: 'Usuarios', roles: ['admin'] },
] as const

export default function Sidebar() {
  const { logout, user, refreshToken } = useAuthStore()

  const handleLogout = async () => {
    try { await authApi.logout(refreshToken ?? undefined) } catch { /* ignore */ }
    logout()
  }
  const { role } = usePermissions()

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sky-500 rounded-lg flex items-center justify-center">
            <Package size={20} />
          </div>
          <div>
            <p className="font-semibold text-sm">Inventory</p>
            <p className="text-xs text-gray-400">jcrlabs</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems
          .filter((item) => role && (item.roles as readonly string[]).includes(role))
          .map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-400'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-white">{user?.username}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-sky-500/20 text-sky-400 capitalize">
            {user?.role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
