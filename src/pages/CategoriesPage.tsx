import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Tag, Edit, Trash2, ChevronDown, ChevronRight, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { categoriesApi } from '../api/categories'
import { productsApi } from '../api/products'
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

function CategoryProducts({ categoryId }: { categoryId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['products', { category_id: categoryId, page: 1, page_size: 50 }],
    queryFn: () => productsApi.list({ category_id: categoryId, page: 1, page_size: 50 }),
  })

  const products = data?.data ?? []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <span className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-4 text-center">Sin productos en esta categoría</p>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {products.map((product) => {
        const firstImage = product.images?.[0]?.image_url ?? product.image_url
        return (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="flex items-center gap-3 py-2.5 px-1 hover:bg-violet-50 rounded-lg transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
              {firstImage ? (
                <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="text-gray-300" size={16} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-violet-700 transition-colors">
                {product.name}
              </p>
              <p className="text-xs text-gray-500">
                {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                {' · '}
                <span className={product.paid ? 'text-green-600' : 'text-amber-600'}>
                  {product.paid ? 'Pagado' : 'Pendiente'}
                </span>
              </p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${product.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {product.active ? 'Activo' : 'Inactivo'}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

export default function CategoriesPage() {
  const { canManage, canDelete } = usePermissions()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

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

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const categories = data?.data ?? []

  return (
    <div className="p-4 sm:p-6 lg:p-8">
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
        <div className="space-y-3">
          {categories.map((category) => {
            const isOpen = expanded.has(category.id)
            return (
              <div key={category.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header row */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none"
                  onClick={() => toggleExpand(category.id)}
                >
                  <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Tag className="text-violet-600" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 truncate">{category.description}</p>
                    )}
                  </div>
                  {(canManage || canDelete) && (
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                  <span className="text-gray-400 ml-1">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                </div>

                {/* Products list */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-4 py-2">
                    <CategoryProducts categoryId={category.id} />
                  </div>
                )}
              </div>
            )
          })}
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
