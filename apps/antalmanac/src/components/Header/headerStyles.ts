import type { SxProps, Theme } from '@mui/material';

import { DARK_PAPER_BG } from '$src/globals';

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
        bgcolor: isDark ? DARK_PAPER_BG : 'background.paper',
        color: isDark ? 'white' : 'text.primary',
    };
}
