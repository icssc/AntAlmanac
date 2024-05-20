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
    FormControl,
    FormLabel,
    FormControlLabel,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Tooltip,
} from '@mui/material';
import { TRPCError } from '@trpc/server';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { trpc } from '$lib/trpc';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/SettingsStore';

export function SaveButton() {
    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const [visibility, setVisibility] = useState('public');

    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const [userId, setUserId] = useState('');

    const { enqueueSnackbar } = useSnackbar();

    const isDark = useThemeStore((store) => store.isDark);

    const authStatus = trpc.auth.status.useQuery();

    const saveMutation = trpc.users.saveUserData.useMutation();

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handlevisibilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVisibility(e.target.value);
    };

    const handleSubmit = async () => {
        setLoading(true);

        logAnalytics({
            category: analyticsEnum.nav.title,
            action: analyticsEnum.nav.actions.SAVE_SCHEDULE,
            label: userId,
            value: 1,
        });

        const normalizedUserId = userId.replace(/\s+/g, '');

        if (!normalizedUserId) {
            enqueueSnackbar('Invalid user ID.', { variant: 'error' });
            setLoading(false);
            return;
        }

        const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

        try {
            await saveMutation.mutateAsync({
                /**
                 * Requester ID.
                 *
                 * The user may be logged in, and save the schedule under a different account.
                 * Based on the schedule's visibility settings, this may or may not be permitted.
                 *
                 * If the user is not logged in, assume that the requester and requestee are the same.
                 */
                id: authStatus.data?.id ?? normalizedUserId,

                /**
                 * Assume that the schedule belongs to whatever the specified userId is.
                 */
                data: {
                    id: normalizedUserId,
                    visibility,
                    userData: scheduleSaveState,
                },
            });

            enqueueSnackbar(
                `Schedule saved under username "${normalizedUserId}". Don't forget to sign up for classes on WebReg!`,
                { variant: 'success' }
            );
            AppStore.saveSchedule();
        } catch (e) {
            if (e instanceof TRPCError) {
                enqueueSnackbar(`Schedule could not be saved under username "${normalizedUserId}`, {
                    variant: 'error',
                });
            } else {
                enqueueSnackbar('Network error or server is down.', { variant: 'error' });
            }
        }

        setLoading(false);
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

                        <FormControl>
                            <FormLabel>Visibility</FormLabel>
                            <RadioGroup value={visibility} onChange={handlevisibilityChange}>
                                <Tooltip title="Anybody can view and edit the schedule." placement="left">
                                    <FormControlLabel value="public" control={<Radio />} label="Public" />
                                </Tooltip>
                                <Tooltip
                                    title="Anybody can view the schedule. But only the owner can save edits (after logging in)."
                                    placement="left"
                                >
                                    <FormControlLabel value="open" control={<Radio />} label="Open" />
                                </Tooltip>
                                <Tooltip
                                    title="Only the owner can view and edit the schedule (after logging in)."
                                    placement="left"
                                >
                                    <FormControlLabel value="private" control={<Radio />} label="Private" />
                                </Tooltip>
                            </RadioGroup>
                        </FormControl>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} color={isDark ? 'secondary' : 'primary'}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color={isDark ? 'secondary' : 'primary'}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default SaveButton;
