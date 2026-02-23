import { useMediaQuery, useTheme } from "@mui/material";

/**
 * Standard hook for mobile detection across the application.
 * Uses the theme's 'sm' breakpoint (768px) to determine if the screen is mobile.
 *
 * @returns {boolean} true if the screen width is below 768px (mobile), false otherwise
 */
export function useIsMobile() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return isMobile;
}
