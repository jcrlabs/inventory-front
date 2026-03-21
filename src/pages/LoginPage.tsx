import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { getErrorMessage } from '../api/client'

interface LoginForm {
  identifier: string
  password: string
}

const BrandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </svg>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async ({ identifier, password }: LoginForm) => {
    setIsLoading(true)
    try {
      const pair = await authApi.login(identifier, password)
      setAuth(pair.user, pair.access_token, pair.refresh_token, pair.expires_at)
      toast.success(`Bienvenido, ${pair.user.username}!`)
      navigate('/')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left decorative panel – hidden on mobile */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0c1424 0%, #111827 60%, #180f38 100%)' }}
      >
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(109,40,217,0.08) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 14px -2px rgba(109,40,217,0.6)' }}>
            <BrandIcon />
          </div>
          <div>
            <p className="font-semibold text-white text-sm tracking-tight">Inventory</p>
            <p className="text-[10px] font-medium" style={{ color: 'rgba(148,163,184,0.45)' }}>jcrlabs</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h2 className="text-[2rem] font-bold text-white mb-4 leading-snug">
            Gestión de reparaciones<br />
            <span style={{ color: 'rgba(167,139,250,0.9)' }}>simple y eficiente.</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(148,163,184,0.6)' }}>
            Controla el estado de tus reparaciones, gestiona clientes y analiza el rendimiento de tu taller desde un solo lugar.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Seguimiento en tiempo real del estado de reparaciones',
              'Gestión de clientes y contactos',
              'Control de pagos y estadísticas del taller',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.28)' }}>
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-[13px]" style={{ color: 'rgba(148,163,184,0.65)' }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] relative z-10" style={{ color: 'rgba(148,163,184,0.28)' }}>
          © {new Date().getFullYear()} jcrlabs · Sistema de Inventario
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 bg-slate-50 min-h-screen lg:min-h-0">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 12px rgba(109,40,217,0.4)' }}>
            <BrandIcon />
          </div>
          <span className="font-bold text-slate-900 text-lg">Inventory</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
            <p className="text-sm text-slate-500 mt-1">Bienvenido de nuevo</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Usuario o Email
              </label>
              <input
                {...register('identifier', { required: 'Campo obligatorio' })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 transition-colors"
                placeholder="admin o admin@inventory.local"
                autoComplete="username"
              />
              {errors.identifier && (
                <p className="mt-1.5 text-xs text-red-500">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Campo obligatorio' })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3.5 py-2.5 pr-11 border border-slate-200 rounded-xl text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-1 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-60 hover:opacity-90 active:scale-[0.99]"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                boxShadow: '0 4px 14px -3px rgba(109,40,217,0.45)',
              }}
            >
              {isLoading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Entrar</span><ArrowRight size={15} /></>
              }
            </button>

            <p className="text-center text-sm text-slate-500 pt-1">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-violet-600 font-semibold hover:text-violet-700 transition-colors">
                Regístrate
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
