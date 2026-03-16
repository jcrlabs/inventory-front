import { apiClient } from './client'

export interface InventoryStats {
  total_products: number
  active_products: number
  total_categories: number
  total_users: number
}

export const statsApi = {
  get: async (): Promise<InventoryStats> => {
    const res = await apiClient.get<InventoryStats>('/stats')
    return res.data
  },
}
