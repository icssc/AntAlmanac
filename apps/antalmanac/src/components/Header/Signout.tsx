import LogoutIcon from '@mui/icons-material/Logout';
import { ListItemIcon, ListItemText, MenuItem, Popover, Divider } from '@mui/material';
import { User } from '@packages/antalmanac-types';
import { useEffect, useState, useCallback, type MouseEvent } from 'react';

import { ProfileMenuButtons } from '$components/Header/ProfileMenuButtons';
import { SettingsMenu } from '$components/Header/Settings/SettingsMenu';
import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';

interface SignoutProps {
    onLogoutComplete?: () => void;
}

export function Signout({ onLogoutComplete }: SignoutProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [user, setUser] = useState<Pick<User, 'name' | 'avatar' | 'email'> | null>(null);
    const { session, sessionIsValid, clearSession } = useSessionStore();

    const open = Boolean(anchorEl);
    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleLogout = async () => {
        setAnchorEl(null);
        if (!session) {
            await clearSession();
            onLogoutComplete?.();
            return;
        }

        try {
            await trpc.userData.logout.mutate({
                sessionToken: session,
                redirectUrl: window.location.origin,
            });

            await clearSession();
            onLogoutComplete?.();
        } catch (error) {
            console.error('Error during logout', error);
            // Even on error, clear session and show dialog
            await clearSession();
            onLogoutComplete?.();
        }
    };

    const handleAuthChange = useCallback(async () => {
        if (sessionIsValid) {
            const userData = await trpc.userData.getUserAndAccountBySessionToken
                .query({ token: session ?? '' })
                .then((res) => res.users);
            setUser({
                name: userData.name ?? undefined,
                avatar: userData.avatar ?? undefined,
                email: userData.email ?? undefined,
            });
        }
    }, [session, sessionIsValid, setUser]);

    useEffect(() => {
        if (sessionIsValid) {
            handleAuthChange();
        }
    }, [handleAuthChange, sessionIsValid]);

    return (
        <div id="load-save-container">
            <ProfileMenuButtons user={user} handleOpen={handleClick} handleSettingsOpen={handleClick} />
            <Popover
                open={open}
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
                        sx: {
                            width: {
                                xs: 300,
                                sm: 300,
                                md: 330,
                            },
                            p: '16px 20px',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'background.default',
                        },
                    },
                }}
            >
                <SettingsMenu user={user} />

                <Divider style={{ marginTop: '10px', marginBottom: '12px' }} />

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
