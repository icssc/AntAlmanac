import { create } from 'zustand';
import analyticsEnum, { logAnalytics } from '$lib/analytics';

export interface ThemeStore {
    /**
     * The 'raw' theme, based on the user's selected setting
     */
    themeSetting: 'light' | 'dark' | 'system';
    /**
     * The 'derived' theme, based on user settings and device preferences
     */
    appTheme: 'light' | 'dark';
    setAppTheme: (themeSetting: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeStore>((set) => {
    const themeSetting = typeof Storage !== 'undefined' ? window.localStorage.getItem('theme') ?? 'system' : 'system';

    const appTheme =
        themeSetting !== 'system'
            ? themeSetting
            : window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';

    return {
        themeSetting: themeSetting as 'light' | 'dark' | 'system',
        appTheme: appTheme as 'light' | 'dark',
        setAppTheme: (themeSetting) => {
            if (typeof Storage !== 'undefined') {
                window.localStorage.setItem('theme', themeSetting);
            }

            const appTheme =
                themeSetting !== 'system'
                    ? themeSetting
                    : window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';

            set({ appTheme: appTheme, themeSetting: themeSetting });

            logAnalytics({
                category: analyticsEnum.nav.title,
                action: analyticsEnum.nav.actions.CHANGE_THEME,
                label: appTheme,
            });
        },
    };
});
