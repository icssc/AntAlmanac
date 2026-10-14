'use client';
import { createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import { Theme } from '@peterportal/types';
import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';

import { useIsLoggedIn } from '../../hooks/isLoggedIn';
import { useAppSelector } from '../../store/hooks';
import { theme } from '../../style/theme';
import ThemeContext from '../../style/theme-context';
import trpc from '../../trpc';

function shouldPreloadDark(preference: Theme | null, hookIsDarkMode: boolean) {
    if (preference === 'dark') return true;
    if (preference === 'light') return false;

    if (typeof document === 'undefined') return hookIsDarkMode;
    return document.documentElement.dataset.theme === 'dark';
}

/**
 * Checks whether a react hook media query has the correct result. Because the useMediaQuery
 * always returns false before everything loads, the hook will sometimes be wrong when rendering the page.
 *
 * We still want to use the hook because after it loads, its value will always be correct, and it triggers
 * a rerender as intended when the system theme changes.
 *
 * @param isDark The value to check consistency with true system dark
 * @returns Whether the theoretical and actual value match
 */
function isThemeMismatched(preference: Theme | null, isDark: boolean) {
    if (preference === 'dark' && !isDark) return true;
    if (preference === 'light' && isDark) return true;

    const isSystemPreference = preference !== 'light' && preference !== 'dark';
    if (!isSystemPreference) return false;

    const trueSystemDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return trueSystemDark !== isDark;
}

function createSsrMatchMedia(deviceType?: string) {
    const estimatedWidth = deviceType === 'mobile' ? 390 : deviceType === 'tablet' ? 768 : 1280;

    return (query: string) => {
        const maxWidth = query.match(/max-width:\s*(\d+)px/)?.[1];
        const minWidth = query.match(/min-width:\s*(\d+)px/)?.[1];
        if (!maxWidth && !minWidth) return { matches: false };

        const matches =
            (!maxWidth || estimatedWidth <= Number(maxWidth)) && (!minWidth || estimatedWidth >= Number(minWidth));
        return { matches };
    };
}

interface AppThemeProviderProps extends PropsWithChildren {
    deviceType?: string;
}

const AppThemeProvider: FC<AppThemeProviderProps> = ({ children, deviceType }) => {
    const preloadedPreference = useAppSelector((state) => state.user.theme);

    const isLoggedIn = useIsLoggedIn();
    const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)');

    const preloadedDark = shouldPreloadDark(preloadedPreference, isSystemDark);

    // default darkMode to local or system preferences
    /** @todo see if there's a way to make it so loading on first render (via localStorage) doesn't get overridden */
    const [themePreference, setThemePreference] = useState<Theme | null>(preloadedPreference);
    const [darkMode, setDarkMode] = useState<boolean>(preloadedDark);
    const isMismatched = isThemeMismatched(themePreference, darkMode);

    // either preferences or system change can trigger recomputation of whether we are in dark mode
    useEffect(() => {
        const fallbackToSystem = !themePreference || themePreference === 'system';
        setDarkMode(fallbackToSystem ? isSystemDark : themePreference === 'dark');
    }, [themePreference, isSystemDark]);

    useEffect(() => {
        if (isMismatched) return;
        // PeterPortal styling is controlled by the data-theme attribute on body
        document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    }, [isMismatched, darkMode]);

    /**
     * Sets and stores the new theme preference
     * @param theme
     */
    const setTheme = (theme: Theme) => {
        setThemePreference(theme);
        if (isLoggedIn) {
            trpc.users.setTheme.mutate({ theme });
        } else {
            localStorage.setItem('theme', theme);
        }
    };

    useEffect(() => {
        // if logged in, load user theme from db
        if (!isLoggedIn) {
            setThemePreference((localStorage.getItem('theme') ?? 'system') as Theme);
            return;
        }
    }, [isLoggedIn, setThemePreference]);

    const themeWithSsrMediaQueries = useMemo(
        () =>
            createTheme(theme, {
                components: {
                    MuiUseMediaQuery: { defaultProps: { ssrMatchMedia: createSsrMatchMedia(deviceType) } },
                },
            }),
        [deviceType]
    );

    return (
        <ThemeContext.Provider value={{ darkMode, usingSystemTheme: themePreference === 'system', setTheme }}>
            <ThemeProvider theme={themeWithSsrMediaQueries} defaultMode={preloadedDark ? 'dark' : 'light'}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export default AppThemeProvider;
