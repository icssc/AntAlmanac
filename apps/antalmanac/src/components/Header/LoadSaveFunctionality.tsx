import { Save, SaveAlt } from '@material-ui/icons';
import { Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';

import { loadSchedule, saveSchedule } from '$actions/AppStoreActions';
import { InputDialog } from '$components/dialogs/InputDialog';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import trpc from '$lib/api/trpc';
import { getLocalStorageScheduleCache } from '$lib/localStorage';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';
interface LoadCacheDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}
const LoadCacheDialog = (props: LoadCacheDialogProps) => {
    const { open, onConfirm, onClose } = props;

    return (
        <InputDialog title="Save your progress?" open={open}>
            <Stack spacing={2} alignItems="center">
                <Button
                    startIcon={<SaveAlt />}
                    onClick={onConfirm}
                    size="large"
                    color="primary"
                    variant="contained"
                    sx={{ width: '20rem' }}
                >
                    Yes keep all changes
                </Button>
                <Button onClick={onClose} size="large" color="secondary" variant="outlined" sx={{ width: '20rem' }}>
                    Cancel changes
                </Button>
            </Stack>
        </InputDialog>
    );
};

const LoadSaveScheduleFunctionality = () => {
    const isDark = useThemeStore((store) => store.isDark);
    const { session, validSession } = useSessionStore();
    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const [openLoadCacheDialog, setOpenLoadCacheDialog] = useState(false);

    const handleClickSignIn = () => {
        setOpenSignInDialog(!openSignInDialog);
    };

    const closeLoadCacheDialog = async (loadCache: boolean) => {
        setOpenLoadCacheDialog(false);
        await loadSchedule(loadCache);
    };

    const saveScheduleData = async () => {
        if (validSession && session) {
            const userId = await trpc.session.getSessionUserId.query({ token: session });
            await saveSchedule(userId);
        }
    };

    const loadScheduleData = async () => {
        if (validSession) {
            await loadSchedule();
        }
    };

    useEffect(() => {
        if (typeof Storage !== 'undefined') {
            if (getLocalStorageScheduleCache()) {
                setOpenLoadCacheDialog(validSession);
            } else {
                loadScheduleData();
            }
        }
    }, [session, validSession]);

    return (
        <Stack direction="row">
            <Button color="inherit" startIcon={<Save />} onClick={validSession ? saveScheduleData : handleClickSignIn}>
                Save
            </Button>

            <SignInDialog isDark={isDark} open={openSignInDialog} onClose={handleClickSignIn} />

            <LoadCacheDialog
                open={openLoadCacheDialog}
                onClose={() => closeLoadCacheDialog(false)}
                onConfirm={() => closeLoadCacheDialog(true)}
            />
        </Stack>
    );
};

export default LoadSaveScheduleFunctionality;
