import { Button } from '@material-ui/core';
import { Save } from '@material-ui/icons';
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
        <AuthDialog title="Restore Changes?" open={open} onClose={onClose}>
            <>
                <Button onClick={onConfirm} size="large" color="primary" variant="contained">
                    Yes restore my changes
                </Button>
                <Button onClick={onClose} size="large" variant="contained">
                    Cancel
                </Button>
            </>
        </AuthDialog>
    );
};
const LoadSaveScheduleFunctionality = () => {
    const isDark = useThemeStore((store) => store.isDark);
    const { session, validSession } = useSessionStore();
    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const [openLoadCacheDialog, setOpenLoadCacheDialog] = useState(false);

    const saveScheduleWithSignin = async () => {
        if (validSession && session) {
            const userId = await trpc.session.getSessionUserId.query({ token: session });
            await saveSchedule(userId, true);
        }
    };
    const handleClickSignIn = () => {
        setOpenSignInDialog(!openSignInDialog);
    };

    const cancelLoadCache = async () => {
        setOpenLoadCacheDialog(!openLoadCacheDialog);
        await loadSchedule(false);
    };
    const confirmLoadCache = async () => {
        setOpenLoadCacheDialog(false);
        await loadSchedule(true);
    };

    const loadSessionData = async () => {
        if (validSession && !openLoadCacheDialog) {
            // if the cahce dialog is open then we need to prompt the user if we want to display their cached schedule
            await loadSchedule();
        }
    };

    useEffect(() => {
        if (typeof Storage !== 'undefined') {
            if (getLocalStorageScheduleCache()) {
                setOpenLoadCacheDialog(true);
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
