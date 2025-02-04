import GoogleIcon from '@mui/icons-material/Google';
import { Button, DialogActions, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AuthDialog } from '$components/dialogs/AuthDialog';
import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';

interface SignInDialogProps {
    open: boolean;
    isDark: boolean;
    onClose: () => void;
}

export function SignInDialog(props: SignInDialogProps) {
    const { onClose, isDark, open } = props;

    const { session, setSession } = useSessionStore();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [userName, setUserName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [openUserNameOption, setOpenUserNameOption] = useState(false);

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

    const handleUserNameLogin = async () => {
        if (userName.length > 0) {
            const sessionId = await trpc.session.handleGuestSession.query({ name: userName });
            setSession(sessionId);
            onClose();
        }
    };

    useEffect(() => {
        handleCallback();
    }, [searchParams]);

    const handleClose = () => {
        onClose();
        handleUserNameOptionClose();
    };

    const handleUserNameOptionOpen = () => {
        setOpenUserNameOption(true);
    };

    const handleUserNameOptionClose = () => {
        setOpenUserNameOption(false);
    };

    return (
        <AuthDialog
            open={open}
            onClose={handleClose}
            title={!openUserNameOption ? 'Sign in to save' : 'Username Login'}
        >
            {!openUserNameOption ? (
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
                        onClick={handleUserNameOptionOpen}
                        size="large"
                        color={isDark ? 'secondary' : 'primary'}
                        variant="outlined"
                        sx={{
                            position: 'relative',
                            '&::after': {
                                content: '"Use your schedule name to load in your old schedule"',
                                position: 'absolute',
                                bottom: '-20px',
                                right: '0',
                                fontSize: '0.7rem',
                                fontStyle: 'italic',
                                color: isDark ? 'secondary.main' : 'primary.main',
                            },
                        }}
                    >
                        Continue with username
                    </Button>
                </>
            ) : (
                <>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleUserNameLogin();
                        }}
                    >
                        <TextField
                            label="Username"
                            color={isDark ? 'secondary' : undefined}
                            fullWidth
                            onChange={(e) => setUserName(e.target.value)}
                        />
                        <DialogActions>
                            <Button color={isDark ? 'secondary' : undefined} onClick={handleUserNameOptionClose}>
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
