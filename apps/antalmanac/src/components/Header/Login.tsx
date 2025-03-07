import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Avatar, Button, Menu, ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { User } from '@packages/antalmanac-types';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { SignInDialog } from '$components/dialogs/SignInDialog';
import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId, removeLocalStorageSessionId } from '$lib/localStorage';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

function Login() {
    const [openSignIn, setOpenSignIn] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [user, setUser] = useState<null | User>(null);
    const currentSession = useRef<string | null>(getLocalStorageSessionId());
    const [reLogin, setRelogin] = useState(true);
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
        if (!validSession && getLocalStorageSessionId()) {
            removeLocalStorageSessionId();
        }
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
        setSession(session);
        handleUser();
        if (reLogin && !validSession && currentSession.current) {
            setOpenSignIn(true);
            setRelogin(false);
        }
    }, [session, validSession, user, openSignIn]);

    return (
        <div id="load-save-container">
            {validSession ? (
                <>
                    <Button
                        aria-controls={open ? 'basic-menu' : undefined}
                        color="inherit"
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                        sx={{ maxWidth: '9rem', minWidth: '3rem' }}
                        startIcon={!user?.avatar && <AccountCircleIcon />}
                    >
                        {/* {user?.name && user?.name.length > 6 ? `${user?.name.substring(0, 6)}...` : user?.name} */}

                        {user?.avatar ? (
                            <Avatar
                                sx={{ width: '2.2rem', height: '2.2rem' }}
                                src={`${user?.avatar}`}
                                alt={`${user?.name}-photo`}
                            />
                        ) : user?.name && window.innerWidth < 600 ? (
                            `${user?.name.substring(0, 6)}...`
                        ) : (
                            user?.name
                        )}
                    </Button>
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
