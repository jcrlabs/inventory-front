import { NavLink } from 'react-router-dom'
import { Package, Tag, Users, LayoutDashboard, LogOut, Settings, X, Sun, Moon, Languages } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { useSettingsStore } from '../../store/settingsStore'
import { usePermissions } from '../../hooks/usePermissions'
import { authApi } from '../../api/auth'
import ProfileModal from '../profile/ProfileModal'

const LOCALES = ['es', 'en', 'gl'] as const

const roleColors: Record<string, string> = {
  admin: 'bg-rose-500/20 text-rose-400',
  manager: 'bg-amber-500/20 text-amber-400',
  viewer: 'bg-slate-500/20 text-zinc-500',
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout, user, refreshToken } = useAuthStore()
  const { theme, toggleTheme, locale, setLocale } = useSettingsStore()
  const [showProfile, setShowProfile] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const { t, i18n } = useTranslation()
  const { role } = usePermissions()
  const isDark = theme === 'dark'

  const navItems = [
    { to: '/products', icon: Package, label: t('nav.products'), roles: ['admin', 'manager', 'viewer'] },
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), roles: ['admin', 'manager', 'viewer'] },
    { to: '/categories', icon: Tag, label: t('nav.categories'), roles: ['admin', 'manager', 'viewer'] },
    { to: '/users', icon: Users, label: t('nav.users'), roles: ['admin'] },
  ] as const

  const handleLogout = async () => {
    try { await authApi.logout(refreshToken ?? undefined) } catch { /* ignore */ }
    logout()
  }

  const handleLocale = (l: typeof LOCALES[number]) => {
    setLocale(l)
    i18n.changeLanguage(l)
    setShowLangMenu(false)
  }

  const initial = user?.username?.[0]?.toUpperCase() ?? '?'

  return (
    <>
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
          background: 'var(--bg-base)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Brand */}
        <div className="px-4 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icon.svg?v=0.2.6" alt="Electroteca" className="w-8 h-8 flex-shrink-0"
              style={{ filter: 'drop-shadow(0 0 5px rgba(245,158,11,0.22))' }} />
            <div>
              <p className="font-semibold text-sm leading-tight tracking-tight" style={{ color: 'var(--text-1)' }}>Electroteca</p>
              <p className="text-[10px] leading-tight font-medium" style={{ color: 'var(--text-3)' }}>jcrlabs</p>
            </div>
          </div>
          <button onClick={onClose} aria-label={t('nav.closeMenu')}
            className="md:hidden p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            style={{ color: 'var(--text-2)' }}>
            <X size={15} />
          </button>
        </div>

        <div className="mx-4 mb-3" style={{ height: '1px', background: 'var(--border)' }} />

        {/* Nav */}
        <div className="px-2 flex-1">
          <p className="px-2 mb-2 text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
            {t('nav.menu')}
          </p>
          <nav className="space-y-0.5">
            {navItems
              .filter((item) => role && (item.roles as readonly string[]).includes(role))
              .map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} end={to === '/products' || to === '/dashboard'} onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                      isActive ? '' : 'hover:bg-[var(--bg-hover)]'
                    }`
                  }
                  style={({ isActive }) => isActive
                    ? { background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(180,83,9,0.06))', boxShadow: 'inset 0 0 0 1px rgba(245,158,11,0.18)', color: 'var(--text-1)' }
                    : { color: 'var(--text-3)' }
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={15} style={{ color: isActive ? '#fbbf24' : 'var(--text-3)' }} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
          </nav>
        </div>

        <div className="mx-4 mb-3" style={{ height: '1px', background: 'var(--border)' }} />

        {/* Theme + Language controls */}
        <div className="px-3 pb-3 flex items-center gap-1.5">
          {/* Theme toggle */}
          <button onClick={toggleTheme} aria-label={t('theme.toggle')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
          >
            {isDark ? <Sun size={12} /> : <Moon size={12} />}
            <span>{isDark ? t('theme.light') : t('theme.dark')}</span>
          </button>

          {/* Language switcher */}
          <div className="relative">
            <button onClick={() => setShowLangMenu(!showLangMenu)} aria-label={t('language.toggle')}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold uppercase transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
            >
              <Languages size={12} />
              {locale}
            </button>
            {showLangMenu && (
              <div className="absolute bottom-full mb-1.5 left-0 rounded-xl overflow-hidden py-1 z-50"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', boxShadow: '0 8px 24px -4px rgba(0,0,0,0.18)', minWidth: '110px' }}
              >
                {LOCALES.map((l) => (
                  <button key={l} onClick={() => handleLocale(l)}
                    className="w-full text-left px-3 py-2 text-xs font-medium transition-colors"
                    style={{ color: locale === l ? '#f59e0b' : 'var(--text-2)', background: locale === l ? 'rgba(245,158,11,0.06)' : 'transparent' }}
                    onMouseEnter={(e) => { if (locale !== l) (e.target as HTMLElement).style.background = 'var(--bg-hover)' }}
                    onMouseLeave={(e) => { if (locale !== l) (e.target as HTMLElement).style.background = 'transparent' }}
                  >
                    {t(`language.${l}`)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User section */}
        <div className="px-2 pb-4">
          <div className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl mb-1">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: 'var(--text-1)' }}>{user?.username}</p>
              <span className={`inline-block mt-0.5 px-1.5 py-px text-[10px] font-semibold rounded-md capitalize ${roleColors[user?.role ?? 'viewer'] ?? roleColors.viewer}`}>
                {t(`roles.${user?.role ?? 'viewer'}`)}
              </span>
            </div>
            <button onClick={() => setShowProfile(true)} aria-label={t('nav.editProfile')}
              className="flex-shrink-0 p-1.5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              style={{ color: 'var(--text-3)' }}>
              <Settings size={13} />
            </button>
          </div>

          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
            style={{ color: 'var(--text-3)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={14} style={{ color: 'var(--text-3)' }} />
            {t('nav.logout')}
          </button>
        </div>
      </aside>
    </>
  )
}
