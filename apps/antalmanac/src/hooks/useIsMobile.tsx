import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Mobile detection using the theme's `sm` breakpoint (800px).
 *
 * Pass `defaultMatches` from a server UA hint so SSR and the first client render agree.
 */
export function useIsMobile(defaultMatches = false) {
    const theme = useTheme();
    return useMediaQuery(theme.breakpoints.down('sm'), { defaultMatches });
}
