import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../../api/products'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../api/client'

interface ImageUploadProps {
  productId: string
  currentImageUrl?: string
}

export default function ImageUpload({ productId, currentImageUrl }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { mutate: upload, isPending } = useMutation({
    mutationFn: (file: File) => productsApi.uploadImage(productId, file),
    onSuccess: (data) => {
      setPreview(data.image_url)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', productId] })
      toast.success('Imagen actualizada')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
    upload(file)
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors group border-2 border-dashed border-gray-300"
      >
        {preview ? (
          <>
            <img src={preview} alt="Product" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-center">
                <Upload size={24} className="mx-auto mb-1" />
                <p className="text-sm">Cambiar imagen</p>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <ImageIcon size={40} className="mb-2" />
            <p className="text-sm">Haz clic para subir imagen</p>
            <p className="text-xs mt-1">JPG, PNG, WebP</p>
          </div>
        )}
        {isPending && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
