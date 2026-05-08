'use client';

import AppPostHogProvider from '$providers/PostHog';
import AppQueryProvider from '$providers/Query';
import AppThemeProvider from '$src/app/Theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

interface Props {
    children: React.ReactNode;
}

export function Providers({ children }: Props) {
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
