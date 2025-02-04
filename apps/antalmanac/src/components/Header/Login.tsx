import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Button, Menu } from '@mui/material';
import { User } from '@packages/antalmanac-types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthDialog } from '$components/dialogs/AuthDialog';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';


interface DialogProps {
    open: boolean;
    isDark: boolean;
    onClose: () => void;
}

function SignOutDialog(props: DialogProps) {
    const { onClose, isDark, open } = props;
    const { clearSession } = useSessionStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        clearSession();
        navigate('/');
    };
    return (
        <AuthDialog open={open} onClose={onClose} title={'Log Out'}>
            <Button variant="contained" color="error" size="large" onClick={handleLogout}>
                Logout
            </Button>
            <Button variant="outlined" color={isDark ? 'secondary' : undefined} size="large" onClick={onClose}>
                Cancel
            </Button>
        </AuthDialog>
    );
}

function Login() {
    const [openSignIn, setOpenSignIn] = useState(false);
    const [openSignOut, setOpenSignOut] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [user, setUser] = useState<null | User>(null);

    const { session, setSession, validSession } = useSessionStore();
    const isDark = useThemeStore((store) => store.isDark);

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClickSignOut = () => {
        setOpenSignOut(!openSignOut);
    };

    const handleClickSignIn = () => {
        setOpenSignIn(!openSignIn);
    };

    const handleUser = async () => {
        if (validSession) {
            const userId = await trpc.session.getSessionUserId.query({ token: session ?? '' });
            if (userId) {
                setUser(await trpc.users.getUserByUid.query({ userid: userId }));
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
                        <Button onClick={handleClickSignOut} startIcon={<LogoutIcon />} color="inherit">
                            Log out
                        </Button>
                    </Menu>
                    <SignOutDialog isDark={isDark} open={openSignOut} onClose={handleClickSignOut} />
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
