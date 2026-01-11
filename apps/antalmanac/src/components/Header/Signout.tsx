import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Avatar, Divider, Menu, ListItemIcon, ListItemText, MenuItem, IconButton, Popover } from '@mui/material';
import { User } from '@packages/antalmanac-types';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsMenu } from '$components/Header/SettingsMenu';
import {MenuRounded } from '@mui/icons-material';

import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';

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
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
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
            <IconButton
                aria-controls={open ? 'basic-menu' : undefined}
                color="inherit"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                sx={{ width: 'fit-content', borderRadius: 4 }}
            >
                {user?.avatar ? (
                    <Avatar
                        sx={{ width: '2rem', height: '2rem' }}
                        src={`${user?.avatar}`}
                        alt={`${user?.name}-photo`}
                    />
                ) : (
                    <AccountCircleIcon />
                )}
                <MenuRounded sx = {{ml: 0.5}} />
            </IconButton>
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
                            width: {xs: 200, sm: 260, md: 330},
                            maxWidth: '100vw',
                            p: '16px 20px',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'background.default',
                        },
                    },
                }}
            >
                <SettingsMenu user={user} />

                <Divider style={{ marginTop: '10px', marginBottom: '12px' }}/>

                <MenuItem onClick={handleLogout} sx={{ pl: 0 }}>
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
