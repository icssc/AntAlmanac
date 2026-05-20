'use client';

import AppPostHogProvider from '$providers/PostHog';
import AppQueryProvider from '$providers/Query';
import AppThemeProvider from '$src/app/Theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

/**
 * Minimal provider stack for App Router pages outside the main SPA shell.
 */
export function StandaloneProviders({ children }: { children: React.ReactNode }) {
    return (
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <AppThemeProvider>
                <AppPostHogProvider>
                    <AppQueryProvider>{children}</AppQueryProvider>
                </AppPostHogProvider>
            </AppThemeProvider>
        </AppRouterCacheProvider>
    );
}
