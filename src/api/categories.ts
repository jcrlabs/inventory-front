import { apiClient } from './client'
import type { Category, ListResponse, CreateCategoryInput } from '../types'

export const categoriesApi = {
  list: async (): Promise<ListResponse<Category>> => {
    const res = await apiClient.get<ListResponse<Category>>('/categories')
    return res.data
  },

  get: async (id: string): Promise<Category> => {
    const res = await apiClient.get<Category>(`/categories/${id}`)
    return res.data
  },

  create: async (data: CreateCategoryInput): Promise<Category> => {
    const res = await apiClient.post<Category>('/categories', data)
    return res.data
  },

  update: async (id: string, data: CreateCategoryInput): Promise<Category> => {
    const res = await apiClient.put<Category>(`/categories/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },
}
