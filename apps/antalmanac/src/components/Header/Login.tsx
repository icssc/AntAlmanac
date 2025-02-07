import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Button, Menu } from '@mui/material';
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

    const { session, setSession, validSession } = useSessionStore();
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
            const userId = await trpc.session.getSessionUserId.query({ token: session ?? '' });
            if (userId) {
                setUser(await trpc.users.getUserByUid.query({ userId: userId }));
            }
        }
    };

    useEffect(() => {
        setSession(session); // called validate the local session
        handleUser();
    }, [session, validSession]);
    return (
        <>
            {validSession ? (
                <>
                    <Button
                        aria-controls={open ? 'basic-menu' : undefined}
                        color="inherit"
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                        startIcon={<AccountCircleIcon />}
                    >
                        {user?.name}
                    </Button>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                        }}
                    >
                        <Button onClick={handleLogout} startIcon={<LogoutIcon />} color="inherit">
                            Log out
                        </Button>
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
        </>
    );
}

export default Login;
