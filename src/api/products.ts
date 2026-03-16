import { apiClient } from './client'
import type {
  Product,
  PaginatedResponse,
  ProductFilters,
  CreateProductInput,
  UpdateProductInput,
} from '../types'

export const productsApi = {
  list: async (filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.category_id) params.set('category_id', filters.category_id)
    if (filters.active !== undefined) params.set('active', String(filters.active))
    if (filters.page) params.set('page', String(filters.page))
    if (filters.page_size) params.set('page_size', String(filters.page_size))

    const res = await apiClient.get<PaginatedResponse<Product>>(`/products?${params}`)
    return res.data
  },

  get: async (id: string): Promise<Product> => {
    const res = await apiClient.get<Product>(`/products/${id}`)
    return res.data
  },

  create: async (data: CreateProductInput): Promise<Product> => {
    const res = await apiClient.post<Product>('/products', data)
    return res.data
  },

  update: async (id: string, data: UpdateProductInput): Promise<Product> => {
    const res = await apiClient.put<Product>(`/products/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },

  uploadImage: async (id: string, file: File): Promise<{ image_url: string }> => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await apiClient.post<{ image_url: string }>(
      `/products/${id}/image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return res.data
  },
}
