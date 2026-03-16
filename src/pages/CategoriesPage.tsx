import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Tag, Edit, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { categoriesApi } from '../api/categories'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { usePermissions } from '../hooks/usePermissions'
import { getErrorMessage } from '../api/client'
import type { Category, CreateCategoryInput } from '../types'

function CategoryForm({
  category,
  onSubmit,
  isLoading,
}: {
  category?: Category
  onSubmit: (data: CreateCategoryInput) => Promise<void>
  isLoading: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateCategoryInput>({
    defaultValues: { name: category?.name ?? '', description: category?.description ?? '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name', { required: 'El nombre es obligatorio' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
          placeholder="Nombre de la categoría"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 resize-none"
          placeholder="Descripción de la categoría"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {category ? 'Actualizar' : 'Crear'} categoría
        </button>
      </div>
    </form>
  )
}

export default function CategoriesPage() {
  const { canManage, canDelete } = usePermissions()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowCreate(false)
      toast.success('Categoría creada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCategoryInput }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setEditing(null)
      toast.success('Categoría actualizada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setDeleting(null)
      toast.success('Categoría eliminada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const categories = data?.data ?? []

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.total ?? 0} categorías</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
          >
            <Plus size={18} />
            Nueva categoría
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Tag className="mx-auto mb-3" size={48} />
          <p className="text-lg font-medium">No hay categorías</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Tag className="text-violet-600" size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{category.description}</p>
                    )}
                  </div>
                </div>
                {(canManage || canDelete) && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {canManage && (
                      <button
                        onClick={() => setEditing(category)}
                        className="p-1.5 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-700 transition-colors"
                      >
                        <Edit size={15} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setDeleting(category)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Creada el {new Date(category.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nueva Categoría" size="sm">
        <CategoryForm
          onSubmit={async (data) => { await createMutation.mutateAsync(data) }}
          isLoading={createMutation.isPending}
        />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar Categoría" size="sm">
        {editing && (
          <CategoryForm
            category={editing}
            onSubmit={async (data) => { await updateMutation.mutateAsync({ id: editing.id, data }) }}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Eliminar categoría"
        message={`¿Eliminar la categoría "${deleting?.name}"? Los productos asociados no se eliminarán.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
