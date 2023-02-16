/**
 * shared state for website settings, e.g. color scheme, finals mode, etc.
 */

import { create } from 'zustand'

interface SettingsStore {
  /**
   * whether the website is currently displaying finals
   */
  showFinals: boolean

  /**
   * control whether the website is currently displaying finals
   */
  setShowFinals: (showFinals: boolean) => void

  /**
   * current color theme, e.g. "dark", "light", "auto", etc.
   */
  theme: string

  /**
   * set theme and save it to local storage
   */
  setTheme: (scheme: string) => void

  /**
   * function to determine if the current color scheme is dark
   */
  isDarkMode: () => boolean
}

/**
 * hook for accessing the shared settings store
 */
export const useSettingsStore = create<SettingsStore>((set, get) => ({
  showFinals: false,

  setShowFinals(showFinals: boolean) {
    set({ showFinals })
  },

  theme: typeof Storage === 'undefined' ? 'auto' : window.localStorage.getItem('colorScheme') || 'auto',

  setTheme(theme: string) {
    window.localStorage.setItem('theme', theme)
    set({ theme })
  },

  isDarkMode() {
    switch (get().theme) {
      case 'light':
        return false
      case 'dark':
        return true
      default:
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  },
}))
