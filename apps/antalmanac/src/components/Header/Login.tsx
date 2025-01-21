import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GoogleIcon from '@mui/icons-material/Google';
import { Button, DialogActions, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthDialog } from '$components/dialogs/AuthDialog';
import trpc from '$lib/api/trpc';
import { COOKIES } from '$lib/cookies';
import { useThemeStore } from '$stores/SettingsStore';

interface SignInDialogProps {
    open: boolean;
    isDark: boolean;
    onClose: () => void;
}

function SignInDialog(props: SignInDialogProps) {
    const { onClose, isDark, open } = props;

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [cookies, setCookie] = useCookies([COOKIES.SESSION]);
    const [isProcessing, setIsProcessing] = useState(false);

    const [openGuestOption, setOpenGuestOption] = useState(false);

    const handleLogin = async () => {
        try {
            const authUrl = await trpc.users.getGoogleAuthUrl.query();
            if (authUrl) {
                window.location.href = authUrl;
            }
        } catch (error) {
            console.error('Error during login initiation', error);
        }
    };

    const handleCallback = async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const code = searchParams.get('code');
            if (code && !cookies.session) {
                const session = await trpc.users.handleGoogleCallback.query({
                    code: code,
                    token: cookies.session || '',
                });

                setCookie('session', session, { path: '/', sameSite: 'none' });

                const newUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, '', newUrl);
                console.log(cookies.session);

                console.log('Session:', session);
            }
        } catch (error) {
            console.error('Error during authentication', error);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        handleCallback();
        navigate('/');
    }, [searchParams]);

    const handleClose = () => {
        onClose();
        handleGuestOptionClose();
    };

    const handleGuestOptionOpen = () => {
        setOpenGuestOption(true);
    };

    const handleGuestOptionClose = () => {
        setOpenGuestOption(false);
    };

    return (
        <AuthDialog open={open} onClose={handleClose} title={!openGuestOption ? 'Sign in' : 'Guest Login'}>
            {!openGuestOption ? (
                <>
                    <Button
                        onClick={handleLogin}
                        startIcon={<GoogleIcon />}
                        size="large"
                        color="primary"
                        variant="contained"
                    >
                        Sign in with Google
                    </Button>
                    <Button
                        onClick={handleGuestOptionOpen}
                        size="large"
                        color={isDark ? 'secondary' : 'primary'}
                        variant="outlined"
                    >
                        Continue As Guest
                    </Button>
                </>
            ) : (
                <>
                    <TextField label="Username" color={isDark ? 'secondary' : undefined} fullWidth />
                    <DialogActions>
                        <Button color={isDark ? 'secondary' : undefined} onClick={handleGuestOptionClose}>
                            Cancel
                        </Button>
                        <Button color="primary" variant="contained">
                            Continue
                        </Button>
                    </DialogActions>
                </>
            )}
        </AuthDialog>
    );
}

function SignOutDialog(props: SignInDialogProps) {
    const { onClose, isDark, open } = props;
    const [cookie, _, removeCookie] = useCookies([COOKIES.SESSION]);
    const navigate = useNavigate();

    const handleLogout = async () => {
        removeCookie(COOKIES.SESSION);
        console.log(cookie.session);
        await trpc.users.removeSession.mutate({ token: cookie.session });
        navigate('/');
        onClose();
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
    const [openSignIn, setOpenSignIn] = useState(true);
    const [openSignOut, setOpenSignOut] = useState(false);
    const [hasSession, setHasSession] = useState(false);
    const [cookies] = useCookies([COOKIES.SESSION]);

    const isDark = useThemeStore((store) => store.isDark);

    const handleClickSignOut = () => {
        setOpenSignOut(!openSignOut);
    };

    const handleClickSignIn = () => {
        setOpenSignIn(!openSignIn);
    };

    const validateSession = async () => {
        setHasSession(await trpc.users.validateSession.query({ token: cookies.session }));
    };

    useEffect(() => {
        if (hasSession) {
            setOpenSignIn(false);
        }
        validateSession();
    }, [hasSession, cookies]);
    return (
        <>
            {hasSession ? (
                <>
                    <Button onClick={handleClickSignOut} startIcon={<AccountCircleIcon />} color="inherit">
                        Log out
                    </Button>
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

            <Button onClick={handleClickSignIn} startIcon={<AccountCircleIcon />} color="inherit">
                Sign in
            </Button>
            <SignInDialog isDark={isDark} open={openSignIn} onClose={handleClickSignIn} />
        </>
    );
}

export default Login;
