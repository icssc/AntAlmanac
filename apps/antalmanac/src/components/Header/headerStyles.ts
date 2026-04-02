import type { SxProps, Theme } from '@mui/material';

export const SETTINGS_POPOVER_BG = '#383838';

/** Dark menu item selected state — lighter than container so current route is visible */
export const SETTINGS_POPOVER_MENU_SELECTED_BG = '#424242';

/** Dark menu item hover — lighter still so hover feedback is visible */
export const SETTINGS_POPOVER_MENU_HOVER_BG = '#4a4a4a';

/**
 * Shared paper sx for the settings/profile popover used in Signin and Signout.
 * Single source of truth so popover styles stay in sync.
 */
export function getSettingsPopoverPaperSx(isDark: boolean): SxProps<Theme> {
    return {
        width: {
            xs: 300,
            sm: 300,
            md: 330,
        },
        p: '16px 20px',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'background.default',
        bgcolor: isDark ? SETTINGS_POPOVER_BG : 'background.paper',
        color: isDark ? 'white' : 'text.primary',
    };
}
