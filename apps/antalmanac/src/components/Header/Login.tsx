import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GoogleIcon from '@mui/icons-material/Google';
import LogoutIcon from '@mui/icons-material/Logout';
import { Avatar, Menu, ListItemIcon, ListItemText, MenuItem, IconButton, Button } from '@mui/material';
import { User } from '@packages/antalmanac-types';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { loginUser } from '$actions/AppStoreActions';
import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
``;

export function Login() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [user, setUser] = useState<null | User>(null);

    const navigate = useNavigate();

    const handleLogout = async () => {
        clearSession();
        navigate('/');
    };

    const { session, sessionIsValid, clearSession } = useSessionStore();

    const openMenu = Boolean(anchorEl);
    const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
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
            {sessionIsValid ? (
                <IconButton
                    aria-controls={openMenu ? 'basic-menu' : undefined}
                    color="inherit"
                    aria-haspopup="true"
                    aria-expanded={openMenu ? 'true' : undefined}
                    onClick={handleClickMenu}
                    sx={{ width: 'fit-content' }}
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
                </IconButton>
            ) : (
                <Button color="inherit" startIcon={<GoogleIcon />} onClick={loginUser}>
                    Sign in
                </Button>
            )}

            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                onClose={handleCloseMenu}
                open={openMenu}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText>Log out</ListItemText>
                </MenuItem>
            </Menu>
        </div>
    );
}
