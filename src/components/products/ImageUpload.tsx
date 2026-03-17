import { useRef } from 'react'
import { Upload, X, ImagePlus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../../api/products'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../api/client'
import type { ProductImage } from '../../types'

interface ImageUploadProps {
  productId: string
  images: ProductImage[]
}

export default function ImageUpload({ productId, images }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { mutate: addImage, isPending: isAdding } = useMutation({
    mutationFn: (file: File) => productsApi.addImage(productId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Imagen añadida')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const { mutate: removeImage, isPending: isRemoving } = useMutation({
    mutationFn: (imageId: string) => productsApi.deleteImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Imagen eliminada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    Array.from(files).forEach((file) => addImage(file))
    e.target.value = ''
  }

  const isBusy = isAdding || isRemoving

  return (
    <div className="space-y-3">
      {/* Gallery grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
              <img
                src={img.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeImage(img.id)}
                disabled={isBusy}
                className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all disabled:opacity-30"
                title="Eliminar imagen"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isBusy}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-violet-500 hover:text-violet-600 transition-colors disabled:opacity-50"
      >
        {isAdding ? (
          <span className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <ImagePlus size={18} />
        )}
        {isAdding ? 'Subiendo…' : images.length === 0 ? 'Subir primera imagen' : 'Añadir imagen'}
        {images.length === 0 && <Upload size={14} className="text-gray-400" />}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
