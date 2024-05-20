import { Save } from '@material-ui/icons';
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
import { useEffect, useState } from 'react';

import { loadSchedule } from '$actions/AppStoreActions';
import { trpc } from '$lib/trpc';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/SettingsStore';

export function SaveButton() {
    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const authStatus = trpc.auth.status.useQuery();

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

    const handleSubmit = () => {
        console.log('Submitting');
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
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                disabled={skeletonMode}
                loading={false}
            >
                Save
            </LoadingButton>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Save</DialogTitle>

                <DialogContent>
                    <Stack gap={2}>
                        <DialogContentText>Enter a unique user ID here to save a schedule.</DialogContentText>

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

export default SaveButton;
