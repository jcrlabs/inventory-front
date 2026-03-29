import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { ImagePlus, X, UserRound } from 'lucide-react'
import { categoriesApi } from '../../api/categories'
import type { Product, CreateProductInput, UpsertContactInput, ProductStatus } from '../../types'

interface ProductFormProps {
  product?: Product
  onSubmit: (data: CreateProductInput, contact?: UpsertContactInput, imageFiles?: File[]) => Promise<void>
  isLoading: boolean
}

export default function ProductForm({ product, onSubmit, isLoading }: ProductFormProps) {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

  // Multi-image state
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<{ url: string; isExisting: boolean }[]>(() => {
    if (product) {
      const imgs: { url: string; isExisting: boolean }[] = []
      product.images?.forEach((img) => { if (img.image_url) imgs.push({ url: img.image_url, isExisting: true }) })
      if (imgs.length === 0 && product.image_url) imgs.push({ url: product.image_url, isExisting: true })
      return imgs
    }
    return []
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductInput>({
    defaultValues: {
      name: '',
      repair_description: '',
      repair_reference: '',
      entry_date: '',
      exit_date: '',
      observations: '',
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
    defaultValues: { name: '', email: '', phone: '' },
  })

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        repair_description: product.repair_description,
        repair_reference: product.repair_reference ?? '',
        entry_date: product.entry_date ? product.entry_date.substring(0, 10) : '',
        exit_date: product.exit_date ? product.exit_date.substring(0, 10) : '',
        observations: product.observations ?? '',
        price: product.price,
        category_id: product.category_id ?? undefined,
        paid: product.paid,
        status: (product.status as ProductStatus) ?? 'en_progreso',
      })

      const imgs: { url: string; isExisting: boolean }[] = []
      product.images?.forEach((img) => { if (img.image_url) imgs.push({ url: img.image_url, isExisting: true }) })
      if (imgs.length === 0 && product.image_url) imgs.push({ url: product.image_url, isExisting: true })
      setImagePreviews(imgs)
      setImageFiles([])

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const newFiles = [...imageFiles, ...files]
    const newPreviews = [
      ...imagePreviews,
      ...files.map((f) => ({ url: URL.createObjectURL(f), isExisting: false })),
    ]
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    const preview = imagePreviews[index]
    if (!preview.isExisting) {
      // Track how many non-existing previews are before this index to find the file
      const newFileIndex = imagePreviews.slice(0, index).filter((p) => !p.isExisting).length
      const newFiles = [...imageFiles]
      newFiles.splice(newFileIndex, 1)
      setImageFiles(newFiles)
    }
    const newPreviews = [...imagePreviews]
    newPreviews.splice(index, 1)
    setImagePreviews(newPreviews)
  }

  const categories = categoriesData?.data ?? []

  const onFormSubmit = (data: CreateProductInput) => {
    const isEdit = !!product
    const cleaned: CreateProductInput = {
      ...data,
      category_id: data.category_id || undefined,
      repair_reference: data.repair_reference || undefined,
      entry_date: isEdit ? (data.entry_date || null) : (data.entry_date || undefined),
      exit_date: isEdit ? (data.exit_date || null) : (data.exit_date || undefined),
      observations: data.observations || undefined,
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

    return onSubmit(cleaned, contact, imageFiles.length > 0 ? imageFiles : undefined)
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name', { required: 'El nombre es obligatorio' })}
          className={inputClass}
          placeholder="Nombre del producto"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Repair Reference */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Referencia de reparación <span className="text-xs text-gray-400">(opcional)</span>
        </label>
        <input
          {...register('repair_reference')}
          className={inputClass}
          placeholder="Ej: REP-2024-001"
        />
      </div>

      {/* Repair Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de reparación</label>
        <textarea
          {...register('repair_description')}
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder="Descripción de la reparación"
        />
      </div>

      {/* Observations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
        <textarea
          {...register('observations')}
          rows={2}
          className={`${inputClass} resize-none`}
          placeholder="Observaciones adicionales"
        />
      </div>

      {/* Entry / Exit dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de entrada en taller</label>
          <input
            {...register('entry_date')}
            type="date"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de salida del taller</label>
          <input
            {...register('exit_date')}
            type="date"
            className={inputClass}
          />
        </div>
      </div>

      {/* Price + Paid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            <input
              {...register('price', {
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
              <option key={cat.id} value={cat.id}>{cat.name}</option>
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

      {/* Images — multi-upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes
          {imagePreviews.length > 0 && (
            <span className="ml-1.5 text-xs font-normal text-gray-400">({imagePreviews.length})</span>
          )}
        </label>

        {/* Preview grid */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {imagePreviews.map((preview, i) => (
              <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <img
                  src={preview.url}
                  alt={`imagen ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {!preview.isExisting && (
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add more images button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-violet-500 hover:text-violet-500 transition-colors"
        >
          <ImagePlus size={20} />
          <span className="text-xs">
            {imagePreviews.length > 0 ? 'Añadir más imágenes' : 'Haz clic para subir imágenes'}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
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
