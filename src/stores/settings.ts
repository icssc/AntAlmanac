/**
 * shared state for website settings, e.g. color scheme
 */

import { create } from 'zustand'

/**
 * retrive the color scheme
 */
function getColorScheme() {
  return typeof Storage === 'undefined' ? 'auto' : window.localStorage.getItem('colorScheme') || 'auto'
}

/**
 * currently enabled settings and helpers
 */
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
   * current color scheme
   */
  colorScheme: string

  /**
   * set the new color schema and save it to local storage
   * @param scheme the new theme
   */
  setColorScheme: (scheme: string) => void

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

  colorScheme: getColorScheme(),

  setColorScheme(colorScheme: string) {
    window.localStorage.setItem('colorScheme', colorScheme)
    set({ colorScheme })
  },

  isDarkMode() {
    switch (get().colorScheme) {
      case 'light':
        return false
      case 'dark':
        return true
      default:
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  },
}))
