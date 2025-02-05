import { Button } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import { useEffect, useState } from 'react';

import { loadSchedule, saveSchedule } from '$actions/AppStoreActions';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

const LoadSaveScheduleFunctionality = () => {
    const isDark = useThemeStore((store) => store.isDark);
    const { session, validSession } = useSessionStore();
    const [openSignInDialog, setOpenSignInDialog] = useState(false);

    const loadScheduleAndSetLoading = async () => {
        await loadSchedule();
    };

    const saveScheduleWithSignin = async () => {
        if (validSession && session) {
            const userId = await trpc.session.getSessionUserId.query({ token: session });
            await saveSchedule(userId, true);
        }
    };

    const handleClickSignIn = () => {
        setOpenSignInDialog(!openSignInDialog);
    };

    const loadSessionData = async () => {
        if (validSession) {
            void loadScheduleAndSetLoading();
        }
    };
    useEffect(() => {
        if (typeof Storage !== 'undefined') {
            loadSessionData();
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
        </div>
    );
};

export default LoadSaveScheduleFunctionality;
