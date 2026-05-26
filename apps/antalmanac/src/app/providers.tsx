'use client';

import type { ThemeInitState } from '$lib/theme';
import AppPostHogProvider from '$providers/AppPostHogProvider';
import AppQueryProvider from '$providers/AppQueryProvider';
import AppTourProvider from '$providers/AppTourProvider';
import AppThemeProvider from '$src/app/Theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

interface ProvidersProps {
    children: React.ReactNode;
    initialTheme: ThemeInitState;
}

export function Providers({ children, initialTheme }: ProvidersProps) {
    return (
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <AppThemeProvider initialTheme={initialTheme}>
                <AppPostHogProvider>
                    <AppQueryProvider>
                        <AppTourProvider>{children}</AppTourProvider>
                    </AppQueryProvider>
                </AppPostHogProvider>
            </AppThemeProvider>
        </AppRouterCacheProvider>
    );
}
