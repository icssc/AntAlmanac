import { Save } from '@material-ui/icons';
import { LoadingButton } from '@mui/lab';
import { Stack } from '@mui/material';
import { useState } from 'react';

import { saveSchedule } from '$actions/AppStoreActions';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

const SaveFunctionality = () => {
    const isDark = useThemeStore((store) => store.isDark);
    const { session, sessionIsValid: validSession } = useSessionStore();
    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleClickSignIn = () => {
        setOpenSignInDialog(!openSignInDialog);
    };

    const saveScheduleData = async () => {
        if (validSession && session) {
            const { _, accounts } = await trpc.userData.getUserAndAccountBySessionToken.query({ token: session });
            setSaving(true);
            await saveSchedule(accounts.providerAccountId, true);
            setSaving(false);
        }
    };
    return (
        <Stack direction="row">
            <LoadingButton
                color="inherit"
                startIcon={<Save />}
                onClick={validSession ? saveScheduleData : handleClickSignIn}
                disabled={saving}
                loading={saving}
            >
                Save
            </LoadingButton>

            <SignInDialog isDark={isDark} open={openSignInDialog} onClose={handleClickSignIn} action="Save" />
        </Stack>
    );
};

export default SaveFunctionality;
