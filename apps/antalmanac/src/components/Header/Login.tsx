import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GoogleIcon from '@mui/icons-material/Google';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, useSearchParams } from 'react-router-dom';

import trpc from '$lib/api/trpc';
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

    const [cookies, setCookie] = useCookies(['session']);
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
        console.log(cookies.session);
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
            <Stack spacing={2}>
                <DialogTitle fontSize={'large'}>{!openGuestOption ? 'Login or Sign Up' : 'Guest Login'}</DialogTitle>
                <DialogContent sx={{ padding: 5, width: '35rem' }}>
                    <Stack spacing={2} sx={{ marginTop: '1rem' }}>
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
                                    Continue With Google
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
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Button onClick={handleClickOpen} startIcon={<AccountCircleIcon />} color="inherit">
                Sign in
            </Button>
            <SignInDialog open={open} onClose={handleClose} />
        </>
    );
}

export default Login;
