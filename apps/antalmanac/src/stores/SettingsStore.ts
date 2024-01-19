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
    isDark: boolean;

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

    const isDark =
        themeSetting !== 'system'
            ? themeSetting === 'dark'
                ? true
                : false
            : window.matchMedia('(prefers-color-scheme: dark)').matches
            ? true
            : false;

    return {
        themeSetting: themeSetting as 'light' | 'dark' | 'system',
        appTheme: appTheme as 'light' | 'dark',
        isDark,
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

            const isDark =
                themeSetting !== 'system'
                    ? themeSetting === 'dark'
                        ? true
                        : false
                    : window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? true
                    : false;

            set({ appTheme, themeSetting, isDark });

            logAnalytics({
                category: analyticsEnum.nav.title,
                action: analyticsEnum.nav.actions.CHANGE_THEME,
                label: appTheme,
            });
        },
    };
});

export interface TimeFormatStore {
    isMilitaryTime: boolean;
    setTimeFormat: (militaryTime: boolean) => void;
}

export const useTimeFormatStore = create<TimeFormatStore>((set) => {
    const isMilitaryTime = typeof Storage !== 'undefined' && window.localStorage.getItem('show24HourTime') == 'true';

    return {
        isMilitaryTime,
        setTimeFormat: (isMilitaryTime) => {
            if (typeof Storage !== 'undefined') {
                window.localStorage.setItem('show24HourTime', isMilitaryTime.toString());
            }
            set({ isMilitaryTime });
        },
    };
});
