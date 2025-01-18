import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GoogleIcon from '@mui/icons-material/Google';
import { Button, Box, Dialog, DialogTitle, DialogContent, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, useSearchParams } from 'react-router-dom';

import trpc from '$lib/api/trpc';

interface SimpleDialogProps {
    open: boolean;
    onClose: () => void;
}
function SimpleDialog(props: SimpleDialogProps) {
    const { onClose, open } = props;

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [cookies, setCookie] = useCookies(['session']);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleLogin = async () => {
        try {
            const authUrl = await trpc.users.getGoogleAuthUrl.query();
            if (authUrl) {
                window.location.href = authUrl; // Redirect to Google login
            }
        } catch (error) {
            console.error('Error during login initiation', error);
        }
    };
    const handleCallback = async () => {
        if (isProcessing) return; // Prevent duplicate processing
        setIsProcessing(true);

        try {
            const code = searchParams.get('code');
            if (code && !cookies.session) {
                const session = await trpc.users.handleGoogleCallback.query({
                    code: code,
                    token: cookies.session || '', // Use existing session token if available
                });

                setCookie('session', session, { path: '/' });

                // Clean up URL
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
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth={'xl'}>
            <Box
                sx={{
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}
            >
                <DialogTitle fontSize={'large'}>Login or Signup</DialogTitle>
                <DialogContent>
                    <Stack spacing={2}>
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
                        <Button onClick={handleLogin} size="large" color="primary" variant="outlined" href="#">
                            Continue As Guest
                        </Button>
                    </Stack>
                </DialogContent>
            </Box>
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
            <SimpleDialog open={open} onClose={handleClose} />
        </>
    );
}

export default Login;
