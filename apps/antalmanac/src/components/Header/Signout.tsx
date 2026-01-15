import LogoutIcon from '@mui/icons-material/Logout';
import { Divider, ListItemIcon, ListItemText, MenuItem, Popover } from '@mui/material';
import { User } from '@packages/antalmanac-types';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsMenu } from '$components/Header/SettingsMenu';

import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
import { ProfileMenuButtons } from '$components/Header/ProfileMenuButtons';

export function Signout() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [user, setUser] = useState<null | User>(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (!session) {
            navigate('/');
            return;
        }

        try {
            const { logoutUrl } = await trpc.userData.logout.mutate({
                sessionToken: session,
                redirectUrl: window.location.origin,
            });
            clearSession();

            window.location.href = logoutUrl;
        } catch (error) {
            console.error('Error during logout', error);
            clearSession();
            navigate('/');
        }
    };

    const { session, sessionIsValid, clearSession } = useSessionStore();

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleAuthChange = useCallback(async () => {
        if (sessionIsValid) {
            const userData = await trpc.userData.getUserAndAccountBySessionToken
                .query({ token: session ?? '' })
                .then((res) => res.users);
            setUser(userData);
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
