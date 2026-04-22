import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Tag, Edit, Trash2, ChevronDown, ChevronRight, Package, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { categoriesApi } from '../api/categories'
import { productsApi } from '../api/products'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Skeleton from '../components/common/Skeleton'
import { usePermissions } from '../hooks/usePermissions'
import { getErrorMessage } from '../api/client'
import type { Category, CreateCategoryInput } from '../types'

const inputClass = "w-full px-3.5 py-2.5 border border-zinc-700 rounded-xl text-sm bg-zinc-800 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400 transition-colors"

function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading,
}: {
  category?: Category
  onSubmit: (data: CreateCategoryInput) => Promise<void>
  onCancel?: () => void
  isLoading: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateCategoryInput>({
    defaultValues: { name: category?.name ?? '', description: category?.description ?? '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name', { required: 'El nombre es obligatorio' })}
          className={inputClass}
          placeholder="Nombre de la categoría"
        />
        {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Descripción</label>
        <textarea
          {...register('description')}
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Descripción de la categoría"
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
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
      <div className="space-y-1.5 py-2 animate-pulse">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 px-1">
            <div className="w-9 h-9 rounded-xl bg-zinc-700/50 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-zinc-700/50 rounded w-2/5" />
              <div className="h-2.5 bg-zinc-700/50 rounded w-1/4" />
            </div>
            <div className="h-5 w-16 bg-zinc-700/50 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return <p className="text-sm text-zinc-500 italic py-4 text-center">Sin productos en esta categoría</p>
  }

  return (
    <div className="divide-y divide-zinc-800">
      {products.map((product) => {
        const firstImage = product.images?.[0]?.image_url ?? product.image_url
        return (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="flex items-center gap-3 py-2.5 px-1 hover:bg-zinc-900/60 rounded-xl transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-800 flex-shrink-0 overflow-hidden border border-zinc-700/50">
              {firstImage ? (
                <img src={firstImage} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="text-zinc-600" size={15} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-amber-400 transition-colors">
                {product.name}
              </p>
              <p className="text-xs text-zinc-500">
                {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                {' · '}
                <span className={product.paid ? 'text-emerald-600' : 'text-amber-600'}>
                  {product.paid ? 'Pagado' : 'Pendiente'}
                </span>
              </p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-semibold ${
              product.status === 'reparado' ? 'bg-emerald-500/10 text-emerald-400'
              : product.status === 'en_progreso' ? 'bg-amber-500/10 text-amber-400'
              : 'bg-red-500/10 text-red-400'
            }`}>
              {product.status === 'reparado' ? 'Reparado' : product.status === 'en_progreso' ? 'En progreso' : 'No reparado'}
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
  const [searchInput, setSearchInput] = useState('')

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
    mutationFn: ({ id, data }: { id: string; data: CreateCategoryInput }) => categoriesApi.update(id, data),
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

  const categories = (data?.data ?? []).filter((c) =>
    !searchInput.trim() || c.name.toLowerCase().includes(searchInput.toLowerCase()) || c.description?.toLowerCase().includes(searchInput.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-0.5">Electroteca</p>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Categorías</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{data?.total ?? 0} categorías</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 14px -3px rgba(245,158,11,0.35)' }}
          >
            <Plus size={17} />
            <span className="hidden sm:inline">Nueva categoría</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="bg-zinc-800 rounded-2xl border border-zinc-700/80 p-3 sm:p-4 mb-5 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={15} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar categoría..."
            className="w-full pl-9 pr-8 py-2 border border-zinc-700 rounded-lg text-sm bg-zinc-800 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400 transition-colors"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="bg-zinc-800 rounded-2xl border border-zinc-700/80 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-700/50 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Tag size={26} className="text-zinc-600" />
          </div>
          <p className="text-base font-semibold text-zinc-400">{searchInput ? 'Sin resultados' : 'No hay categorías'}</p>
          <p className="text-sm text-zinc-500 mt-1">{searchInput ? 'Ninguna categoría coincide con la búsqueda' : 'Crea la primera para organizar tus productos'}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {categories.map((category) => {
            const isOpen = expanded.has(category.id)
            return (
              <div
                key={category.id}
                className="bg-zinc-800 rounded-2xl border border-zinc-700/80 shadow-none overflow-hidden transition-all duration-150"
              >
                {/* Header row */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-900/60 transition-colors select-none"
                  onClick={() => toggleExpand(category.id)}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.14)' }}
                  >
                    <Tag className="text-amber-500" size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-200 text-sm">{category.name}</h3>
                    {category.description && (
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{category.description}</p>
                    )}
                  </div>

                  {(canManage || canDelete) && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {canManage && (
                        <button
                          onClick={() => setEditing(category)}
                          className="p-1.5 rounded-lg hover:bg-amber-500/10 text-zinc-500 hover:text-amber-400 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeleting(category)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}

                  <span className="text-zinc-500 ml-1 flex-shrink-0">
                    {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </span>
                </div>

                {/* Products list */}
                {isOpen && (
                  <div className="border-t border-zinc-800 px-4 py-2">
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
          onCancel={() => setShowCreate(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar Categoría" size="sm">
        {editing && (
          <CategoryForm
            category={editing}
            onSubmit={async (data) => { await updateMutation.mutateAsync({ id: editing.id, data }) }}
            onCancel={() => setEditing(null)}
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
