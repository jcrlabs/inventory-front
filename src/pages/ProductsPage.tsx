import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Filter, LayoutGrid, List, Package } from 'lucide-react'
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

export default function ProductsPage() {
  const { canManage, canDelete } = usePermissions()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<ProductFilters>({ page: 1, page_size: 12 })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchInput, setSearchInput] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // Debounce search input so we don't query on every keystroke
  const debouncedSearch = useDebounce(searchInput, 400)
  useEffect(() => {
    setFilters((f) => ({ ...f, search: debouncedSearch || undefined, page: 1 }))
  }, [debouncedSearch])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.list(filters),
    placeholderData: (prev) => prev, // keep previous data while refetching
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} artículos en total</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-medium hover:bg-sky-600 transition-colors"
          >
            <Plus size={18} />
            Nuevo producto
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre, SKU..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {isFetching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          <select
            value={filters.category_id ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                category_id: e.target.value || undefined,
                page: 1,
              }))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={filters.active === undefined ? '' : String(filters.active)}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                active: e.target.value === '' ? undefined : e.target.value === 'true',
                page: 1,
              }))
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-sky-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-sky-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={() => {
              setSearchInput('')
              setFilters({ page: 1, page_size: 12 })
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={14} />
            Limpiar
          </button>
        </div>
      </div>

      {/* Products grid/list */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package className="mx-auto mb-3" size={48} />
          <p className="text-lg font-medium">No se encontraron productos</p>
          {canManage && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 text-sky-500 hover:underline text-sm"
            >
              Crear el primero
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Precio</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Pago</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                {(canManage || canDelete) && (
                  <th className="px-4 py-3" />
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="text-gray-300" size={14} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{product.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.paid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {product.paid ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {(canManage || canDelete) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canManage && (
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="text-sky-500 hover:text-sky-700 text-xs font-medium"
                          >
                            Editar
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
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
          <Pagination
            page={filters.page ?? 1}
            pageSize={filters.page_size ?? 12}
            total={total}
            onChange={(page) => setFilters((f) => ({ ...f, page }))}
          />
        </div>
      )}

      {viewMode === 'grid' && total > (filters.page_size ?? 12) && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200">
          <Pagination
            page={filters.page ?? 1}
            pageSize={filters.page_size ?? 12}
            total={total}
            onChange={(page) => setFilters((f) => ({ ...f, page }))}
          />
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nuevo Producto">
        <ProductForm
          onSubmit={async (data, contact, imageFile) => { await createMutation.mutateAsync({ data, contact, imageFile }) }}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title="Editar Producto"
      >
        {editingProduct && (
          <ProductForm
            product={editingProduct}
            onSubmit={async (data, contact, imageFile) => { await updateMutation.mutateAsync({ id: editingProduct.id, data, contact, imageFile }) }}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
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

