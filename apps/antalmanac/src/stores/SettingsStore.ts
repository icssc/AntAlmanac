import { create } from 'zustand';
import analyticsEnum, { logAnalytics } from '$lib/analytics';

export type ThemeSetting = 'light' | 'dark' | 'system';

export const darkModePalette = {
    DARK_AA_HEADER_BACKGROUND: '#264a92',
    DARK_SECTION_HEADER_BACKGROUND: '#3a3e41',
    DARK_BODY_BACKGROUND: '#1a1c1f',
};

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
    const storedThemeSetting: ThemeSetting = (window.localStorage?.getItem('theme') ?? 'system') as ThemeSetting;
    const isDark = themeShouldBeDark(storedThemeSetting);

    return {
        themeSetting: storedThemeSetting,
        appTheme: isDark ? 'dark' : 'light',
        isDark: isDark,

        setAppTheme: (themeSetting) => {
            window.localStorage?.setItem('theme', themeSetting);

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
export interface PreviewStore {
    previewMode: boolean;
    setPreviewMode: (previewMode: boolean) => void;
}

export const usePreviewStore = create<PreviewStore>((set) => {
    const previewMode = typeof Storage !== 'undefined' && window.localStorage.getItem('previewMode') == 'true';

    return {
        previewMode: previewMode,
        setPreviewMode: (previewMode) => {
            if (typeof Storage !== 'undefined') {
                window.localStorage.setItem('previewMode', previewMode.toString());
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
    const autoSave = typeof Storage !== 'undefined' && window.localStorage.getItem('autoSave') == 'true';

    return {
        autoSave,
        setAutoSave: (autoSave) => {
            if (typeof Storage !== 'undefined') {
                window.localStorage.setItem('autoSave', autoSave.toString());
            }
            set({ autoSave });
        },
    };
});
