import { Save } from '@material-ui/icons';
import { Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';

import { loadSchedule, saveSchedule } from '$actions/AppStoreActions';
import { AuthDialog } from '$components/dialogs/AuthDialog';
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
        <AuthDialog title="Save your progress?" open={open} onClose={onClose}>
            <Stack spacing={2} sx={{ alighItems: 'center' }}>
                <Button onClick={onConfirm} size="large" color="primary" variant="contained">
                    Yes restore my changes
                </Button>
                <Button onClick={onClose} size="large" color="secondary" variant="outlined">
                    Cancel changes
                </Button>
            </Stack>
        </AuthDialog>
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

    const cancelLoadCache = async () => {
        setOpenLoadCacheDialog(false);
        await loadSchedule(false);
    };
    const confirmLoadCache = async () => {
        setOpenLoadCacheDialog(false);
        await loadSchedule(true);
    };

    const saveScheduleWithSignin = async () => {
        if (validSession && session) {
            const userId = await trpc.session.getSessionUserId.query({ token: session });
            await saveSchedule(userId);
        }
    };

    const loadSessionData = async () => {
        if (validSession) {
            // if the cahce dialog is open then we need to prompt the user if we want to display their cached schedule
            await loadSchedule();
        }
    };

    useEffect(() => {
        if (typeof Storage !== 'undefined') {
            if (getLocalStorageScheduleCache()) {
                setOpenLoadCacheDialog(validSession);
            } else {
                loadSessionData();
            }
        }
    }, [session, validSession]);

    return (
        <div id="load-save-container" style={{ display: 'flex', flexDirection: 'row' }}>
            <Button
                color="inherit"
                startIcon={<Save />}
                onClick={validSession ? saveScheduleWithSignin : handleClickSignIn}
            >
                Save
            </Button>

            <SignInDialog isDark={isDark} open={openSignInDialog} onClose={handleClickSignIn} />
            <LoadCacheDialog open={openLoadCacheDialog} onClose={cancelLoadCache} onConfirm={confirmLoadCache} />
        </div>
    );
};

export default LoadSaveScheduleFunctionality;
