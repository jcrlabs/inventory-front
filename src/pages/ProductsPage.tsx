import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, LayoutGrid, List, Package, X, SlidersHorizontal, ArrowUp, ArrowDown, Tag } from 'lucide-react'
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

const selectClass = "px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400 transition-colors bg-[var(--bg-input)] text-[var(--text-1)] border border-[var(--border)]"

export default function ProductsPage() {
  const { t } = useTranslation()
  const { canManage, canDeleteProduct } = usePermissions()
  const navigate = useNavigate()
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
    mutationFn: async ({ data, contact, imageFiles }: { data: CreateProductInput; contact?: UpsertContactInput; imageFiles?: File[] }) => {
      const created = await productsApi.create(data)
      if (contact) await contactsApi.upsert(created.id, contact)
      if (imageFiles?.length) {
        for (const file of imageFiles) {
          await productsApi.addImage(created.id, file)
        }
      }
      return created
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowCreate(false)
      toast.success(t('products.created'))
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, contact, imageFiles }: { id: string; data: CreateProductInput; contact?: UpsertContactInput; imageFiles?: File[] }) => {
      const updated = await productsApi.update(id, data)
      if (contact) await contactsApi.upsert(id, contact)
      if (imageFiles?.length) {
        for (const file of imageFiles) {
          await productsApi.addImage(id, file)
        }
      }
      return updated
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setEditingProduct(null)
      toast.success(t('products.updated'))
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setDeletingProduct(null)
      toast.success(t('products.deleted'))
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const products = data?.data ?? []
  const total = data?.total ?? 0
  const categories = categoriesData?.data ?? []

  const hasActiveFilters = !!(
    filters.category_id ||
    filters.status ||
    filters.paid !== undefined ||
    (filters.sort_by && filters.sort_by !== 'created_at') ||
    filters.sort_order === 'asc'
  )

  const clearFilters = () => {
    setSearchInput('')
    setFilters({ page: 1, page_size: 12 })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-0.5">Electroteca</p>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">{t('products.title')}</h1>
          <p className="text-xs text-zinc-600 mt-0.5 mb-0.5">{t('products.subtitle')}</p>
          <p className="text-sm text-zinc-500 mt-0.5" aria-live="polite">
            {t(total === 1 ? 'products.items_one' : 'products.items_other', { count: total })}
            {isFetching && !isLoading && (
              <span className="ml-2 inline-block w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin align-middle" role="status" aria-label="Cargando" />
            )}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 14px -3px rgba(245,158,11,0.35)' }}
          >
            <Plus size={17} />
            <span className="hidden sm:inline">{t('products.newProduct')}</span>
            <span className="sm:hidden">{t('products.new')}</span>
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl shadow-none p-3 sm:p-4 mb-5 sm:mb-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Search row — always visible */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={15} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('products.search')}
              aria-label={t('products.searchLabel')}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-400 transition-colors bg-[var(--bg-input)] text-[var(--text-1)] border border-[var(--border)]"
            />
          </div>

          {/* Mobile: toggle filters button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`sm:hidden relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'border-zinc-700 text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            <SlidersHorizontal size={15} />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-zinc-800" />
            )}
          </button>

          {/* View toggle */}
          <div className="hidden sm:flex items-center gap-1 border border-zinc-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
              aria-label={t('products.gridLabel')}
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid size={14} />
              <span className="text-xs font-medium">{t('products.grid')}</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
              aria-label={t('products.listLabel')}
              aria-pressed={viewMode === 'list'}
            >
              <List size={14} />
              <span className="text-xs font-medium">{t('products.list')}</span>
            </button>
          </div>
        </div>

        {/* Category suggestion chips */}
        {searchInput.trim().length >= 1 && categories.filter(c => c.name.toLowerCase().includes(searchInput.toLowerCase())).length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-xs text-zinc-500">Categoría:</span>
            {categories
              .filter(c => c.name.toLowerCase().includes(searchInput.toLowerCase()))
              .map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setFilters(f => ({ ...f, category_id: cat.id, page: 1 })); setSearchInput('') }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <Tag size={10} />
                  {cat.name}
                </button>
              ))}
          </div>
        )}

        {/* Filters row — always visible on sm+, toggleable on mobile */}
        <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-2 mt-2.5 pt-2.5 border-t border-zinc-800`}>
          <div className="flex flex-col gap-1 flex-1 sm:flex-none">
            <label className="text-[11px] font-medium text-zinc-500 px-0.5">{t('products.category')}</label>
            <select
              value={filters.category_id ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, category_id: e.target.value || undefined, page: 1 }))}
              className={selectClass}
            >
              <option value="">{t('products.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-1 sm:flex-none">
            <label className="text-[11px] font-medium text-zinc-500 px-0.5">{t('products.status')}</label>
            <select
              value={filters.status ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value || undefined) as typeof f.status, page: 1 }))}
              className={selectClass}
            >
              <option value="">{t('products.allStatuses')}</option>
              <option value="en_progreso">{t('products.inProgress')}</option>
              <option value="reparado">{t('products.repaired')}</option>
              <option value="no_reparado">{t('products.notRepaired')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-1 sm:flex-none">
            <label className="text-[11px] font-medium text-zinc-500 px-0.5">{t('products.payment')}</label>
            <select
              value={filters.paid === undefined ? '' : String(filters.paid)}
              onChange={(e) => setFilters((f) => ({ ...f, paid: e.target.value === '' ? undefined : e.target.value === 'true', page: 1 }))}
              className={selectClass}
            >
              <option value="">{t('products.allPayments')}</option>
              <option value="true">{t('products.paid')}</option>
              <option value="false">{t('products.pending')}</option>
            </select>
          </div>

          <div className="flex items-end gap-1.5 flex-1 sm:flex-none">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[11px] font-medium text-zinc-500 px-0.5">{t('products.sortBy')}</label>
              <select
                value={filters.sort_by ?? 'created_at'}
                onChange={(e) => setFilters((f) => ({ ...f, sort_by: (e.target.value as typeof f.sort_by) || undefined, page: 1 }))}
                className={`${selectClass} flex-1`}
              >
                <option value="created_at">{t('products.sortCreatedAt')}</option>
                <option value="entry_date">{t('products.sortEntryDate')}</option>
                <option value="exit_date">{t('products.sortExitDate')}</option>
              </select>
            </div>
            <button
              onClick={() => setFilters((f) => ({ ...f, sort_order: f.sort_order === 'asc' ? 'desc' : 'asc', page: 1 }))}
              className={`flex items-center gap-1 px-2.5 py-2 border rounded-lg text-sm font-medium transition-colors ${
                filters.sort_order === 'asc'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'border-zinc-700 text-zinc-400 hover:bg-zinc-900'
              }`}
              aria-label={filters.sort_order === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
            >
              {filters.sort_order === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              <span className="hidden sm:inline text-xs">{filters.sort_order === 'asc' ? 'Asc' : 'Desc'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            {/* Mobile view toggle */}
            <div className="sm:hidden flex items-center gap-1 border border-zinc-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
                aria-label={t('products.gridLabel')}
                aria-pressed={viewMode === 'grid'}
              >
                <LayoutGrid size={14} />
                <span className="text-xs font-medium">{t('products.grid')}</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
                aria-label={t('products.listLabel')}
                aria-pressed={viewMode === 'list'}
              >
                <List size={14} />
                <span className="text-xs font-medium">{t('products.list')}</span>
              </button>
            </div>

            {(hasActiveFilters || searchInput) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-lg hover:bg-zinc-900 transition-colors"
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
        <div className="text-center py-24">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{
              background: hasActiveFilters || searchInput
                ? 'rgba(113,113,122,0.08)'
                : 'rgba(245,158,11,0.07)',
              border: hasActiveFilters || searchInput
                ? '1px solid rgba(113,113,122,0.15)'
                : '1px solid rgba(245,158,11,0.12)',
            }}
          >
            <Package
              size={28}
              className={hasActiveFilters || searchInput ? 'text-zinc-500' : 'text-amber-500/70'}
            />
          </div>
          <p className="text-base font-semibold text-zinc-300 mb-1.5">
            {hasActiveFilters || searchInput ? t('products.noResults') : t('products.empty')}
          </p>
          <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
            {hasActiveFilters || searchInput
              ? t('products.noResultsDesc')
              : t('products.emptyDesc')}
          </p>
          {(hasActiveFilters || searchInput) ? (
            <button
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-zinc-300 border border-zinc-700 hover:bg-zinc-800 transition-colors"
            >
              <X size={14} />
              Limpiar filtros
            </button>
          ) : canManage && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 14px -3px rgba(245,158,11,0.3)' }}
            >
              <Plus size={16} />
              Crear primera reparación
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
        <div className="rounded-2xl shadow-none overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <caption className="sr-only">Lista de productos</caption>
              <thead style={{ background: 'rgba(24,24,27,0.7)', borderBottom: '1px solid rgba(63,63,70,0.6)' }}>
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">{t('products.product')}</th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">{t('products.category')}</th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">{t('products.entryDate')}</th>
                  <th className="text-left px-4 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">{t('products.exitDate')}</th>
                  <th className="text-right px-4 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">{t('products.price')}</th>
                  <th className="text-center px-4 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">{t('products.paymentCol')}</th>
                  <th className="text-center px-4 py-3 font-semibold text-zinc-400 text-xs uppercase tracking-wide">{t('products.statusCol')}</th>
                  {canManage && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-amber-500/5 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/products/${product.id}`)}
                    tabIndex={0}
                    role="row"
                    aria-label={product.name}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/products/${product.id}`) } }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex-shrink-0 overflow-hidden border border-zinc-700/60">
                          {(product.images?.[0]?.image_url ?? product.image_url) ? (
                            <img src={product.images?.[0]?.image_url ?? product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="text-zinc-600" size={13} />
                            </div>
                          )}
                        </div>
                        <p className="font-bold text-zinc-100 text-base group-hover:text-amber-400 transition-colors">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-sm">{product.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-sm">
                      {product.entry_date ? new Date(product.entry_date).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-sm">
                      {product.exit_date ? new Date(product.exit_date).toLocaleDateString('es-ES') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-200">
                      {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${product.paid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {product.paid ? t('products.paid') : t('products.pending')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        product.status === 'reparado' ? 'bg-emerald-500/10 text-emerald-400'
                        : product.status === 'en_progreso' ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-red-500/10 text-red-400'
                      }`}>
                        {product.status === 'reparado' ? t('products.repaired') : product.status === 'en_progreso' ? t('products.inProgress') : t('products.notRepaired')}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingProduct(product) }}
                            className="text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors"
                          >
                            {t('products.edit')}
                          </button>
                          {canDeleteProduct(product) && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingProduct(product) }}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                            >
                              {t('products.delete')}
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
        <div className="mt-5 bg-zinc-800 rounded-2xl border border-zinc-700/80 shadow-none">
          <Pagination
            page={filters.page ?? 1}
            pageSize={filters.page_size ?? 12}
            total={total}
            onChange={(page) => setFilters((f) => ({ ...f, page }))}
          />
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={t('products.createTitle')}>
        <ProductForm
          onSubmit={async (data, contact, imageFiles) => { await createMutation.mutateAsync({ data, contact, imageFiles }) }}
          onCancel={() => setShowCreate(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title={t('products.editTitle')}>
        {editingProduct && (
          <ProductForm
            product={editingProduct}
            onSubmit={async (data, contact, imageFiles) => { await updateMutation.mutateAsync({ id: editingProduct.id, data, contact, imageFiles }) }}
            onCancel={() => setEditingProduct(null)}
            isLoading={updateMutation.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => deletingProduct && deleteMutation.mutate(deletingProduct.id)}
        title={t('products.deleteTitle')}
        message={t('products.deleteConfirm', { name: deletingProduct?.name ?? '' })}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
