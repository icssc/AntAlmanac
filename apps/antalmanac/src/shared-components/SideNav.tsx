import { EventNote, Route } from '@mui/icons-material';
import { Paper, Stack, SxProps, Typography, useTheme } from '@mui/material';
import Link from 'next/link';

import { useIsMobile } from '$hooks/useIsMobile';
import { PLANNER_LINK } from '$src/globals';
import { useThemeStore } from '$stores/SettingsStore';

// Ported from PeterPortal
// https://github.com/icssc/peterportal-client/blob/branding-changes/site/src/shared-components/SideNav.tsx
export const SideNav = () => {
    const isMobile = useIsMobile();
    const isDark = useThemeStore((store) => store.isDark);
    const theme = useTheme();

    if (isMobile) {
        return null;
    }

    const paperStyleOverrides: SxProps = {
        height: '100%',
        width: 64,
        zIndex: 300,
        top: 0,
        left: 0,
        borderRight: `1px solid ${theme.palette.divider}`,
        borderRadius: 0,
    };

    return (
        <Paper elevation={0} sx={paperStyleOverrides}>
            <Stack direction="column" alignItems="center" sx={{ gap: '16px', paddingTop: '8px' }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <Stack direction="column" alignItems="center">
                        <EventNote sx={{ fontSize: 24 }} />
                        <Typography fontSize={11}>Scheduler</Typography>
                    </Stack>
                </Link>

                {/* TODO (@xgraceyan): Fix PP link after merge */}
                <Link href={PLANNER_LINK} style={{ textDecoration: 'none' }}>
                    <Stack direction="column" alignItems="center" sx={{ color: isDark ? 'white' : 'black' }}>
                        <Route sx={{ fontSize: 24 }} />
                        <Typography fontSize={11}>Planner</Typography>
                    </Stack>
                </Link>
            </Stack>
        </Paper>
    );
};
