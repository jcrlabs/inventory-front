import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit, Trash2, Package, Phone, Mail, UserRound, Clock, CheckCircle2, AlertCircle, Calendar, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { productsApi } from '../api/products'
import { contactsApi } from '../api/contacts'
import ProductForm from '../components/products/ProductForm'
import ImageUpload from '../components/products/ImageUpload'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { ProductDetailSkeleton } from '../components/common/Skeleton'
import { usePermissions } from '../hooks/usePermissions'
import { getErrorMessage } from '../api/client'
import type { CreateProductInput, UpsertContactInput } from '../types'

const statusConfig = {
  reparado:    { label: 'Reparado',    Icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.18)' },
  en_progreso: { label: 'En progreso', Icon: Clock,         color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)' },
  no_reparado: { label: 'No reparado', Icon: AlertCircle,   color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.18)' },
}

export default function ProductDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canManage, canDeleteProduct } = usePermissions()
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id!),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: async ({ data, contact, imageFiles }: { data: CreateProductInput; contact?: UpsertContactInput; imageFiles?: File[] }) => {
      await productsApi.update(id!, data)
      if (contact) await contactsApi.upsert(id!, contact)
      if (imageFiles?.length) {
        for (const file of imageFiles) {
          await productsApi.addImage(id!, file)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowEdit(false)
      toast.success(t('productDetail.updated'))
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => productsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('productDetail.deleted'))
      navigate('/products')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (!product) {
    return (
      <div className="p-8 text-center">
        <Package className="mx-auto mb-3 text-zinc-600" size={40} />
        <p className="text-zinc-400 font-medium">Producto no encontrado</p>
        <Link to="/products" className="mt-4 inline-block text-sm font-semibold text-amber-600 hover:underline">
          Volver a productos
        </Link>
      </div>
    )
  }

  const contact = product.contact
  const status = statusConfig[product.status as keyof typeof statusConfig] ?? statusConfig.no_reparado
  const StatusIcon = status.Icon

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Back + title + actions */}
      <div className="mb-5 sm:mb-6">
        {/* Back link */}
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-3"
        >
          <ArrowLeft size={15} />
          <span>{t('productDetail.backToProducts')}</span>
        </Link>

        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 leading-tight">{product.name}</h1>
            {product.category && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Tag size={12} className="text-amber-500" />
                <span className="text-sm text-amber-600 font-medium">{product.category.name}</span>
              </div>
            )}
          </div>

          {/* Badges + actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status badge */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}
            >
              <StatusIcon size={12} />
              {status.label}
            </span>

            {/* Paid badge */}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              product.paid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {product.paid ? 'Pagado' : 'Pendiente'}
            </span>

            {canManage && (
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition-colors"
              >
                <Edit size={14} />
                Editar
              </button>
            )}
            {product && canDeleteProduct(product) && (
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column: images + contact */}
        <div className="space-y-4">
          {/* Images */}
          {canManage ? (
            <div className="rounded-2xl shadow-none p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h2 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                Imágenes
                {product.images && product.images.length > 0 && (
                  <span className="text-xs font-normal text-zinc-500">({product.images.length})</span>
                )}
              </h2>
              <ImageUpload productId={product.id} images={product.images ?? []} />
            </div>
          ) : (product.images && product.images.length > 0) ? (
            <div className="bg-zinc-800 rounded-2xl border border-zinc-700/80 shadow-none p-4">
              <div className="grid grid-cols-2 gap-2">
                {product.images.map((img) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt={product.name}
                    className="w-full aspect-square object-cover rounded-xl border border-zinc-700/60"
                  />
                ))}
              </div>
            </div>
          ) : product.image_url ? (
            <div className="bg-zinc-800 rounded-2xl border border-zinc-700/80 shadow-none overflow-hidden">
              <img src={product.image_url} alt={product.name} className="w-full aspect-video object-cover" />
            </div>
          ) : (
            <div className="bg-zinc-800 rounded-2xl border border-zinc-700/80 shadow-none aspect-video flex items-center justify-center">
              <Package className="text-zinc-600" size={48} />
            </div>
          )}

          {/* Contact card */}
          <div className="bg-zinc-800 rounded-2xl border border-zinc-700/80 shadow-none p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
              <UserRound size={14} className="text-zinc-500" />
              Contacto del cliente
            </h2>
            {contact ? (
              <div className="space-y-2.5">
                <p className="font-semibold text-zinc-100">{contact.name}</p>
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-700 transition-colors"
                  >
                    <Mail size={13} className="text-zinc-500 flex-shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-700 transition-colors"
                  >
                    <Phone size={13} className="text-zinc-500 flex-shrink-0" />
                    {contact.phone}
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 italic">Sin contacto asignado</p>
            )}
          </div>
        </div>

        {/* Right column: details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Price + category */}
          <div className="bg-zinc-800 rounded-2xl border border-zinc-700/80 shadow-none p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Información General</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Precio</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Categoría</p>
                <p className="text-sm font-semibold text-zinc-200 mt-2">
                  {product.category?.name ?? '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Repair Reference */}
          {product.repair_reference && (
            <div className="rounded-2xl shadow-none p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h2 className="text-sm font-semibold text-zinc-300 mb-2">Referencia de reparación</h2>
              <p className="text-sm font-mono text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg inline-block border border-amber-500/20">{product.repair_reference}</p>
            </div>
          )}

          {/* Repair Description */}
          {product.repair_description && (
            <div className="rounded-2xl shadow-none p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h2 className="text-sm font-semibold text-zinc-300 mb-3">Descripción de reparación</h2>
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{product.repair_description}</p>
            </div>
          )}

          {/* Observations */}
          {product.observations && (
            <div className="rounded-2xl shadow-none p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h2 className="text-sm font-semibold text-zinc-300 mb-3">Observaciones</h2>
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{product.observations}</p>
            </div>
          )}

          {/* Workshop dates */}
          {(product.entry_date || product.exit_date) && (
            <div className="rounded-2xl shadow-none p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h2 className="text-sm font-semibold text-zinc-300 mb-4">Fechas de electroteca</h2>
              <div className="space-y-3">
                {product.entry_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Calendar size={13} className="text-zinc-500" />
                      Entrada en electroteca
                    </span>
                    <span className="font-medium text-zinc-300">
                      {new Date(product.entry_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
                {product.exit_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Calendar size={13} className="text-zinc-500" />
                      Salida de electroteca
                    </span>
                    <span className="font-medium text-zinc-300">
                      {new Date(product.exit_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-zinc-800 rounded-2xl border border-zinc-700/80 shadow-none p-5">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Metadatos</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-2">
                  <UserRound size={13} className="text-zinc-500" />
                  Creado por
                </span>
                <span className="font-semibold text-zinc-200">{product.created_by?.username ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Calendar size={13} className="text-zinc-500" />
                  Fecha creación
                </span>
                <span className="font-medium text-zinc-300">
                  {new Date(product.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Clock size={13} className="text-zinc-500" />
                  Última actualización
                </span>
                <span className="font-medium text-zinc-300">
                  {new Date(product.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title={t('productDetail.editTitle')}>
        <ProductForm
          product={product}
          onSubmit={async (data, contact, imageFiles) => {
            await updateMutation.mutateAsync({ data, contact, imageFiles })
          }}
          onCancel={() => setShowEdit(false)}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title={t('productDetail.deleteTitle')}
        message={t('productDetail.deleteConfirm', { name: product.name })}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
