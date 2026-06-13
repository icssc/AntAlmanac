import { useDeviceHint } from '$providers/DeviceProvider';
import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Standard hook for mobile detection across the application.
 * Uses the theme's 'sm' breakpoint (768px) to determine if the screen is mobile.
 *
 * On the server, falls back to a UA-based hint provided by {@link DeviceProvider}
 * so the initial render matches the client without a layout shift.
 *
 * @returns {boolean} true if the screen width is below 768px (mobile), false otherwise
 */
export function useIsMobile() {
    const { isMobile: serverHint } = useDeviceHint();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'), {
        defaultMatches: serverHint,
    });

    return isMobile;
}
