import type { cookies } from 'next/headers';

export type ThemeSetting = 'light' | 'dark' | 'system';

export const THEME_SETTING_COOKIE = 'aa-theme';
export const THEME_MODE_COOKIE = 'aa-theme-mode';

/** Matches `LocalStorageKeys.theme` in localStorage.ts */
export const THEME_LOCAL_STORAGE_KEY = 'theme';

export const THEME_LIGHT_BACKGROUND = '#f5f6fc';
export const THEME_DARK_BACKGROUND = '#1E1E1E';

const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export interface ThemeInitState {
    themeSetting: ThemeSetting;
    isDark: boolean;
}

export function resolveIsDark(themeSetting: ThemeSetting): boolean {
    if (themeSetting === 'dark') {
        return true;
    }

    if (themeSetting === 'light') {
        return false;
    }

    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getThemeBackground(isDark: boolean): string {
    return isDark ? THEME_DARK_BACKGROUND : THEME_LIGHT_BACKGROUND;
}

export function getServerThemeState(cookieStore: Awaited<ReturnType<typeof cookies>>): ThemeInitState {
    const mode = cookieStore.get(THEME_MODE_COOKIE)?.value;
    const setting = (cookieStore.get(THEME_SETTING_COOKIE)?.value ?? 'system') as ThemeSetting;

    if (mode === 'dark' || mode === 'light') {
        return { themeSetting: setting, isDark: mode === 'dark' };
    }

    return { themeSetting: 'system', isDark: false };
}

export function persistThemeCookies(themeSetting: ThemeSetting, isDark: boolean) {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = `;max-age=${THEME_COOKIE_MAX_AGE_SECONDS}`;
    document.cookie = `${THEME_SETTING_COOKIE}=${themeSetting};path=/;SameSite=Lax${maxAge}`;
    document.cookie = `${THEME_MODE_COOKIE}=${isDark ? 'dark' : 'light'};path=/;SameSite=Lax${maxAge}`;
}

/** Runs synchronously before React to avoid theme FOUC. Keep in sync with resolveIsDark. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_LOCAL_STORAGE_KEY}')||'system';var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.dataset.themeSetting=t;r.dataset.themeIsDark=dark?'true':'false';r.style.colorScheme=dark?'dark':'light';r.style.backgroundColor=dark?'${THEME_DARK_BACKGROUND}':'${THEME_LIGHT_BACKGROUND}';var y=${THEME_COOKIE_MAX_AGE_SECONDS};r.cookie='${THEME_SETTING_COOKIE}='+t+';path=/;SameSite=Lax;max-age='+y;r.cookie='${THEME_MODE_COOKIE}='+(dark?'dark':'light')+';path=/;SameSite=Lax;max-age='+y;}catch(e){}})();`;

export function resolveThemeInitState(serverInitial: ThemeInitState): ThemeInitState {
    if (typeof document === 'undefined') {
        return serverInitial;
    }

    const { themeSetting, themeIsDark } = document.documentElement.dataset;

    if (themeSetting && (themeIsDark === 'true' || themeIsDark === 'false')) {
        return {
            themeSetting: themeSetting as ThemeSetting,
            isDark: themeIsDark === 'true',
        };
    }

    return serverInitial;
}
