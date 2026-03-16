import { apiClient } from './client'
import type { User, UpdateMeInput } from '../types'

export interface TokenPair {
  access_token: string
  refresh_token: string
  expires_at: string
  user: User
}

export interface RegisterInput {
  username: string
  email: string
  password: string
}

export const authApi = {
  login: async (identifier: string, password: string): Promise<TokenPair> => {
    const res = await apiClient.post<TokenPair>('/auth/login', { identifier, password })
    return res.data
  },

  register: async (data: RegisterInput): Promise<TokenPair> => {
    const res = await apiClient.post<TokenPair>('/auth/register', data)
    return res.data
  },

  refresh: async (refreshToken: string): Promise<TokenPair> => {
    const res = await apiClient.post<TokenPair>('/auth/refresh', { refresh_token: refreshToken })
    return res.data
  },

  logout: async (refreshToken?: string): Promise<void> => {
    await apiClient.post('/auth/logout', { refresh_token: refreshToken })
  },

  me: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me')
    return res.data
  },

  updateMe: async (data: UpdateMeInput): Promise<User> => {
    const res = await apiClient.patch<User>('/auth/me', data)
    return res.data
  },
}
