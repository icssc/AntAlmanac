import { useSsrIsMobile } from '$providers/UserAgentProvider';
import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Mobile detection using the theme's `sm` breakpoint.
 *
 * Uses the request user-agent (via UserAgentProvider) as the SSR default so
 * server, hydration, and viewport width agree on first paint.
 */
export function useIsMobile() {
    const theme = useTheme();
    const ssrIsMobile = useSsrIsMobile();

    return useMediaQuery(theme.breakpoints.down('sm'), { defaultMatches: ssrIsMobile });
}
