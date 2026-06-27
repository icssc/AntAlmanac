import { useUserAgent } from '$providers/UserAgentProvider';
import { isMobileUserAgent } from '$lib/isMobileUserAgent';
import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Mobile detection using the theme's `sm` breakpoint.
 *
 * Uses the request user-agent (via UserAgentProvider) as the SSR default so
 * server, hydration, and viewport width agree on first paint.
 */
export function useIsMobile() {
    const theme = useTheme();
    const userAgent = useUserAgent();
    const defaultMatches = isMobileUserAgent(userAgent);

    return useMediaQuery(theme.breakpoints.down('sm'), { defaultMatches });
}
