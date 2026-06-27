import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Mobile detection using the theme's `sm` breakpoint (800px).
 */
export function useIsMobile() {
    const theme = useTheme();

    return useMediaQuery(theme.breakpoints.down('sm'));
}
