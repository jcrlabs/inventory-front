import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { getErrorMessage } from '../api/client'

interface LoginForm {
  identifier: string
  password: string
}

const WrenchLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
      stroke="#f59e0b"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
      toast.success(`Bienvenido, ${pair.user.username}`)
      navigate('/')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] px-4">
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(245,158,11,0.05) 0%, transparent 65%)' }}
      />

      <div className="w-full max-w-[360px] relative z-10">
        {/* Logo + título */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(245,158,11,0.2)',
              boxShadow: '0 0 28px -6px rgba(245,158,11,0.25)',
            }}
          >
            <WrenchLogo />
          </div>
          <h1 className="text-lg font-bold text-zinc-100 tracking-tight">Electroteca</h1>
          <p className="text-xs text-zinc-600 mt-1 tracking-wide uppercase">Gestión de reparaciones</p>
        </div>

        {/* Formulario */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 12px 48px -12px rgba(0,0,0,0.7)',
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                Usuario o Email
              </label>
              <input
                {...register('identifier', { required: 'Campo obligatorio' })}
                className="w-full px-4 py-3 rounded-xl text-sm bg-zinc-900 text-zinc-100 placeholder-zinc-600 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-700/50 transition-colors"
                placeholder="usuario o correo"
                autoComplete="username"
                autoFocus
              />
              {errors.identifier && (
                <p className="mt-1.5 text-xs text-red-400">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Campo obligatorio' })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm bg-zinc-900 text-zinc-100 placeholder-zinc-600 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-700/50 transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
              )}
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
                ? <span className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                : 'Entrar'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-5">
          ¿Sin cuenta?{' '}
          <Link to="/register" className="text-amber-600 font-semibold hover:text-amber-500 transition-colors">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
