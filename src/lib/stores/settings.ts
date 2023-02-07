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
}

/**
 * hook for accessing the shared theme store
 */
export const useSettingsStore = create<SettingsStore>((set) => ({
  colorScheme: getColorScheme(),

  setColorScheme(colorScheme: string) {
    window.localStorage.setItem('colorScheme', colorScheme);
    set(() => ({ colorScheme }));
  },
}));
