import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, LayoutGrid, List, Package, X, SlidersHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'
import { productsApi } from '../api/products'
import { contactsApi } from '../api/contacts'
import { categoriesApi } from '../api/categories'
import ProductCard from '../components/products/ProductCard'
import ProductForm from '../components/products/ProductForm'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Pagination from '../components/common/Pagination'
import { ProductCardSkeleton } from '../components/common/Skeleton'
import { usePermissions } from '../hooks/usePermissions'
import { useDebounce } from '../hooks/useDebounce'
import { getErrorMessage } from '../api/client'
import type { Product, CreateProductInput, UpsertContactInput, ProductFilters } from '../types'

const selectClass = "px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 bg-white text-slate-700 transition-colors"

export default function ProductsPage() {
  const { canManage, canDeleteProduct } = usePermissions()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<ProductFilters>({ page: 1, page_size: 12 })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchInput, setSearchInput] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const debouncedSearch = useDebounce(searchInput, 400)
  useEffect(() => {
    setFilters((f) => ({ ...f, search: debouncedSearch || undefined, page: 1 }))
  }, [debouncedSearch])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.list(filters),
    placeholderData: (prev) => prev,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

  const createMutation = useMutation({
    mutationFn: async ({ data, contact, imageFile }: { data: CreateProductInput; contact?: UpsertContactInput; imageFile?: File }) => {
      const created = await productsApi.create(data)
      if (contact) await contactsApi.upsert(created.id, contact)
      if (imageFile) await productsApi.uploadImage(created.id, imageFile)
      return created
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowCreate(false)
      toast.success('Producto creado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, contact, imageFile }: { id: string; data: CreateProductInput; contact?: UpsertContactInput; imageFile?: File }) => {
      const updated = await productsApi.update(id, data)
      if (contact) await contactsApi.upsert(id, contact)
      if (imageFile) await productsApi.uploadImage(id, imageFile)
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setEditingProduct(null)
      toast.success('Producto actualizado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setDeletingProduct(null)
      toast.success('Producto eliminado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const products = data?.data ?? []
  const total = data?.total ?? 0
  const categories = categoriesData?.data ?? []

  const hasActiveFilters = !!(filters.category_id || filters.status || filters.paid !== undefined)

  const clearFilters = () => {
    setSearchInput('')
    setFilters({ page: 1, page_size: 12 })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-0.5">Inventario</p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {total} {total === 1 ? 'artículo' : 'artículos'}
            {isFetching && !isLoading && (
              <span className="ml-2 inline-block w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin align-middle" />
            )}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', boxShadow: '0 4px 14px -3px rgba(109,40,217,0.4)' }}
          >
            <Plus size={17} />
            <span className="hidden sm:inline">Nuevo producto</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-3 sm:p-4 mb-5 sm:mb-6">
        {/* Search row — always visible */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre, SKU..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-400 transition-colors"
            />
          </div>

          {/* Mobile: toggle filters button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-violet-50 border-violet-200 text-violet-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal size={15} />
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 absolute mt-[-8px] ml-4" />
            )}
          </button>

          {/* View toggle */}
          <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Vista cuadrícula"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Vista lista"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Filters row — always visible on sm+, toggleable on mobile */}
        <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row sm:items-center gap-2 mt-2.5 pt-2.5 border-t border-slate-100`}>
          <select
            value={filters.category_id ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, category_id: e.target.value || undefined, page: 1 }))}
            className={`${selectClass} flex-1 sm:flex-none`}
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={filters.status ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value || undefined) as typeof f.status, page: 1 }))}
            className={`${selectClass} flex-1 sm:flex-none`}
          >
            <option value="">Todos los estados</option>
            <option value="en_progreso">En progreso</option>
            <option value="reparado">Reparado</option>
            <option value="no_reparado">No reparado</option>
          </select>

          <select
            value={filters.paid === undefined ? '' : String(filters.paid)}
            onChange={(e) => setFilters((f) => ({ ...f, paid: e.target.value === '' ? undefined : e.target.value === 'true', page: 1 }))}
            className={`${selectClass} flex-1 sm:flex-none`}
          >
            <option value="">Pagado / Pendiente</option>
            <option value="true">Pagado</option>
            <option value="false">Pendiente</option>
          </select>

          <div className="flex items-center gap-2 sm:ml-auto">
            {/* Mobile view toggle */}
            <div className="sm:hidden flex items-center gap-1 border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <List size={15} />
              </button>
            </div>

            {(hasActiveFilters || searchInput) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <X size={13} />
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products grid / list */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-slate-300" />
          </div>
          <p className="text-base font-semibold text-slate-600">No se encontraron productos</p>
          <p className="text-sm text-slate-400 mt-1">
            {hasActiveFilters || searchInput ? 'Prueba a cambiar los filtros' : 'Aún no hay productos creados'}
          </p>
          {canManage && !hasActiveFilters && !searchInput && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
            >
              <Plus size={16} />
              Crear el primero
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={setEditingProduct}
              onDelete={setDeletingProduct}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Producto</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Categoría</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Precio</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Pago</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Estado</th>
                  {canManage && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200/60">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="text-slate-300" size={13} />
                            </div>
                          )}
                        </div>
                        <p className="font-medium text-slate-800">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-sm">{product.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${product.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {product.paid ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        product.status === 'reparado' ? 'bg-emerald-50 text-emerald-600'
                        : product.status === 'en_progreso' ? 'bg-amber-50 text-amber-600'
                        : 'bg-red-50 text-red-600'
                      }`}>
                        {product.status === 'reparado' ? 'Reparado' : product.status === 'en_progreso' ? 'En progreso' : 'No reparado'}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
                          >
                            Editar
                          </button>
                          {canDeleteProduct(product) && (
                            <button
                              onClick={() => setDeletingProduct(product)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={filters.page ?? 1}
            pageSize={filters.page_size ?? 12}
            total={total}
            onChange={(page) => setFilters((f) => ({ ...f, page }))}
          />
        </div>
      )}

      {viewMode === 'grid' && total > (filters.page_size ?? 12) && (
        <div className="mt-5 bg-white rounded-2xl border border-slate-200/80 shadow-card">
          <Pagination
            page={filters.page ?? 1}
            pageSize={filters.page_size ?? 12}
            total={total}
            onChange={(page) => setFilters((f) => ({ ...f, page }))}
          />
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Producto">
        <ProductForm
          onSubmit={async (data, contact, imageFile) => { await createMutation.mutateAsync({ data, contact, imageFile }) }}
          isLoading={createMutation.isPending}
        />
      </Modal>

      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title="Editar Producto">
        {editingProduct && (
          <ProductForm
            product={editingProduct}
            onSubmit={async (data, contact, imageFile) => { await updateMutation.mutateAsync({ id: editingProduct.id, data, contact, imageFile }) }}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => deletingProduct && deleteMutation.mutate(deletingProduct.id)}
        title="Eliminar producto"
        message={`¿Estás seguro de que quieres eliminar "${deletingProduct?.name}"? Esta acción no se puede deshacer.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
