/**
 * shared theme store
 */

import { create } from 'zustand';

/**
 * get the color scheme
 */
function getColorScheme() {
  return typeof Storage === 'undefined' ? 'auto' : window.localStorage.getItem('colorScheme') || 'auto';
}

interface SettingsStore {
  /**
   * current color scheme
   */
  colorScheme: string;

  /**
   * set the new color schema and save it to local storage
   * @param scheme the new theme
   */
  setColorScheme: (scheme: string) => void;

  /**
   * reactive function to determine if the current color scheme is dark
   */
  isDarkMode: () => boolean;
}

/**
 * hook for accessing the shared theme store
 */
export const useSettingsStore = create<SettingsStore>((set, get) => ({
  colorScheme: getColorScheme(),

  setColorScheme(colorScheme: string) {
    window.localStorage.setItem('colorScheme', colorScheme);
    set(() => ({ colorScheme }));
  },

  isDarkMode() {
    switch (get().colorScheme) {
      case 'light':
        return false;
      case 'dark':
        return true;
      default:
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  },
}));
