import { create } from 'zustand'

export type Theme = 'dark' | 'light'
export type Locale = 'es' | 'en' | 'gl'

interface SettingsState {
  theme: Theme
  locale: Locale
  setTheme: (theme: Theme) => void
  setLocale: (locale: Locale) => void
  toggleTheme: () => void
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

const storedTheme = (localStorage.getItem('theme') as Theme) || 'dark'
const storedLocale = (localStorage.getItem('locale') as Locale) || 'es'
applyTheme(storedTheme)

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: storedTheme,
  locale: storedLocale,

  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    applyTheme(theme)
    set({ theme })
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },

  setLocale: (locale) => {
    localStorage.setItem('locale', locale)
    set({ locale })
  },
}))
