import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GoogleIcon from '@mui/icons-material/Google';
import { Button, DialogActions, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthDialog } from '$components/dialogs/AuthDialog';
import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

interface SignInDialogProps {
    open: boolean;
    isDark: boolean;
    onClose: () => void;
}

function SignInDialog(props: SignInDialogProps) {
    const { onClose, isDark, open } = props;

    const { session, setSession } = useSessionStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [guestName, setGuestName] = useState('');
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
            // const token = useSessionStore.getState().session;
            if (code) {
                const newSession = await trpc.users.handleGoogleCallback.query({
                    code: code,
                    token: session ?? '',
                });
                setSession(newSession);
                navigate('/');
            }
        } catch (error) {
            console.error('Error during authentication', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGuestLogin = async () => {
        if (guestName.length > 0) {
            const sessionId = await trpc.session.handleGuestSession.query({ name: guestName });
            setSession(sessionId);
            navigate('/');
            onClose();
        }
    };

    useEffect(() => {
        handleCallback();
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
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleGuestLogin();
                        }}
                    >
                        <TextField
                            label="Guest Name"
                            color={isDark ? 'secondary' : undefined}
                            fullWidth
                            onChange={(e) => setGuestName(e.target.value)}
                        />
                        <DialogActions>
                            <Button color={isDark ? 'secondary' : undefined} onClick={handleGuestOptionClose}>
                                Cancel
                            </Button>
                            <Button color="primary" variant="contained" type="submit">
                                Continue
                            </Button>
                        </DialogActions>
                    </form>
                </>
            )}
        </AuthDialog>
    );
}

function SignOutDialog(props: SignInDialogProps) {
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

    const { session, setSession, validSession } = useSessionStore();
    const isDark = useThemeStore((store) => store.isDark);

    const handleClickSignOut = () => {
        setOpenSignOut(!openSignOut);
    };

    const handleClickSignIn = () => {
        setOpenSignIn(!openSignIn);
    };

    useEffect(() => {
        console.log(validSession, session);
        setSession(session); // called validate the local session
    }, [session, validSession]);
    return (
        <>
            {validSession ? (
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
        </>
    );
}

export default Login;
