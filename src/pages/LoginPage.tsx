import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Sun, Moon, Languages } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { getErrorMessage } from '../api/client'

interface LoginForm {
  identifier: string
  password: string
}

const LOCALES = ['es', 'en', 'gl'] as const

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const { theme, toggleTheme } = useSettingsStore()
  const { locale, setLocale } = useSettingsStore()
  const { t, i18n } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async ({ identifier, password }: LoginForm) => {
    setIsLoading(true)
    try {
      const pair = await authApi.login(identifier, password)
      setAuth(pair.user, pair.access_token, pair.refresh_token, pair.expires_at)
      toast.success(t('login.welcome', { name: pair.user.username }))
      navigate('/')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocale = (l: typeof LOCALES[number]) => {
    setLocale(l)
    i18n.changeLanguage(l)
    setShowLangMenu(false)
  }

  const isDark = theme === 'dark'

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, var(--glow-amber) 0%, transparent 65%)' }}
      />

      {/* Top-right controls */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-20">
        {/* Language switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            aria-label={t('language.toggle')}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-md)',
              color: 'var(--text-2)',
            }}
          >
            <Languages size={13} />
            <span className="uppercase">{locale}</span>
          </button>
          {showLangMenu && (
            <div
              className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden py-1 z-30"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-md)',
                boxShadow: '0 8px 24px -4px rgba(0,0,0,0.15)',
                minWidth: '110px',
              }}
            >
              {LOCALES.map((l) => (
                <button
                  key={l}
                  onClick={() => handleLocale(l)}
                  className="w-full text-left px-3 py-2 text-xs font-medium transition-colors"
                  style={{
                    color: locale === l ? '#f59e0b' : 'var(--text-2)',
                    background: locale === l ? 'rgba(245,158,11,0.06)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (locale !== l) (e.target as HTMLElement).style.background = 'var(--bg-hover)' }}
                  onMouseLeave={(e) => { if (locale !== l) (e.target as HTMLElement).style.background = 'transparent' }}
                >
                  {t(`language.${l}`)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={t('theme.toggle')}
          className="p-2 rounded-xl transition-all"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-md)',
            color: 'var(--text-2)',
          }}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      <div className="w-full max-w-[360px] relative z-10">
        {/* Logo + título */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/icon.svg?v=0.2.6"
            alt="Electroteca"
            className="w-20 h-20 mb-3"
            style={{ filter: 'drop-shadow(0 0 16px rgba(245,158,11,0.25))' }}
          />
          <h1 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-1)' }}>
            {t('login.title')}
          </h1>
          <p className="text-xs mt-1 tracking-wide uppercase" style={{ color: 'var(--text-3)' }}>
            {t('login.subtitle')}
          </p>
        </div>

        {/* Formulario */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: isDark ? '0 12px 48px -12px rgba(0,0,0,0.7)' : '0 4px 24px -4px rgba(0,0,0,0.08)',
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="login-identifier" className="block text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
                {t('login.identifier')}
              </label>
              <input
                id="login-identifier"
                {...register('identifier', { required: t('login.required') })}
                className="w-full px-4 py-3 rounded-xl text-sm placeholder-zinc-500 border focus:outline-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-700/50 transition-colors"
                style={{ background: 'var(--bg-input)', color: 'var(--text-1)', borderColor: 'var(--border-md)' }}
                placeholder={t('login.identifierPlaceholder')}
                autoComplete="username"
                autoFocus
              />
              {errors.identifier && <p className="mt-1.5 text-xs text-red-400">{errors.identifier.message}</p>}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  {...register('password', { required: t('login.required') })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm placeholder-zinc-500 border focus:outline-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-700/50 transition-colors"
                  style={{ background: 'var(--bg-input)', color: 'var(--text-1)', borderColor: 'var(--border-md)' }}
                  placeholder={t('login.passwordPlaceholder')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                  style={{ color: 'var(--text-3)' }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 flex items-center justify-center rounded-xl text-sm font-bold text-zinc-900 transition-all duration-150 disabled:opacity-50 hover:opacity-90 active:scale-[0.99]"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 4px 20px -4px rgba(245,158,11,0.35)',
              }}
            >
              {isLoading
                ? <><span className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" role="status" aria-label={t('login.loading')} /><span className="sr-only">{t('login.loading')}</span></>
                : t('login.submit')
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--text-3)' }}>
          {t('login.noAccount')}{' '}
          <Link to="/register" className="text-amber-600 font-semibold hover:text-amber-500 transition-colors">
            {t('login.register')}
          </Link>
        </p>
      </div>
    </div>
  )
}
