import { apiClient } from './client'
import type { Contact, UpsertContactInput } from '../types'

export const contactsApi = {
  get: async (productId: string): Promise<Contact> => {
    const res = await apiClient.get<Contact>(`/products/${productId}/contact`)
    return res.data
  },

  upsert: async (productId: string, data: UpsertContactInput): Promise<Contact> => {
    const res = await apiClient.put<Contact>(`/products/${productId}/contact`, data)
    return res.data
  },

  delete: async (productId: string): Promise<void> => {
    await apiClient.delete(`/products/${productId}/contact`)
  },
}
