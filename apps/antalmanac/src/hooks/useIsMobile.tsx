'use client';

import { useMediaQuery, useTheme } from '@mui/material';
import { createContext, useContext } from 'react';

const MobileSsrContext = createContext<boolean | undefined>(undefined);

/** Seeds useIsMobile from the request user-agent so SSR and hydration agree on first paint. */
export function MobileSsrProvider({
    isMobile,
    children,
}: {
    isMobile: boolean;
    children: React.ReactNode;
}) {
    return <MobileSsrContext.Provider value={isMobile}>{children}</MobileSsrContext.Provider>;
}

/**
 * Mobile detection using the theme's `sm` breakpoint.
 *
 * Wrap the tree in MobileSsrProvider (fed from layout UA) so SSR and the first
 * client render match; viewport media queries take over after hydration.
 */
export function useIsMobile(overrideDefault?: boolean) {
    const theme = useTheme();
    const ssrDefault = useContext(MobileSsrContext);
    const defaultMatches = overrideDefault ?? ssrDefault ?? false;

    return useMediaQuery(theme.breakpoints.down('sm'), { defaultMatches });
}
