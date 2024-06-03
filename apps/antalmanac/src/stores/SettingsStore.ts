import { create } from 'zustand';

import analyticsEnum, { logAnalytics } from '$lib/analytics';
import {
    getLocalStorageAutoSave,
    getLocalStoragePreviewMode,
    getLocalStorageShow24HourTime,
    getLocalStorageTheme,
    setLocalStorageAutoSave,
    setLocalStoragePreviewMode,
    setLocalStorageShow24HourTime,
    setLocalStorageTheme,
} from '$lib/localStorage';

export type ThemeSetting = 'light' | 'dark' | 'system';

export interface ThemeStore {
    /**
     * The 'raw' theme, based on the user's selected setting
     */
    themeSetting: ThemeSetting;
    /**
     * The 'derived' theme, based on user settings and device preferences
     */
    appTheme: 'light' | 'dark';
    isDark: boolean;

    setAppTheme: (themeSetting: ThemeSetting) => void;
}

function themeShouldBeDark(themeSetting: ThemeSetting) {
    if (themeSetting == 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return themeSetting == 'dark';
}

export const useThemeStore = create<ThemeStore>((set) => {
    const storedThemeSetting: ThemeSetting = (getLocalStorageTheme() ?? 'system') as ThemeSetting;
    const isDark = themeShouldBeDark(storedThemeSetting);

    return {
        themeSetting: storedThemeSetting,
        appTheme: isDark ? 'dark' : 'light',
        isDark: isDark,

        setAppTheme: (themeSetting) => {
            setLocalStorageTheme(themeSetting);

            const isDark = themeShouldBeDark(themeSetting);
            const appTheme = isDark ? 'dark' : 'light';

            set({ appTheme, themeSetting, isDark });

            logAnalytics({
                category: analyticsEnum.nav.title,
                action: analyticsEnum.nav.actions.CHANGE_THEME,
                label: themeSetting,
            });
        },
    };
});

export interface TimeFormatStore {
    isMilitaryTime: boolean;
    setTimeFormat: (militaryTime: boolean) => void;
}

export const useTimeFormatStore = create<TimeFormatStore>((set) => {
    const isMilitaryTime = typeof Storage !== 'undefined' && getLocalStorageShow24HourTime() == 'true';

    return {
        isMilitaryTime,
        setTimeFormat: (isMilitaryTime) => {
            if (typeof Storage !== 'undefined') {
                setLocalStorageShow24HourTime(isMilitaryTime.toString());
            }
            set({ isMilitaryTime });
        },
    };
});
export interface PreviewStore {
    previewMode: boolean;
    setPreviewMode: (previewMode: boolean) => void;
}

export const usePreviewStore = create<PreviewStore>((set) => {
    const previewMode = typeof Storage !== 'undefined' && getLocalStoragePreviewMode() == 'true';

    return {
        previewMode: previewMode,
        setPreviewMode: (previewMode) => {
            if (typeof Storage !== 'undefined') {
                setLocalStoragePreviewMode(previewMode.toString());
            }

            set({ previewMode: previewMode });
        },
    };
});

export interface AutoSaveStore {
    autoSave: boolean;
    setAutoSave: (autoSave: boolean) => void;
}

export const useAutoSaveStore = create<AutoSaveStore>((set) => {
    const autoSave = typeof Storage !== 'undefined' && getLocalStorageAutoSave() == 'true';

    return {
        autoSave,
        setAutoSave: (autoSave) => {
            if (typeof Storage !== 'undefined') {
                setLocalStorageAutoSave(autoSave.toString());
            }
            set({ autoSave });
        },
    };
});
