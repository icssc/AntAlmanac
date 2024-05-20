import { CloudDownload } from '@material-ui/icons';
import { LoadingButton } from '@mui/lab';
import {
    Autocomplete,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { loadSchedule } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { trpc } from '$lib/trpc';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/SettingsStore';

export function LoadButton() {
    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const authStatus = trpc.auth.status.useQuery();

    const utils = trpc.useUtils();

    const { enqueueSnackbar } = useSnackbar();

    const [userId, setUserId] = useState('');

    const isDark = useThemeStore((store) => store.isDark);

    const loadScheduleAndSetLoading = async (userID: string, rememberMe: boolean) => {
        setLoading(true);
        await loadSchedule(userID, rememberMe);
        setLoading(false);
    };

    const loadSavedSchedule = async () => {
        if (typeof Storage === 'undefined') return;

        const savedUserID = window.localStorage.getItem('userID');

        if (savedUserID == null) return;

        await loadScheduleAndSetLoading(savedUserID, true);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async () => {
        logAnalytics({
            category: analyticsEnum.nav.title,
            action: analyticsEnum.nav.actions.LOAD_SCHEDULE,
            label: userId,
            value: 1, // rememberMe ? 1 : 0,
        });

        const normalizedUserId = userId.replace(/\s+/g, '');

        if (!normalizedUserId) {
            enqueueSnackbar('Invalid user ID.', { variant: 'error' });
            setLoading(false);
            return;
        }

        if (
            AppStore.hasUnsavedChanges() &&
            !window.confirm(`Are you sure you want to load a different schedule? You have unsaved changes!`)
        ) {
            return;
        }

        try {
            const res = await utils.users.viewUserData.fetch({
                requesterId: authStatus.data?.id,
                requesteeId: userId,
            });

            const scheduleSaveState = res && 'userData' in res ? res.userData : res;

            if (scheduleSaveState == null) {
                enqueueSnackbar(`Couldn't find schedules for username "${userId}".`, { variant: 'error' });
                return;
            }

            if (await AppStore.loadSchedule(scheduleSaveState)) {
                enqueueSnackbar(`Schedule for username "${userId}" loaded.`, { variant: 'success' });
                return;
            }

            AppStore.loadSkeletonSchedule(scheduleSaveState);
            enqueueSnackbar(
                `Network error loading course information for "${userId}". 	              
                        If this continues to happen, please submit a feedback form.`,
                { variant: 'error' }
            );
        } catch (e) {
            console.error(e);
            enqueueSnackbar(`Failed to load schedules. If this continues to happen, please submit a feedback form.`, {
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const options: string[] = [];

    if (authStatus.data?.id != null) {
        options.push(authStatus.data?.id);
    }

    if (userId && userId !== authStatus.data?.id) {
        options.push(userId);
    }

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    useEffect(() => {
        loadSavedSchedule();
    }, []);

    return (
        <>
            <LoadingButton
                onClick={handleOpen}
                color="inherit"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudDownload />}
                disabled={skeletonMode}
                loading={false}
            >
                Load
            </LoadingButton>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Load</DialogTitle>

                <DialogContent>
                    <Stack gap={2}>
                        <DialogContentText>Enter a unique user ID here to view a schedule.</DialogContentText>

                        <Autocomplete
                            freeSolo
                            value={authStatus.data?.id}
                            onInputChange={(_event, newValue) => {
                                if (newValue != null) {
                                    setUserId(newValue);
                                }
                            }}
                            sx={{ width: 300 }}
                            options={options}
                            renderInput={(params) => {
                                return <TextField {...params} />;
                            }}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} color={isDark ? 'secondary' : 'primary'}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color={isDark ? 'secondary' : 'primary'}>
                        Load
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default LoadButton;
