import { PostHog } from 'posthog-js/react';
import { create } from 'zustand';

import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import {
    getLocalStorageAutoSave,
    getLocalStoragePreviewMode,
    getLocalStorageSectionColor,
    getLocalStorageShow24HourTime,
    getLocalStorageTheme,
    setLocalStorageAutoSave,
    setLocalStoragePreviewMode,
    setLocalStorageSectionColor,
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

    setAppTheme: (themeSetting: ThemeSetting, postHog?: PostHog) => void;
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

        setAppTheme: (themeSetting, postHog) => {
            setLocalStorageTheme(themeSetting);

            const isDark = themeShouldBeDark(themeSetting);
            const appTheme = isDark ? 'dark' : 'light';

            set({ appTheme, themeSetting, isDark });

            logAnalytics(postHog, {
                category: analyticsEnum.nav,
                action: analyticsEnum.nav.actions.CHANGE_THEME,
                label: themeSetting,
            });
        },
    };
});

export type SectionColorSetting = 'default' | 'legacy' | 'catppuccin';

export interface SectionColorStore {
    sectionColor: SectionColorSetting;
    setSectionColor: (sectionColorSetting: SectionColorSetting, postHog?: PostHog) => void;
}

export const useSectionColorStore = create<SectionColorStore>((set) => {
    const storedSectionColor = (getLocalStorageSectionColor() ?? 'default') as SectionColorSetting;
    return {
        sectionColor: storedSectionColor,

        setSectionColor: (sectionColor, postHog) => {
            setLocalStorageSectionColor(sectionColor);

            set({ sectionColor });

            logAnalytics(postHog, {
                category: analyticsEnum.nav,
                action: analyticsEnum.nav.actions.CHANGE_SECTION_COLOR,
                label: sectionColor,
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
