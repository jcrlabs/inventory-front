import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit, Trash2, Package, Phone, Mail, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { productsApi } from '../api/products'
import { contactsApi } from '../api/contacts'
import ProductForm from '../components/products/ProductForm'
import ImageUpload from '../components/products/ImageUpload'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import Badge from '../components/common/Badge'
import { usePermissions } from '../hooks/usePermissions'
import { getErrorMessage } from '../api/client'
import type { CreateProductInput, UpsertContactInput } from '../types'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canManage, canDelete } = usePermissions()
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Producto no encontrado</p>
        <Link to="/products" className="mt-4 text-violet-600 hover:underline inline-block">
          Volver a productos
        </Link>
      </div>
    )
  }

  const contact = product.contact

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/products"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={product.active ? 'success' : 'error'}>
            {product.active ? 'Activo' : 'Inactivo'}
          </Badge>
          <Badge variant={product.paid ? 'success' : 'warning'}>
            {product.paid ? 'Pagado' : 'Pendiente'}
          </Badge>
          {canManage && (
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Edit size={16} />
              Editar
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image */}
        <div className="lg:col-span-1 space-y-6">
          {canManage ? (
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-2">Imagen del producto</h2>
              <ImageUpload productId={product.id} currentImageUrl={product.image_url} />
            </div>
          ) : product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full aspect-video object-cover rounded-xl border border-gray-200"
            />
          ) : (
            <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
              <Package className="text-gray-300" size={48} />
            </div>
          )}

          {/* Contact card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <UserRound size={16} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-900">Contacto</h2>
            </div>
            {contact ? (
              <div className="space-y-2">
                <div>
                  <p className="text-base font-semibold text-gray-900">{contact.name}</p>
                  <p className="text-xs text-violet-700 font-medium">{contact.subdato}</p>
                </div>
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-violet-700 transition-colors"
                  >
                    <Mail size={14} className="flex-shrink-0" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-violet-700 transition-colors"
                  >
                    <Phone size={14} className="flex-shrink-0" />
                    {contact.phone}
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Sin contacto asignado</p>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Información General</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Precio</dt>
                <dd className="text-xl font-bold text-gray-900 mt-1">
                  {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoría</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">
                  {product.category?.name ?? '—'}
                </dd>
              </div>
            </dl>
          </div>

          {product.description && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-2">Descripción</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Metadatos</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Creado por</dt>
                <dd className="font-medium text-gray-900">{product.created_by?.username ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Fecha creación</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(product.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Última actualización</dt>
                <dd className="font-medium text-gray-900">
                  {new Date(product.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
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
