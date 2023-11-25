import { create } from 'zustand';
import analyticsEnum, { logAnalytics } from '$lib/analytics';

export interface ThemeStore {
    /**
     * The 'raw' theme (either 'light', 'dark', or 'system')
     */
    value: string;
    /**
     * The 'derived' theme (either 'light' or 'dark', based on user settings and device preferences)
     */
    theme: string;
    setTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeStore>((set) => {
    const theme = typeof Storage !== 'undefined' ? window.localStorage.getItem('theme') ?? 'system' : 'system';
    return {
        value: theme,
        theme:
            theme !== 'system' ? theme : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        setTheme: (value) => {
            if (typeof Storage !== 'undefined') {
                window.localStorage.setItem('theme', value);
            }

            const theme =
                value !== 'system'
                    ? value
                    : window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';

            set({ theme: theme, value: value });

            logAnalytics({
                category: analyticsEnum.nav.title,
                action: analyticsEnum.nav.actions.CHANGE_THEME,
                label: theme,
            });
        },
    };
});
