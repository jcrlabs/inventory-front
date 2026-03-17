import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { ImagePlus, X, UserRound } from 'lucide-react'
import { categoriesApi } from '../../api/categories'
import type { Product, CreateProductInput, UpsertContactInput, ProductStatus } from '../../types'

interface ProductFormProps {
  product?: Product
  onSubmit: (data: CreateProductInput, contact?: UpsertContactInput, imageFile?: File) => Promise<void>
  isLoading: boolean
}

export default function ProductForm({ product, onSubmit, isLoading }: ProductFormProps) {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductInput>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category_id: undefined,
      paid: false,
      status: 'en_progreso' as ProductStatus,
    },
  })

  const {
    register: registerContact,
    reset: resetContact,
    formState: { errors: contactErrors },
    getValues: getContactValues,
  } = useForm<UpsertContactInput>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        category_id: product.category_id ?? undefined,
        paid: product.paid,
        status: (product.status as ProductStatus) ?? 'en_progreso',
      })
      setImagePreview(product.image_url ?? null)
      setImageFile(null)

      if (product.contact) {
        resetContact({
          name: product.contact.name,
          email: product.contact.email ?? '',
          phone: product.contact.phone ?? '',
        })
      } else {
        resetContact({ name: '', email: '', phone: '' })
      }
    }
  }, [product, reset, resetContact])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const categories = categoriesData?.data ?? []

  const onFormSubmit = (data: CreateProductInput) => {
    const cleaned: CreateProductInput = {
      ...data,
      category_id: data.category_id || undefined,
    }

    const contactData = getContactValues()
    const hasContact = contactData.name.trim() !== ''
    const contact: UpsertContactInput | undefined = hasContact
      ? {
          name: contactData.name.trim(),
          email: contactData.email?.trim() || undefined,
          phone: contactData.phone?.trim() || undefined,
        }
      : undefined

    return onSubmit(cleaned, contact, imageFile ?? undefined)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name', { required: 'El nombre es obligatorio' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
          placeholder="Nombre del producto"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 resize-none"
          placeholder="Descripción del producto"
        />
      </div>

      {/* Price + Paid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            <input
              {...register('price', {
                required: true,
                valueAsNumber: true,
                min: { value: 0, message: 'El precio debe ser ≥ 0' },
              })}
              type="number"
              step="0.01"
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
              placeholder="0.00"
            />
          </div>
          {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            {...register('paid')}
            type="checkbox"
            id="paid"
            className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-600"
          />
          <label htmlFor="paid" className="text-sm text-gray-700">Pagado</label>
        </div>
      </div>

      {/* Category + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            {...register('category_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 bg-white"
          >
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 bg-white"
          >
            <option value="en_progreso">En progreso</option>
            <option value="reparado">Reparado</option>
            <option value="no_reparado">No reparado</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
        {imagePreview ? (
          <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
            <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-white/80 rounded-full text-gray-600 hover:bg-white hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-violet-500 hover:text-violet-500 transition-colors"
          >
            <ImagePlus size={24} />
            <span className="text-sm">Haz clic para subir una imagen</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* Contact section */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <UserRound size={16} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Contacto</h3>
          <span className="text-xs text-gray-400">(opcional)</span>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              {...registerContact('name', {
                validate: (val) => {
                  if (getContactValues('email') || getContactValues('phone')) {
                    if (!val.trim()) return 'El nombre es obligatorio si hay email o teléfono'
                  }
                  return true
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-600 bg-white"
              placeholder="Nombre del contacto"
            />
            {contactErrors.name && (
              <p className="mt-1 text-xs text-red-500">{contactErrors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                {...registerContact('email')}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-600 bg-white"
                placeholder="contacto@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
              <input
                {...registerContact('phone')}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-600 bg-white"
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading && (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {product ? 'Actualizar' : 'Crear'} producto
        </button>
      </div>
    </form>
  )
}
