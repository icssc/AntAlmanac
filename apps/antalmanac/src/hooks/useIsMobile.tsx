import { useUserAgent } from '$providers/UserAgentProvider';
import { useMediaQuery, useTheme } from '@mui/material';

function isMobileUserAgent(userAgent: string) {
    return /Android|webOS|iPhone|iPod|iPad|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(userAgent);
}

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
