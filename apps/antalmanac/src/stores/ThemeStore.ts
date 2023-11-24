import { create } from 'zustand';
import analyticsEnum, { logAnalytics } from '$lib/analytics';

export interface ThemeStore {
    theme: string;
    setTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeStore>((set) => {
    const theme = typeof Storage !== 'undefined' ? window.localStorage.getItem('theme') ?? 'system' : 'system';

    logAnalytics({
        category: analyticsEnum.nav.title,
        action: analyticsEnum.nav.actions.CHANGE_THEME,
        label: theme,
    });

    return {
        theme: theme,
        setTheme: (theme) => {
            if (typeof Storage !== 'undefined') {
                window.localStorage.setItem('theme', theme);
            }
            set({ theme });
        },
    };
});
