import { useState } from 'react'
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
import { usePermissions } from '../hooks/usePermissions'
import { getErrorMessage } from '../api/client'
import type { CreateProductInput, UpsertContactInput } from '../types'

const statusConfig = {
  reparado:    { label: 'Reparado',    Icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.18)' },
  en_progreso: { label: 'En progreso', Icon: Clock,         color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)' },
  no_reparado: { label: 'No reparado', Icon: AlertCircle,   color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.18)' },
}

export default function ProductDetailPage() {
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
    mutationFn: async ({ data, contact, imageFile }: { data: CreateProductInput; contact?: UpsertContactInput; imageFile?: File }) => {
      await productsApi.update(id!, data)
      if (contact) await contactsApi.upsert(id!, contact)
      if (imageFile) await productsApi.uploadImage(id!, imageFile)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowEdit(false)
      toast.success('Producto actualizado')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => productsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Producto eliminado')
      navigate('/products')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-8 text-center">
        <Package className="mx-auto mb-3 text-slate-300" size={40} />
        <p className="text-slate-500 font-medium">Producto no encontrado</p>
        <Link to="/products" className="mt-4 inline-block text-sm font-semibold text-violet-600 hover:underline">
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
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3"
        >
          <ArrowLeft size={15} />
          <span>Volver a productos</span>
        </Link>

        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">{product.name}</h1>
            {product.category && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Tag size={12} className="text-violet-500" />
                <span className="text-sm text-violet-600 font-medium">{product.category.name}</span>
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
              product.paid ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' : 'bg-amber-50 text-amber-600 border border-amber-200/60'
            }`}>
              {product.paid ? 'Pagado' : 'Pendiente'}
            </span>

            {canManage && (
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Edit size={14} />
                <span className="hidden sm:inline">Editar</span>
              </button>
            )}
            {product && canDeleteProduct(product) && (
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Eliminar</span>
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
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                Imágenes
                {product.images && product.images.length > 0 && (
                  <span className="text-xs font-normal text-slate-400">({product.images.length})</span>
                )}
              </h2>
              <ImageUpload productId={product.id} images={product.images ?? []} />
            </div>
          ) : (product.images && product.images.length > 0) ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-4">
              <div className="grid grid-cols-2 gap-2">
                {product.images.map((img) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt={product.name}
                    className="w-full aspect-square object-cover rounded-xl border border-slate-200/60"
                  />
                ))}
              </div>
            </div>
          ) : product.image_url ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
              <img src={product.image_url} alt={product.name} className="w-full aspect-video object-cover" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card aspect-video flex items-center justify-center">
              <Package className="text-slate-200" size={48} />
            </div>
          )}

          {/* Contact card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <UserRound size={14} className="text-slate-400" />
              Contacto del cliente
            </h2>
            {contact ? (
              <div className="space-y-2.5">
                <p className="font-semibold text-slate-900">{contact.name}</p>
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-violet-700 transition-colors"
                  >
                    <Mail size={13} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-violet-700 transition-colors"
                  >
                    <Phone size={13} className="text-slate-400 flex-shrink-0" />
                    {contact.phone}
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">Sin contacto asignado</p>
            )}
          </div>
        </div>

        {/* Right column: details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Price + category */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Información General</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Precio</p>
                <p className="text-2xl font-bold text-slate-900">
                  {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Categoría</p>
                <p className="text-sm font-semibold text-slate-800 mt-2">
                  {product.category?.name ?? '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Descripción</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Metadatos</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <UserRound size={13} className="text-slate-400" />
                  Creado por
                </span>
                <span className="font-semibold text-slate-800">{product.created_by?.username ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar size={13} className="text-slate-400" />
                  Fecha creación
                </span>
                <span className="font-medium text-slate-700">
                  {new Date(product.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2">
                  <Clock size={13} className="text-slate-400" />
                  Última actualización
                </span>
                <span className="font-medium text-slate-700">
                  {new Date(product.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Editar Producto">
        <ProductForm
          product={product}
          onSubmit={async (data, contact, imageFile) => {
            await updateMutation.mutateAsync({ data, contact, imageFile })
          }}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Eliminar producto"
        message={`¿Estás seguro de que quieres eliminar "${product.name}"? Esta acción no se puede deshacer.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
