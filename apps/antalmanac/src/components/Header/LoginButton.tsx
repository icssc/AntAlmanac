import LoginIcon from '@mui/icons-material/Login';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { trpc } from '$lib/trpc';
import AppStore from '$stores/AppStore';

/**
 * Opens dialog for logging in.
 */
export function LoginButton() {
    const [userId, setUserId] = useState('');

    const [open, setOpen] = useState(false);

    const snackbar = useSnackbar();

    const usernameLoginMutation = trpc.auth.loginUsername.useMutation();

    const googleLoginMutation = trpc.auth.loginGoogle.useMutation();

    const utils = trpc.useUtils();

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleUserIdChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setUserId(event.target.value);
    };

    const handleUsernameLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        logAnalytics({
            category: analyticsEnum.nav.title,
            action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
            label: userId,
            value: 1,
        });

        const shouldStop =
            AppStore.hasUnsavedChanges() &&
            !window.confirm('Are you sure you want to load a different schedule? You have unsaved changes!');

        if (shouldStop) return;

        if (userId.length === 0) {
            snackbar.enqueueSnackbar('Please enter a user ID.');
            return;
        }

        try {
            const response = await usernameLoginMutation.mutateAsync(userId);

            await utils.auth.status.invalidate();

            if (response?.userData == null) {
                snackbar.enqueueSnackbar(`Logged in as "${userId}", no schedules found.`);
                setOpen(false);
                return;
            }

            const loadedSchedule = await AppStore.loadSchedule(response.userData);

            if (loadedSchedule == null) {
                AppStore.loadSkeletonSchedule(response.userData);
                snackbar.enqueueSnackbar(
                    `Network error loading course information for "${userId}". 	              
                        If this continues to happen, please submit a feedback form.`,
                    { variant: 'error' }
                );
                setOpen(false);
                return;
            }

            snackbar.enqueueSnackbar(`Schedule for username "${userId}" loaded.`, { variant: 'success' });

            setOpen(false);
        } catch (e) {
            console.error('Error occurred while loading schedules: ', e);
            snackbar.enqueueSnackbar(
                `Failed to load schedules. If this continues to happen, please submit a feedback form.`,
                { variant: 'error' }
            );
            setOpen(false);
        }
    };

    const handleGoogleLogin = async (credential: CredentialResponse) => {
        if (credential.credential == null) {
            console.error('Did not receive google credential');
            return;
        }

        try {
            const response = await googleLoginMutation.mutateAsync(credential.credential);

            await utils.auth.status.invalidate();

            if (response?.userData == null) {
                snackbar.enqueueSnackbar(`Logged in as "${response?.id}", no schedules found.`);
                setOpen(false);
                return;
            }

            const loadedSchedule = await AppStore.loadSchedule(response.userData);

            if (loadedSchedule == null) {
                AppStore.loadSkeletonSchedule(response.userData);
                snackbar.enqueueSnackbar(
                    `Network error loading course information for "${userId}". 	              
                        If this continues to happen, please submit a feedback form.`,
                    { variant: 'error' }
                );
                setOpen(false);
                return;
            }

            snackbar.enqueueSnackbar(`Schedule for username "${userId}" loaded.`, { variant: 'success' });

            setOpen(false);
        } catch (e) {
            console.error('Error occurred while loading schedules: ', e);
            snackbar.enqueueSnackbar(
                `Failed to load schedules. If this continues to happen, please submit a feedback form.`,
                { variant: 'error' }
            );
            setOpen(false);
        }
    };

    const handleGoogleError = async () => {
        console.log('Login Failed');
    };

    return (
        <>
            <Button onClick={handleOpen} color="inherit" startIcon={<LoginIcon />}>
                Login
            </Button>
            <Dialog onClose={handleClose} open={open}>
                <DialogTitle>Login</DialogTitle>

                <DialogContent>
                    <Stack gap={2}>
                        <Stack gap={2}>
                            <Typography variant="h6">Username</Typography>

                            <Stack>
                                <Box>
                                    <Typography>Enter your unique user ID here to login.</Typography>
                                    <Typography style={{ color: 'red' }}>
                                        Make sure the user ID is unique and secret, or someone else can overwrite your
                                        schedule.
                                    </Typography>
                                </Box>

                                <form onSubmit={handleUsernameLogin}>
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
                                    />

                                    <Box marginTop={2}>
                                        <Button color="inherit" variant="outlined" type="submit">
                                            Submit
                                        </Button>
                                    </Box>
                                </form>
                            </Stack>
                        </Stack>

                        <Divider />

                        <Stack gap={1}>
                            <Typography variant="h6">Providers</Typography>
                            <Box>
                                <GoogleLogin onSuccess={handleGoogleLogin} onError={handleGoogleError} />
                            </Box>
                        </Stack>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} color="inherit">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default LoginButton;
