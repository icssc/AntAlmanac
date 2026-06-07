import { getSettingsPopoverPaperSx } from '$components/Header/headerStyles';
import { ProfileMenuButtons } from '$components/Header/ProfileMenuButtons';
import { SettingsMenu } from '$components/Header/Settings/SettingsMenu';
import { authClient, signOut } from '$lib/auth/authClient';
import { useThemeStore } from '$stores/SettingsStore';
import LogoutIcon from '@mui/icons-material/Logout';
import { Divider, ListItemIcon, ListItemText, MenuItem, Popover } from '@mui/material';
import type { UserProfile } from '@packages/db/src/schema/auth/user';
import { usePostHog } from 'posthog-js/react';
import { type MouseEvent, useMemo, useState } from 'react';

interface SignoutProps {
    onLogoutComplete?: () => void;
}

export function Signout({ onLogoutComplete }: SignoutProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { data: session } = authClient.useSession();
    const postHog = usePostHog();
    const isDark = useThemeStore((store) => store.isDark);

    const user = useMemo<UserProfile | null>(
        () =>
            session
                ? {
                      name: session.user.name ?? null,
                      avatar: session.user.avatar ?? null,
                      email: session.user.email ?? null,
                  }
                : null,
        [session]
    );

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleLogout = async () => {
        setAnchorEl(null);

        signOut({ onLogoutComplete, postHog });
    };

    return (
        <div id="load-save-container">
            <ProfileMenuButtons user={user} handleOpen={handleClick} handleSettingsOpen={handleClick} />
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        sx: getSettingsPopoverPaperSx(isDark),
                    },
                }}
            >
                <SettingsMenu user={user} onClose={() => setAnchorEl(null)} />

                <Divider style={{ marginTop: '20px', marginBottom: '12px' }} />

                <MenuItem onClick={handleLogout} sx={{ px: 1, py: 1.25, borderRadius: 1 }}>
                    <ListItemIcon>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Log out"
                        primaryTypographyProps={{
                            sx: {
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                            },
                        }}
                    />
                </MenuItem>
            </Popover>
        </div>
    );
}
