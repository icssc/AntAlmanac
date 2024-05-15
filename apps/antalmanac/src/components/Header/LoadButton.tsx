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
import { useEffect, useMemo, useState } from 'react';

import { loadSchedule } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/SettingsStore';

export function LoadButton() {
    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const [userId, setUserId] = useState('');

    const isDark = useThemeStore((store) => store.isDark);

    const loadScheduleAndSetLoading = async (userID: string, rememberMe: boolean) => {
        setLoading(true);
        await loadSchedule(userID, rememberMe);
        setLoading(false);
    };

    const loadSavedSchedule = async () => {
        if (typeof Storage !== 'undefined') {
            const savedUserID = window.localStorage.getItem('userID');

            if (savedUserID != null) {
                void loadScheduleAndSetLoading(savedUserID, true);
            }
        }
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

    /**
     * TODO: actually generate options.
     */
    const options = useMemo(() => {
        return ['a', 'b', 'c'];
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
                <DialogTitle>Load {userId}</DialogTitle>

                <DialogContent>
                    <Stack gap={2}>
                        <DialogContentText>Enter a unique user ID here to view a schedule.</DialogContentText>

                        <Autocomplete
                            freeSolo
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
