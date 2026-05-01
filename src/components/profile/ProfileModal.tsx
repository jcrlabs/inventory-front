import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, User, Sun, Moon, Languages } from 'lucide-react'
import toast from 'react-hot-toast'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Modal from '../common/Modal'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { useSettingsStore } from '../../store/settingsStore'
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

const LOCALES = ['es', 'en', 'gl'] as const

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const { theme, toggleTheme, locale, setLocale } = useSettingsStore()
  const { t, i18n } = useTranslation()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const isDark = theme === 'dark'

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ProfileForm>({
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
      toast.success(t('profile.saved'))
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
      toast(t('profile.noChanges'), { icon: 'ℹ️' })
      return
    }
    mutation.mutate(payload)
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-600/40 transition-colors"
  const inputStyle = { background: 'var(--bg-input)', color: 'var(--text-1)', border: '1px solid var(--border-md)' }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('profile.title')} size="sm">
      {/* User info header */}
      <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}>
          {user?.username?.[0]?.toUpperCase() ?? <User size={18} />}
        </div>
        <div>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--text-1)' }}>{user?.username}</p>
          <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-2)' }}>{t('profile.username')}</label>
          <input {...register('username', { required: t('profile.usernameMin'), minLength: { value: 3, message: t('profile.usernameMin') } })}
            className={inputClass} style={inputStyle} autoComplete="username" />
          {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-2)' }}>{t('profile.email')}</label>
          <input {...register('email', { required: t('login.required'), pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('profile.invalidEmail') } })}
            type="email" className={inputClass} style={inputStyle} autoComplete="email" />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Change password */}
        <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-2)' }}>{t('profile.changePassword')}</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-2)' }}>{t('profile.currentPassword')}</label>
              <div className="relative">
                <input {...register('current_password', { validate: (val) => !newPassword || val.length > 0 || t('profile.passwordRequired') })}
                  type={showCurrent ? 'text' : 'password'} className={`${inputClass} pr-10`} style={inputStyle}
                  placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--text-3)' }}>
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.current_password && <p className="mt-1 text-xs text-red-500">{errors.current_password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-2)' }}>
                {t('profile.newPassword')} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>{t('profile.newPasswordHint')}</span>
              </label>
              <div className="relative">
                <input {...register('new_password', { minLength: { value: 8, message: t('profile.passwordMin') }, pattern: { value: /^(?=.*[a-zA-Z])(?=.*\d)/, message: t('profile.passwordPattern') } })}
                  type={showNew ? 'text' : 'password'} className={`${inputClass} pr-10`} style={inputStyle}
                  placeholder="••••••••" autoComplete="new-password" />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'var(--text-3)' }}>
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.new_password && <p className="mt-1 text-xs text-red-500">{errors.new_password.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-2)' }}>{t('profile.confirmPassword')}</label>
              <input {...register('confirm_password', { validate: (val) => !newPassword || val === newPassword || t('profile.passwordMismatch') })}
                type="password" className={inputClass} style={inputStyle}
                placeholder="••••••••" autoComplete="new-password" />
              {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password.message}</p>}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-2)' }}>{t('profile.preferences')}</p>
          <div className="space-y-3">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{t('profile.theme')}</span>
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <button type="button" onClick={() => !isDark || toggleTheme()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: !isDark ? '#f59e0b' : 'transparent', color: !isDark ? '#18181b' : 'var(--text-3)' }}>
                  <Sun size={11} />{t('profile.themeLight')}
                </button>
                <button type="button" onClick={() => isDark || toggleTheme()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: isDark ? '#27272a' : 'transparent', color: isDark ? 'var(--text-1)' : 'var(--text-3)' }}>
                  <Moon size={11} />{t('profile.themeDark')}
                </button>
              </div>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-2)' }}>
                <Languages size={12} />{t('profile.language')}
              </span>
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {LOCALES.map((l) => (
                  <button key={l} type="button"
                    onClick={() => { setLocale(l); i18n.changeLanguage(l) }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all"
                    style={{ background: locale === l ? '#f59e0b' : 'transparent', color: locale === l ? '#18181b' : 'var(--text-3)' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg transition-colors"
            style={{ color: 'var(--text-2)', border: '1px solid var(--border-md)', background: 'transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            {t('profile.cancel')}
          </button>
          <button type="submit" disabled={mutation.isPending}
            className="px-5 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2 transition-colors">
            {mutation.isPending && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {t('profile.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
