import { apiClient } from './client'
import type { User, ListResponse, CreateUserInput, UpdateUserInput } from '../types'

export const usersApi = {
  list: async (): Promise<ListResponse<User>> => {
    const res = await apiClient.get<ListResponse<User>>('/users')
    return res.data
  },

  get: async (id: string): Promise<User> => {
    const res = await apiClient.get<User>(`/users/${id}`)
    return res.data
  },

  create: async (data: CreateUserInput): Promise<User> => {
    const res = await apiClient.post<User>('/users', data)
    return res.data
  },

  update: async (id: string, data: UpdateUserInput): Promise<User> => {
    const res = await apiClient.put<User>(`/users/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },
}
