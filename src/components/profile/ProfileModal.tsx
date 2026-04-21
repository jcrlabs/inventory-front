import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMutation } from '@tanstack/react-query'
import Modal from '../common/Modal'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { getErrorMessage } from '../../api/client'
import type { UpdateMeInput } from '../../types'

interface ProfileForm {
  username: string
  email: string
  current_password: string
  new_password: string
  confirm_password: string
}

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      username: user?.username ?? '',
      email: user?.email ?? '',
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  const newPassword = watch('new_password')

  const mutation = useMutation({
    mutationFn: (data: UpdateMeInput) => authApi.updateMe(data),
    onSuccess: (updated) => {
      updateUser(updated)
      toast.success('Perfil actualizado')
      reset({ username: updated.username, email: updated.email, current_password: '', new_password: '', confirm_password: '' })
      onClose()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const onSubmit = (data: ProfileForm) => {
    const payload: UpdateMeInput = {}
    if (data.username !== user?.username) payload.username = data.username
    if (data.email !== user?.email) payload.email = data.email
    if (data.new_password) {
      payload.current_password = data.current_password
      payload.new_password = data.new_password
    }
    if (Object.keys(payload).length === 0) {
      toast('No hay cambios que guardar', { icon: 'ℹ️' })
      return
    }
    mutation.mutate(payload)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar perfil" size="sm">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-zinc-800">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}
        >
          {user?.username?.[0]?.toUpperCase() ?? <User size={18} />}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-zinc-100">{user?.username}</p>
          <p className="text-[11px] text-zinc-500">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Usuario</label>
          <input
            {...register('username', { required: 'Campo obligatorio', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
            autoComplete="username"
          />
          {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">Email</label>
          <input
            {...register('email', {
              required: 'Campo obligatorio',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
            })}
            type="email"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
            autoComplete="email"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="border-t border-zinc-800 pt-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Cambiar contraseña</p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Contraseña actual</label>
              <div className="relative">
                <input
                  {...register('current_password', {
                    validate: (val) => !newPassword || val.length > 0 || 'Requerida para cambiar contraseña',
                  })}
                  type={showCurrent ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.current_password && <p className="mt-1 text-xs text-red-500">{errors.current_password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">
                Nueva contraseña <span className="text-zinc-500 font-normal">(dejar vacío para no cambiar)</span>
              </label>
              <div className="relative">
                <input
                  {...register('new_password', {
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                    pattern: { value: /^(?=.*[a-zA-Z])(?=.*\d)/, message: 'Debe contener letras y números' },
                  })}
                  type={showNew ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-400"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.new_password && <p className="mt-1 text-xs text-red-500">{errors.new_password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Confirmar nueva contraseña</label>
              <input
                {...register('confirm_password', {
                  validate: (val) => !newPassword || val === newPassword || 'Las contraseñas no coinciden',
                })}
                type="password"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 border border-slate-300 rounded-lg hover:bg-zinc-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-5 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {mutation.isPending && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Guardar cambios
          </button>
        </div>
      </form>
    </Modal>
  )
}
