import { NavLink } from 'react-router-dom'
import { Package, Tag, Users, LayoutDashboard, LogOut, Settings, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { usePermissions } from '../../hooks/usePermissions'
import { authApi } from '../../api/auth'
import ProfileModal from '../profile/ProfileModal'

const navItems = [
  { to: '/products', icon: Package, label: 'Productos', roles: ['admin', 'manager', 'viewer'] },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Panel de control', roles: ['admin', 'manager', 'viewer'] },
  { to: '/categories', icon: Tag, label: 'Categorías', roles: ['admin', 'manager', 'viewer'] },
  { to: '/users', icon: Users, label: 'Usuarios', roles: ['admin'] },
] as const

const roleColors: Record<string, string> = {
  admin: 'bg-rose-500/20 text-rose-400',
  manager: 'bg-amber-500/20 text-amber-400',
  viewer: 'bg-slate-500/20 text-zinc-500',
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Gestor',
  viewer: 'Visor',
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout, user, refreshToken } = useAuthStore()
  const [showProfile, setShowProfile] = useState(false)

  const handleLogout = async () => {
    try { await authApi.logout(refreshToken ?? undefined) } catch { /* ignore */ }
    logout()
  }
  const { role } = usePermissions()
  const initial = user?.username?.[0]?.toUpperCase() ?? '?'

  return (
    <>
      {/* ProfileModal rendered outside <aside> to avoid stacking context issues */}
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-[220px] flex-shrink-0 flex flex-col min-h-screen
          transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
        style={{
          background: '#111111',
          borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Brand */}
        <div className="px-4 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/icon.svg"
              alt="Electroteca"
              className="w-8 h-8 flex-shrink-0"
              style={{ filter: 'drop-shadow(0 0 5px rgba(245,158,11,0.22))' }}
            />
            <div>
              <p className="font-semibold text-white text-sm leading-tight tracking-tight">Electroteca</p>
              <p className="text-[10px] leading-tight font-medium" style={{ color: 'rgba(148,163,184,0.45)' }}>jcrlabs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <X size={15} />
          </button>
        </div>

        {/* Separator */}
        <div className="mx-4 mb-3" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        {/* Nav section */}
        <div className="px-2 flex-1">
          <p className="px-2 mb-2 text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(148,163,184,0.35)' }}>
            Menú
          </p>
          <nav className="space-y-0.5">
            {navItems
              .filter((item) => role && (item.roles as readonly string[]).includes(role))
              .map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/products' || to === '/dashboard'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-white'
                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? {
                          background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(180,83,9,0.06))',
                          boxShadow: 'inset 0 0 0 1px rgba(245,158,11,0.18)',
                        }
                      : {}
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={15} className={isActive ? 'text-amber-400' : 'text-zinc-400'} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
          </nav>
        </div>

        {/* Separator */}
        <div className="mx-4 mb-3" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

        {/* User section */}
        <div className="px-2 pb-4">
          <div className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl mb-1">
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
            >
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white leading-tight truncate">{user?.username}</p>
              <span
                className={`inline-block mt-0.5 px-1.5 py-px text-[10px] font-semibold rounded-md capitalize ${roleColors[user?.role ?? 'viewer'] ?? roleColors.viewer}`}
              >
                {roleLabels[user?.role ?? 'viewer'] ?? user?.role}
              </span>
            </div>
            <button
              onClick={() => setShowProfile(true)}
              aria-label="Editar perfil"
              className="flex-shrink-0 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Settings size={13} />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-zinc-500 hover:text-white hover:bg-white/5 transition-all duration-150"
          >
            <LogOut size={14} className="text-zinc-400" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
