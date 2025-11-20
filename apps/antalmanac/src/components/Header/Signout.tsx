import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Avatar, Menu, ListItemIcon, ListItemText, MenuItem, IconButton } from '@mui/material';
import { User } from '@packages/antalmanac-types';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { openSnackbar } from '$actions/AppStoreActions';
import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';

export function Signout() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [user, setUser] = useState<null | User>(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        // Store the user's name/email before logout
        const accountName = user?.name || user?.email || 'your account';

        // Close the menu
        setAnchorEl(null);

        // Show notification FIRST, before clearing session
        openSnackbar(
            'info',
            `Signed out of ${accountName}`,
            4000, // ** Important: Show for 4 seconds (adjust as needed)
            { vertical: 'top', horizontal: 'right' } // Position at top-right
        );

        // Wait a brief moment for notification to appear, then clear session
        // The clearSession will reload the page, which is fine since notification already showed
        setTimeout(async () => {
            await clearSession();
            navigate('/');
        }, 800); // ** Important: Small delay to ensure notification renders
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
