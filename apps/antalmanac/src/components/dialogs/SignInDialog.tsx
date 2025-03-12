import GoogleIcon from '@mui/icons-material/Google';
import { Button, TextField, Stack, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { isEmptySchedule } from '$actions/AppStoreActions';
import { InputDialog } from '$components/dialogs/InputDialog';
import trpc from '$lib/api/trpc';
import { setLocalStorageDataCache } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
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

    const cacheSchedule = () => {
        const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState().schedules;
        if (!isEmptySchedule(scheduleSaveState)) {
            setLocalStorageDataCache(JSON.stringify(scheduleSaveState));
        }
    };

    const handleLogin = async () => {
        try {
            const authUrl = await trpc.userData.getGoogleAuthUrl.query();
            if (authUrl) {
                cacheSchedule();
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
                const newSession = await trpc.userData.handleGoogleCallback.query({
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
            const sessionId = await trpc.auth.handleGuestSession.query({ name: userName });

            cacheSchedule();
            setSession(sessionId);
            onClose();
        }
    };

    useEffect(() => {
        handleCallback();
    }, [searchParams]);

    const handleClose = () => {
        onClose();
    };

    return (
        <InputDialog open={open} onClose={handleClose} title={'Sign in'}>
            <Stack spacing={2} alignItems="center">
                <Button
                    onClick={handleLogin}
                    startIcon={<GoogleIcon />}
                    size="large"
                    color="primary"
                    variant="contained"
                    sx={{ width: '75%' }}
                >
                    Sign in with Google
                </Button>

                <Divider sx={{ width: '100%' }}>or</Divider>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleUserNameLogin();
                    }}
                    style={{ width: '75%' }}
                >
                    <Stack spacing={1}>
                        <TextField
                            label="Sign In With Guest Username"
                            color={isDark ? 'secondary' : undefined}
                            fullWidth
                            size="small"
                            helperText="Have an old schedule? Enter your user ID here"
                            onChange={(e) => setUserName(e.target.value)}
                        />
                        <Button
                            color="primary"
                            variant="contained"
                            disabled={userName.length === 0}
                            type="submit"
                            sx={{ width: 'fit-content', alignSelf: 'end' }}
                        >
                            Continue
                        </Button>
                    </Stack>
                </form>
            </Stack>
        </InputDialog>
    );
}
