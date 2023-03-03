/**
 * shared state for website settings, e.g. color scheme
 */

import { create } from 'zustand'

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
   *  whether current color scheme is dark
   */
  isDarkMode: boolean
}

/**
 * hook for accessing the shared settings store
 */
const useSettingsStore = create<SettingsStore>((set) => ({
  showFinals: false,

  setShowFinals(showFinals: boolean) {
    set({ showFinals })
  },

  colorScheme: typeof Storage === 'undefined' ? 'auto' : window.localStorage.getItem('colorScheme') || 'auto',

  setColorScheme(colorScheme: string) {
    window.localStorage.setItem('colorScheme', colorScheme)
    const isDarkMode =
      colorScheme === 'dark' || (colorScheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    set({ colorScheme, isDarkMode })
  },

  isDarkMode:
    (typeof Storage !== 'undefined' && window.localStorage.getItem('colorScheme') === 'dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches,
}))

export default useSettingsStore
