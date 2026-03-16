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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Usuario <span className="text-red-500">*</span>
          </label>
          <input
            {...register('username', { required: !user, minLength: 3 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
            placeholder="username"
          />
          {errors.username && <p className="mt-1 text-xs text-red-500">Mínimo 3 caracteres</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email', { required: !user, pattern: /^\S+@\S+\.\S+$/ })}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
            placeholder="user@ejemplo.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">Email inválido</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña {!user && <span className="text-red-500">*</span>}
          {user && <span className="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>}
        </label>
        <input
          {...register('password', { required: !user, minLength: user ? 0 : 8 })}
          type="password"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
          placeholder="••••••••"
        />
        {errors.password && <p className="mt-1 text-xs text-red-500">Mínimo 8 caracteres</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
        <select
          {...register('role', { required: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 bg-white"
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
          className="px-6 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
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
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      usersApi.update(id, data),
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.total ?? 0} usuarios registrados</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
        >
          <Plus size={18} />
          Nuevo usuario
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Usuario</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Rol</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Último acceso</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-600 uppercase">
                          {user.username?.[0] ?? '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-violet-600">(tú)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Shield size={13} className={
                        user.role === 'admin' ? 'text-red-500' :
                        user.role === 'manager' ? 'text-amber-500' : 'text-blue-500'
                      } />
                      <Badge variant={roleBadgeVariant(user.role)}>
                        {roleLabels[user.role]}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.active ? 'success' : 'error'}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString('es-ES')
                      : 'Nunca'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditing(user)}
                        className="text-violet-600 hover:text-sky-700 text-xs font-medium"
                      >
                        Editar
                      </button>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => setDeleting(user)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
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
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Users className="mx-auto mb-2" size={32} />
                    No hay usuarios
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
