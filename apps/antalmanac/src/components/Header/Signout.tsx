import { getSettingsPopoverPaperSx } from '$components/Header/headerStyles';
import { ProfileMenuButtons } from '$components/Header/ProfileMenuButtons';
import { SettingsMenu } from '$components/Header/Settings/SettingsMenu';
import { signOut } from '$lib/auth/authClient';
import { useSessionStore } from '$stores/SessionStore';
import LogoutIcon from '@mui/icons-material/Logout';
import { Divider, ListItemIcon, ListItemText, MenuItem, Popover } from '@mui/material';
import type { UserProfile } from '@packages/db/src/schema/auth/user';
import { usePostHog } from 'posthog-js/react';
import { type MouseEvent, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface SignoutProps {
    onLogoutComplete?: () => void;
}

export function Signout({ onLogoutComplete }: SignoutProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { sessionIsValid, name, avatar, email } = useSessionStore(
        useShallow((store) => ({
            sessionIsValid: store.sessionIsValid,
            name: store.name,
            avatar: store.avatar,
            email: store.email,
        }))
    );
    const postHog = usePostHog();

    const user = useMemo<UserProfile | null>(
        () =>
            sessionIsValid
                ? {
                      name: name ?? null,
                      avatar: avatar ?? null,
                      email: email ?? null,
                  }
                : null,
        [sessionIsValid, name, avatar, email]
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
                        sx: getSettingsPopoverPaperSx(),
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
