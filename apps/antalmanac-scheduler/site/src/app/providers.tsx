'use client';

import { AppPostHogProvider } from '$providers/AppPostHogProvider';
import { AppQueryProvider } from '$providers/AppQueryProvider';
import { AppTourProvider } from '$providers/AppTourProvider';
import { AppThemeProvider } from '$src/app/Theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <AppThemeProvider>
                <AppPostHogProvider>
                    <AppQueryProvider>
                        <NuqsAdapter>
                            <AppTourProvider>{children}</AppTourProvider>
                        </NuqsAdapter>
                    </AppQueryProvider>
                </AppPostHogProvider>
            </AppThemeProvider>
        </AppRouterCacheProvider>
    );
}
