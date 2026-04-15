'use client';
import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import ThemeContext from '../../style/theme-context';
import { Theme } from '@peterportal/types';
import { useIsLoggedIn } from '../../hooks/isLoggedIn';
import trpc from '../../trpc';
import { ThemeProvider, useMediaQuery } from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { createPlannerTheme } from '../../style/theme';

function resolveInitialDark(preference: Theme | null, isSystemDark: boolean) {
    if (preference === 'dark') return true;
    if (preference === 'light') return false;
    return isSystemDark;
}

const AppThemeProvider: FC<PropsWithChildren> = ({ children }) => {
    const preloadedPreference = useAppSelector((state) => state.user.theme);
    const isLoggedIn = useIsLoggedIn();
    const isSystemDark = useMediaQuery('(prefers-color-scheme: dark)');

    const [themePreference, setThemePreference] = useState<Theme | null>(preloadedPreference);
    const [darkMode, setDarkMode] = useState(() => resolveInitialDark(preloadedPreference, isSystemDark));

    useEffect(() => {
        const fallbackToSystem = !themePreference || themePreference === 'system';
        setDarkMode(fallbackToSystem ? isSystemDark : themePreference === 'dark');
    }, [themePreference, isSystemDark]);

    useEffect(() => {
        if (!isLoggedIn) {
            setThemePreference((localStorage.getItem('theme') ?? 'system') as Theme);
        }
    }, [isLoggedIn]);

    const theme = useMemo(() => createPlannerTheme(darkMode), [darkMode]);

    const setTheme = (newTheme: Theme) => {
        setThemePreference(newTheme);
        if (isLoggedIn) {
            trpc.users.setTheme.mutate({ theme: newTheme });
        } else {
            localStorage.setItem('theme', newTheme);
        }
    };

    const dataTheme = darkMode ? 'dark' : 'light';

    return (
        <ThemeContext.Provider value={{ darkMode, usingSystemTheme: themePreference === 'system', setTheme }}>
            <ThemeProvider theme={theme}>
                <div data-theme={dataTheme} style={{ display: 'contents', colorScheme: dataTheme }}>
                    {children}
                </div>
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export default AppThemeProvider;
