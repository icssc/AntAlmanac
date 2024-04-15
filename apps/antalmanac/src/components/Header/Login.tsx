import { Login as LoginIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControlLabel,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from 'react';

import { loadSchedule } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/SettingsStore';

function LoginButton() {
    const isDark = useThemeStore((store) => store.isDark);

    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const [userId, setUserId] = useState('');

    const [rememberMe, setRememberMe] = useState(true);

    const handleOpen = () => {
        setOpen(true);

        if (typeof Storage === 'undefined') return;

        const savedUserId = window.localStorage.getItem('userID');

        if (savedUserId != null) {
            setUserId(savedUserId);
        }
    };

    const handleKeyDown = async (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            await handleSubmit();
        }
    };

    const handleCancel = () => {
        setUserId('');
        setOpen(false);
    };

    const handleSubmit = async () => {
        setLoading(true);
        await loadSchedule(userId, rememberMe);
        setLoading(false);
        setUserId('');
        setOpen(false);
    };

    const handleUserIdChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setUserId(event.target.value);
    };

    const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRememberMe(event.target.checked);
    };

    const loadInitialSchedule = async () => {
        if (typeof Storage === 'undefined') return;

        const savedUserID = window.localStorage.getItem('userID');

        if (savedUserID == null) return;

        setLoading(true);
        await loadSchedule(savedUserID, rememberMe);
        setLoading(false);
    };

    useEffect(() => {
        loadInitialSchedule();
    }, []);

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    return (
        <>
            <LoadingButton
                onClick={handleOpen}
                color="inherit"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                disabled={skeletonMode}
                loading={false}
            >
                Login
            </LoadingButton>

            <Dialog open={open} onClose={handleCancel}>
                <DialogTitle>Login</DialogTitle>

                <DialogContent>
                    <Stack gap={2}>
                        <Stack gap={1}>
                            <DialogContentText>Enter your unique user ID here to login.</DialogContentText>

                            <DialogContentText color="red">
                                Make sure the user ID is unique and secret, or someone else can overwrite your schedule.
                            </DialogContentText>

                            <TextField
                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                autoFocus
                                margin="dense"
                                label="Unique User ID"
                                type="text"
                                fullWidth
                                placeholder="Enter here"
                                value={userId}
                                onChange={handleUserIdChange}
                                onKeyDown={handleKeyDown}
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox checked={rememberMe} onChange={handleRememberMeChange} color="primary" />
                                }
                                label="Remember Me (Uncheck on shared computers)"
                            />

                            <Button onClick={handleSubmit} color={isDark ? 'secondary' : 'primary'}>
                                Login
                            </Button>
                        </Stack>

                        <Divider />

                        <Stack sx={{ pointerEvents: 'none', opacity: 0.5 }} gap={1}>
                            <Typography variant="subtitle1" align="center">
                                WIP
                            </Typography>

                            <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                    console.log(credentialResponse);
                                }}
                                onError={() => {
                                    console.log('Login Failed');
                                }}
                            />
                        </Stack>
                    </Stack>

                    <DialogActions>
                        <Button onClick={handleCancel} color="error">
                            Cancel
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default LoginButton;
