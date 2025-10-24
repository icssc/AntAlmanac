import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Avatar, Menu, ListItemIcon, ListItemText, MenuItem, IconButton } from '@mui/material';
import { User } from '@packages/antalmanac-types';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';

export function Signout() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [user, setUser] = useState<null | User>(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        clearSession();
        navigate('/');
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
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                onClose={handleClose}
                open={open}
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
