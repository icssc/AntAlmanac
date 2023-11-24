import { create } from 'zustand';
import analyticsEnum, { logAnalytics } from '$lib/analytics';

export interface ThemeStore {
    theme: string;
    setTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeStore>((set) => {
    const theme = typeof Storage !== 'undefined' ? window.localStorage.getItem('theme') ?? 'system' : 'system';

    return {
        theme:
            theme !== 'system' ? theme : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        setTheme: (theme) => {
            if (typeof Storage !== 'undefined') {
                window.localStorage.setItem('theme', theme);
            }

            theme =
                theme !== 'system'
                    ? theme
                    : window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';

            set({ theme });

            logAnalytics({
                category: analyticsEnum.nav.title,
                action: analyticsEnum.nav.actions.CHANGE_THEME,
                label: theme,
            });
        },
    };
});
