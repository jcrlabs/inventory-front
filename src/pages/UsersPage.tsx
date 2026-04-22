import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { usersApi } from '../api/users'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Badge from '../components/common/Badge'
import { getErrorMessage } from '../api/client'
import { useAuthStore } from '../store/authStore'
import type { User, CreateUserInput, UpdateUserInput, Role } from '../types'

const roleBadgeVariant = (role: Role) => {
  if (role === 'admin') return 'error'
  if (role === 'manager') return 'warning'
  return 'info'
}

const roleLabels: Record<Role, string> = {
  admin: 'Administrador',
  manager: 'Gestor',
  viewer: 'Visualizador',
}

const inputClass = "w-full px-3.5 py-2.5 border border-zinc-700 rounded-xl text-sm bg-zinc-800 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400 transition-colors"

function UserForm({
  user,
  onSubmit,
  isLoading,
}: {
  user?: User
  onSubmit: (data: CreateUserInput | UpdateUserInput) => Promise<void>
  isLoading: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateUserInput>({
    defaultValues: {
      username: user?.username ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'viewer',
      password: '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Usuario <span className="text-red-500">*</span>
          </label>
          <input
            {...register('username', { required: !user, minLength: 3 })}
            className={inputClass}
            placeholder="nombre de usuario"
          />
          {errors.username && <p className="mt-1.5 text-xs text-red-500">Mínimo 3 caracteres</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email', { required: !user, pattern: /^\S+@\S+\.\S+$/ })}
            type="email"
            className={inputClass}
            placeholder="user@ejemplo.com"
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-500">Email inválido</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
          Contraseña {!user && <span className="text-red-500">*</span>}
          {user && <span className="text-zinc-500 font-normal text-xs ml-1">(dejar vacío para no cambiar)</span>}
        </label>
        <input
          {...register('password', {
            required: !user ? 'Campo obligatorio' : false,
            minLength: !user ? { value: 8, message: 'Mínimo 8 caracteres' } : undefined,
            pattern: !user ? { value: /^(?=.*[a-zA-Z])(?=.*\d)/, message: 'Debe contener letras y números' } : undefined,
          })}
          type="password"
          className={inputClass}
          placeholder="••••••••"
        />
        {!user && <p className="mt-1.5 text-xs text-zinc-500">Mínimo 8 caracteres, debe incluir letras y números</p>}
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Rol</label>
        <select
          {...register('role', { required: true })}
          className="w-full px-3.5 py-2.5 border border-zinc-700 rounded-xl text-sm bg-zinc-800 text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400 transition-colors"
        >
          <option value="viewer">Visualizador</option>
          <option value="manager">Gestor</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
        >
          {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {user ? 'Actualizar' : 'Crear'} usuario
        </button>
      </div>
    </form>
  )
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const [editing, setEditing] = useState<User | null>(null)
  const [deleting, setDeleting] = useState<User | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowCreate(false)
      toast.success('Usuario creado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setEditing(null)
      toast.success('Usuario actualizado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setDeleting(null)
      toast.success('Usuario eliminado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const users = data?.data ?? []

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-0.5">Administración</p>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Usuarios</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{data?.total ?? 0} usuarios registrados</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 4px 14px -3px rgba(109,40,217,0.4)' }}
        >
          <Plus size={17} />
          <span className="hidden sm:inline">Nuevo usuario</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-zinc-800 rounded-2xl border border-zinc-700/80 shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[580px]">
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">Usuario</th>
                  <th className="text-left px-5 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide hidden sm:table-cell">Email</th>
                  <th className="text-left px-5 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">Rol</th>
                  <th className="text-left px-5 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide hidden md:table-cell">Estado</th>
                  <th className="text-left px-5 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide hidden lg:table-cell">Último acceso</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                          style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}
                        >
                          {user.username?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-200">{user.username}</p>
                          {user.id === currentUser?.id && (
                            <span className="text-xs text-amber-500 font-medium">(tú)</span>
                          )}
                          {/* Email shown below name on small screens */}
                          <p className="text-xs text-zinc-500 sm:hidden mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400 hidden sm:table-cell">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Shield size={12} className={
                          user.role === 'admin' ? 'text-red-500' :
                          user.role === 'manager' ? 'text-amber-500' : 'text-blue-500'
                        } />
                        <Badge variant={roleBadgeVariant(user.role)}>
                          {roleLabels[user.role]}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <Badge variant={user.active ? 'success' : 'error'}>
                        {user.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 text-xs hidden lg:table-cell">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString('es-ES')
                        : 'Nunca'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setEditing(user)}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors"
                        >
                          Editar
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => setDeleting(user)}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center">
                      <Users className="mx-auto mb-3 text-slate-200" size={36} />
                      <p className="text-zinc-400 font-medium">No hay usuarios</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Usuario" size="sm">
        <UserForm
          onSubmit={async (data) => { await createMutation.mutateAsync(data as CreateUserInput) }}
          isLoading={createMutation.isPending}
        />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar Usuario" size="sm">
        {editing && (
          <UserForm
            user={editing}
            onSubmit={async (data) => { await updateMutation.mutateAsync({ id: editing.id, data }) }}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Eliminar usuario"
        message={`¿Eliminar al usuario "${deleting?.username}"?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
