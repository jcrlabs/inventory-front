import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { ImagePlus, X, UserRound } from 'lucide-react'
import { categoriesApi } from '../../api/categories'
import type { Product, CreateProductInput, UpsertContactInput, ProductStatus } from '../../types'

interface ProductFormProps {
  product?: Product
  onSubmit: (data: CreateProductInput, contact?: UpsertContactInput, imageFiles?: File[]) => Promise<void>
  onCancel?: () => void
  isLoading: boolean
}

const inputCls = [
  'w-full px-3 py-2.5 rounded-xl text-sm',
  'bg-zinc-900 text-zinc-100 placeholder-zinc-600',
  'border border-zinc-700',
  'focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600/50',
  'transition-colors',
].join(' ')

const labelCls = 'block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5'

export default function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

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
        resetContact({ name: product.contact.name, email: product.contact.email ?? '', phone: product.contact.phone ?? '' })
      } else {
        resetContact({ name: '', email: '', phone: '' })
      }
    }
  }, [product, reset, resetContact])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setImageFiles((prev) => [...prev, ...files])
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => ({ url: URL.createObjectURL(f), isExisting: false })),
    ])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    const preview = imagePreviews[index]
    if (!preview.isExisting) {
      const newFileIndex = imagePreviews.slice(0, index).filter((p) => !p.isExisting).length
      setImageFiles((prev) => { const n = [...prev]; n.splice(newFileIndex, 1); return n })
    }
    setImagePreviews((prev) => { const n = [...prev]; n.splice(index, 1); return n })
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
      ? { name: contactData.name.trim(), email: contactData.email?.trim() || undefined, phone: contactData.phone?.trim() || undefined }
      : undefined
    return onSubmit(cleaned, contact, imageFiles.length > 0 ? imageFiles : undefined)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5" noValidate>

      {/* ── Nombre ── */}
      <div>
        <label htmlFor="pf-name" className={labelCls}>
          Nombre <span className="text-red-400 normal-case tracking-normal">*</span>
        </label>
        <input
          id="pf-name"
          {...register('name', { required: 'El nombre es obligatorio' })}
          className={inputCls}
          placeholder="Ej: Lavadora Bosch WAN28163ES"
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'pf-name-err' : undefined}
        />
        {errors.name && (
          <p id="pf-name-err" role="alert" className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>

      {/* ── Referencia ── */}
      <div>
        <label htmlFor="pf-ref" className={labelCls}>
          Referencia <span className="text-zinc-600 normal-case tracking-normal font-normal">(opcional)</span>
        </label>
        <input
          id="pf-ref"
          {...register('repair_reference')}
          className={inputCls}
          placeholder="Ej: REP-2024-001"
        />
      </div>

      {/* ── Descripción ── */}
      <div>
        <label htmlFor="pf-desc" className={labelCls}>Descripción de reparación</label>
        <textarea
          id="pf-desc"
          {...register('repair_description')}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="Describe el problema o la reparación a realizar"
        />
      </div>

      {/* ── Observaciones ── */}
      <div>
        <label htmlFor="pf-obs" className={labelCls}>Observaciones</label>
        <textarea
          id="pf-obs"
          {...register('observations')}
          rows={2}
          className={`${inputCls} resize-none`}
          placeholder="Notas adicionales"
        />
      </div>

      {/* ── Fechas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-entry" className={labelCls}>Fecha de entrada</label>
          <input id="pf-entry" {...register('entry_date')} type="date" className={inputCls}
            style={{ colorScheme: 'dark' }} />
        </div>
        <div>
          <label htmlFor="pf-exit" className={labelCls}>Fecha de salida</label>
          <input id="pf-exit" {...register('exit_date')} type="date" className={inputCls}
            style={{ colorScheme: 'dark' }} />
        </div>
      </div>

      {/* ── Precio + Pagado ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-price" className={labelCls}>Precio (€)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium select-none">€</span>
            <input
              id="pf-price"
              {...register('price', { valueAsNumber: true, min: { value: 0, message: 'El precio debe ser ≥ 0' } })}
              type="number"
              step="0.01"
              className={`${inputCls} pl-7`}
              placeholder="0.00"
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? 'pf-price-err' : undefined}
            />
          </div>
          {errors.price && (
            <p id="pf-price-err" role="alert" className="mt-1.5 text-xs text-red-400">{errors.price.message}</p>
          )}
        </div>

        <div className="flex flex-col justify-end">
          <label className={labelCls}>Pago</label>
          <label htmlFor="pf-paid" className="flex items-center gap-2.5 h-[42px] cursor-pointer select-none">
            <input
              {...register('paid')}
              type="checkbox"
              id="pf-paid"
              className="w-4 h-4 rounded accent-amber-500 cursor-pointer flex-shrink-0"
            />
            <span className="text-sm text-zinc-300">Marcado como pagado</span>
          </label>
        </div>
      </div>

      {/* ── Categoría + Estado ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pf-cat" className={labelCls}>Categoría</label>
          <select id="pf-cat" {...register('category_id')} className={inputCls}>
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pf-status" className={labelCls}>Estado</label>
          <select id="pf-status" {...register('status')} className={inputCls}>
            <option value="en_progreso">En progreso</option>
            <option value="reparado">Reparado</option>
            <option value="no_reparado">No reparado</option>
          </select>
        </div>
      </div>

      {/* ── Imágenes ── */}
      <div>
        <label className={labelCls}>
          Imágenes
          {imagePreviews.length > 0 && (
            <span className="ml-1.5 normal-case tracking-normal font-normal text-zinc-600">({imagePreviews.length})</span>
          )}
        </label>

        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
            {imagePreviews.map((preview, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-zinc-700/60 bg-zinc-900">
                <img src={preview.url} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
                {!preview.isExisting && (
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label={`Eliminar imagen ${i + 1}`}
                    className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-[72px] rounded-xl flex flex-col items-center justify-center gap-1.5 text-zinc-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          style={{
            border: '1.5px dashed rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.02)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'
            e.currentTarget.style.color = '#f59e0b'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
            e.currentTarget.style.color = ''
          }}
        >
          <ImagePlus size={20} />
          <span className="text-xs font-medium">
            {imagePreviews.length > 0 ? 'Añadir más imágenes' : 'Haz clic para añadir imágenes'}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          aria-hidden="true"
        />
      </div>

      {/* ── Contacto ── */}
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <UserRound size={15} className="text-zinc-500" />
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contacto</h3>
          <span className="text-[11px] text-zinc-600">(opcional)</span>
        </div>

        <div>
          <label htmlFor="pf-cname" className={labelCls}>Nombre del cliente</label>
          <input
            id="pf-cname"
            {...registerContact('name', {
              validate: (val) => {
                if (getContactValues('email') || getContactValues('phone')) {
                  if (!val.trim()) return 'El nombre es obligatorio si hay email o teléfono'
                }
                return true
              },
            })}
            className={inputCls}
            placeholder="Nombre del contacto"
            aria-invalid={!!contactErrors.name}
            aria-describedby={contactErrors.name ? 'pf-cname-err' : undefined}
          />
          {contactErrors.name && (
            <p id="pf-cname-err" role="alert" className="mt-1.5 text-xs text-red-400">{contactErrors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="pf-cemail" className={labelCls}>Email</label>
            <input
              id="pf-cemail"
              {...registerContact('email')}
              type="email"
              className={inputCls}
              placeholder="contacto@ejemplo.com"
            />
          </div>
          <div>
            <label htmlFor="pf-cphone" className={labelCls}>Teléfono</label>
            <input
              id="pf-cphone"
              {...registerContact('phone')}
              type="tel"
              className={inputCls}
              placeholder="+34 600 000 000"
            />
          </div>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-zinc-900 transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            boxShadow: '0 4px 16px -4px rgba(245,158,11,0.35)',
          }}
        >
          {isLoading && (
            <span className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" role="status" aria-label="Guardando" />
          )}
          {product ? 'Actualizar producto' : 'Crear producto'}
        </button>
      </div>
    </form>
  )
}
