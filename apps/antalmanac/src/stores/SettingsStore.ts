import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import {
    getLocalStorageAutoSave,
    getLocalStorageDevMode,
    getLocalStoragePreviewMode,
    getLocalStorageShow24HourTime,
    setLocalStorageAutoSave,
    setLocalStorageDevMode,
    setLocalStoragePreviewMode,
    setLocalStorageShow24HourTime,
    setLocalStorageTheme,
} from '$lib/localStorage';
import { persistThemeCookies, resolveIsDark, type ThemeInitState, type ThemeSetting } from '$lib/theme';
import { PostHog } from 'posthog-js/react';
import { create } from 'zustand';

export type { ThemeSetting };

interface ThemeStore {
    /**
     * The 'raw' theme, based on the user's selected setting
     */
    themeSetting: ThemeSetting;
    /**
     * The 'derived' theme, based on user settings and device preferences
     */
    isDark: boolean;

    setAppTheme: (themeSetting: ThemeSetting, postHog?: PostHog) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
    themeSetting: 'system',
    isDark: false,

    setAppTheme: (themeSetting, postHog) => {
        setLocalStorageTheme(themeSetting);

        const isDark = resolveIsDark(themeSetting);
        persistThemeCookies(themeSetting, isDark);

        set({ themeSetting, isDark });

        logAnalytics(postHog, {
            category: analyticsEnum.nav,
            action: analyticsEnum.nav.actions.CHANGE_THEME,
            customProps: {
                themeSetting,
            },
        });
    },
}));

export function initializeThemeStore(initial: ThemeInitState) {
    useThemeStore.setState(initial);
}

interface TimeFormatStore {
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
interface PreviewStore {
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

interface AutoSaveStore {
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

interface DevModeStore {
    devMode: boolean;
    setDevMode: (devMode: boolean) => void;
}

export const useDevModeStore = create<DevModeStore>((set) => {
    const stored = typeof Storage !== 'undefined' ? getLocalStorageDevMode() : null;
    const isLocalDev = process.env.NODE_ENV === 'development';
    const devMode = stored === null ? isLocalDev : stored === 'true';

    return {
        devMode,
        setDevMode: (devMode: boolean) => {
            if (typeof Storage !== 'undefined') {
                setLocalStorageDevMode(devMode.toString());
            }
            set({ devMode });
        },
    };
});
