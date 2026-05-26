'use client';

import AppPostHogProvider from '$providers/AppPostHogProvider';
import AppQueryProvider from '$providers/AppQueryProvider';
import AppTourProvider from '$providers/AppTourProvider';
import AppThemeProvider from '$src/app/Theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <AppThemeProvider>
                <AppPostHogProvider>
                    <AppQueryProvider>
                        <AppTourProvider>
                            <NuqsAdapter>{children}</NuqsAdapter>
                        </AppTourProvider>
                    </AppQueryProvider>
                </AppPostHogProvider>
            </AppThemeProvider>
        </AppRouterCacheProvider>
    );
}
