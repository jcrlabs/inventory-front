import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { getErrorMessage } from '../api/client'

interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const BrandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <path d="m3.3 7 8.7 5 8.7-5"/>
    <path d="M12 22V12"/>
  </svg>
)

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>()
  const password = watch('password')

  const onSubmit = async ({ username, email, password }: RegisterForm) => {
    setIsLoading(true)
    try {
      const pair = await authApi.register({ username, email, password })
      setAuth(pair.user, pair.access_token, pair.refresh_token, pair.expires_at)
      toast.success(`Bienvenido, ${pair.user.username}!`)
      navigate('/')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "w-full px-3.5 py-2.5 border border-zinc-700 rounded-xl text-sm bg-zinc-800 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400 transition-colors"

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 sm:p-10 bg-zinc-900">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 12px rgba(109,40,217,0.4)' }}>
          <BrandIcon />
        </div>
        <span className="font-bold text-zinc-100 text-lg">Inventory</span>
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-zinc-100">Crear cuenta</h1>
          <p className="text-sm text-zinc-400 mt-1">Regístrate para empezar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Usuario</label>
            <input
              {...register('username', {
                required: 'Campo obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                maxLength: { value: 50, message: 'Máximo 50 caracteres' },
              })}
              className={inputClass}
              placeholder="mi_usuario"
              autoComplete="username"
            />
            {errors.username && <p className="mt-1.5 text-xs text-red-500">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
            <input
              {...register('email', {
                required: 'Campo obligatorio',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
              })}
              type="email"
              className={inputClass}
              placeholder="usuario@ejemplo.com"
              autoComplete="email"
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                {...register('password', {
                  required: 'Campo obligatorio',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  pattern: { value: /^(?=.*[a-zA-Z])(?=.*\d)/, message: 'Debe contener letras y números' },
                })}
                type={showPassword ? 'text' : 'password'}
                className={`${inputClass} pr-11`}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400 transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Confirmar contraseña</label>
            <div className="relative">
              <input
                {...register('confirmPassword', {
                  required: 'Campo obligatorio',
                  validate: (val) => val === password || 'Las contraseñas no coinciden',
                })}
                type={showConfirm ? 'text' : 'password'}
                className={`${inputClass} pr-11`}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400 transition-colors">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <p className="text-xs text-zinc-400 bg-zinc-800 rounded-lg px-3 py-2.5 border border-zinc-700">
            La cuenta se creará con rol de <strong className="text-zinc-300">Visor</strong>. Un administrador puede cambiar el rol posteriormente.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-60 hover:opacity-90 active:scale-[0.99]"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              boxShadow: '0 4px 14px -3px rgba(109,40,217,0.45)',
            }}
          >
            {isLoading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>Registrarse</span><ArrowRight size={15} /></>
            }
          </button>

          <p className="text-center text-sm text-zinc-400 pt-1">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
