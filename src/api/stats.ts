import { apiClient } from './client'

export interface InventoryStats {
  total_products: number
  active_products: number
  total_categories: number
  total_stock: number
  stock_value: number
  out_of_stock: number
  low_stock: number
  total_users: number
}

export const statsApi = {
  get: async (): Promise<InventoryStats> => {
    const res = await apiClient.get<InventoryStats>('/stats')
    return res.data
  },
}
