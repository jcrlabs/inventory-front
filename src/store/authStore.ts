import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  expiresAt: Date | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string, expiresAt: string) => void
  logout: () => void
}

function loadStoredAuth(): Pick<AuthState, 'user' | 'accessToken' | 'refreshToken' | 'expiresAt' | 'isAuthenticated'> {
  try {
    const accessToken = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')
    const expiresAtStr = localStorage.getItem('expires_at')
    const userStr = localStorage.getItem('user')

    if (!accessToken || !refreshToken || !expiresAtStr || !userStr) {
      return { user: null, accessToken: null, refreshToken: null, expiresAt: null, isAuthenticated: false }
    }

    const expiresAt = new Date(expiresAtStr)
    // Consider expired if less than 60 seconds remain
    const isExpired = expiresAt.getTime() - Date.now() < 60_000
    if (isExpired) {
      clearStorage()
      return { user: null, accessToken: null, refreshToken: null, expiresAt: null, isAuthenticated: false }
    }

    const user = JSON.parse(userStr) as User
    return { user, accessToken, refreshToken, expiresAt, isAuthenticated: true }
  } catch {
    clearStorage()
    return { user: null, accessToken: null, refreshToken: null, expiresAt: null, isAuthenticated: false }
  }
}

function clearStorage() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('expires_at')
  localStorage.removeItem('user')
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadStoredAuth(),

  setAuth: (user, accessToken, refreshToken, expiresAt) => {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    localStorage.setItem('expires_at', expiresAt)
    localStorage.setItem('user', JSON.stringify(user))
    set({
      user,
      accessToken,
      refreshToken,
      expiresAt: new Date(expiresAt),
      isAuthenticated: true,
    })
  },

  logout: () => {
    clearStorage()
    set({ user: null, accessToken: null, refreshToken: null, expiresAt: null, isAuthenticated: false })
  },
}))
