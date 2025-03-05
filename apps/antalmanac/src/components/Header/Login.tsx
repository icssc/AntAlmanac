import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { LoadingButton } from '@mui/lab';
import { Button, Menu, ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { User } from '@packages/antalmanac-types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SignInDialog } from '$components/dialogs/SignInDialog';
import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

function Login() {
    const [openSignIn, setOpenSignIn] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [user, setUser] = useState<null | User>(null);

    const { clearSession } = useSessionStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        clearSession();
        navigate('/');
    };

    const { session, updateSession: setSession, sessionIsValid: validSession } = useSessionStore();
    const isDark = useThemeStore((store) => store.isDark);

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClickSignIn = () => {
        setOpenSignIn(!openSignIn);
    };

    const handleUser = async () => {
        if (validSession) {
            const userId = await trpc.auth.getSessionUserId.query({ token: session ?? '' });
            if (userId) {
                setUser(await trpc.userData.getUserByUid.query({ userId: userId }));
            }
        }
    };

    useEffect(() => {
        setSession(session); // called validate the local session
        handleUser();
    }, [session, validSession, user]);
    return (
        <div id="load-save-container">
            {validSession ? (
                <>
                    <LoadingButton
                        aria-controls={open ? 'basic-menu' : undefined}
                        color="inherit"
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                        startIcon={<AccountCircleIcon />}
                        loading={user === null}
                        loadingPosition="start"
                        sx={{ maxWidth: '9rem', minWidth: '5rem' }}
                    >
                        {user?.name && user?.name.length > 6 ? `${user?.name.substring(0, 6)}...` : user?.name}
                    </LoadingButton>
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
                </>
            ) : (
                <>
                    <Button onClick={handleClickSignIn} startIcon={<AccountCircleIcon />} color="inherit">
                        Sign in
                    </Button>
                    <SignInDialog isDark={isDark} open={openSignIn} onClose={handleClickSignIn} />
                </>
            )}
        </div>
    );
}

export default Login;
