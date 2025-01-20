import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GoogleIcon from '@mui/icons-material/Google';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, useSearchParams } from 'react-router-dom';

import trpc from '$lib/api/trpc';
import { COOKIES } from '$lib/cookies';
import { useThemeStore } from '$stores/SettingsStore';

interface SignInDialogProps {
    open: boolean;
    onClose: () => void;
}

function SignInDialog(props: SignInDialogProps) {
    const { onClose, open } = props;

    const isDark = useThemeStore((store) => store.isDark);

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

                setCookie('session', session, { path: '/' });

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
        <Dialog open={open} onClose={handleClose} maxWidth={'xl'}>
            <Stack spacing={0} sx={{ textAlign: 'center' }}>
                <DialogTitle fontSize={'large'}>{!openGuestOption ? 'Sign in' : 'Guest Login'}</DialogTitle>
                <DialogContent sx={{ width: '35rem', height: '13rem' }}>
                    <Stack spacing={2} sx={{ paddingTop: '1rem' }}>
                        {!openGuestOption ? (
                            <>
                                <Button
                                    onClick={handleLogin}
                                    startIcon={<GoogleIcon />}
                                    size="large"
                                    color="primary"
                                    variant="contained"
                                    href="#"
                                >
                                    Sign in with Google
                                </Button>
                                <Button
                                    onClick={handleGuestOptionOpen}
                                    size="large"
                                    color={isDark ? 'secondary' : 'primary'}
                                    variant="outlined"
                                    href="#"
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
                    </Stack>
                </DialogContent>
            </Stack>
        </Dialog>
    );
}

function Login() {
    const [open, setOpen] = useState(true);
    const [hasSession, setHasSession] = useState(false);
    const [cookies] = useCookies([COOKIES.SESSION]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const validateSession = async () => {
        const session = await trpc.users.validateSession.query({ token: cookies.session });
        console.log(session);
        setHasSession(session !== null);
    };

    useEffect(() => {
        if (hasSession) {
            setOpen(false);
        }
        validateSession();
    }, [hasSession, cookies]);
    return (
        <>
            {hasSession ? (
                <>
                    <Button onClick={handleClickOpen} startIcon={<AccountCircleIcon />} color="inherit">
                        Log out
                    </Button>
                    <SignInDialog open={open} onClose={handleClose} />
                </>
            ) : (
                <>
                    <Button onClick={handleClickOpen} startIcon={<AccountCircleIcon />} color="inherit">
                        Sign in
                    </Button>
                    <SignInDialog open={open} onClose={handleClose} />
                </>
            )}
        </>
    );
}

export default Login;
