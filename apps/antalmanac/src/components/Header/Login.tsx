import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GoogleIcon from '@mui/icons-material/Google';
import { Button, Box, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useSearchParams } from 'react-router-dom';

import trpc from '$lib/api/trpc';

interface SimpleDialogProps {
    open: boolean;
    onClose: () => void;
}
function SimpleDialog(props: SimpleDialogProps) {
    const { onClose, open } = props;

    const [searchParams] = useSearchParams();
    const [cookies, setCookie] = useCookies(['session']);

    const handleLogin = () => {
        const handleAuth = async () => {
            try {
                const authUrl = await trpc.users.getGoogleAuthUrl.query();
                if (authUrl) window.location.href = authUrl;
                const code = searchParams.get('code');
                const session = await trpc.users.handleGoogleCallback.query({
                    code: code ?? '',
                    token: cookies.session === '' || !cookies.session ? '' : cookies.session,
                });
                setCookie('session', session, { path: '/' });

                console.log(session);
            } catch (error) {
                console.error('Error during authentication', error);
            }
        };

        handleAuth();
    };

    useEffect(() => {
        console.log(cookies.session);
    }, [searchParams, setCookie]);

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
                Signin
            </Button>
            <SimpleDialog open={open} onClose={handleClose} />
        </>
    );
}

export default Login;
