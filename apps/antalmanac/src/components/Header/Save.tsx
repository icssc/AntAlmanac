import { Save } from '@material-ui/icons';
import { LoadingButton } from '@mui/lab';
import { Stack } from '@mui/material';
import { useState, useEffect } from 'react';

import actionTypesStore from '$actions/ActionTypesStore';
import { saveSchedule } from '$actions/AppStoreActions';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import trpc from '$lib/api/trpc';
import AppStore from '$stores/AppStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

const SaveFunctionality = () => {
    const isDark = useThemeStore((store) => store.isDark);
    const { session, sessionIsValid: validSession } = useSessionStore();
    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const handleClickSignIn = () => {
        setOpenSignInDialog(!openSignInDialog);
    };
    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    const saveScheduleData = async () => {
        if (validSession && session) {
            const accounts = await trpc.userData.getUserAndAccountBySessionToken
                .query({ token: session })
                .then((res) => res.accounts);
            setSaving(true);
            await saveSchedule(accounts.providerAccountId, true);
            setSaving(false);
        }
    };
    useEffect(() => {
        const handleAutoSaveStart = () => setSaving(true);
        const handleAutoSaveEnd = () => setSaving(false);

        actionTypesStore.on('autoSaveStart', handleAutoSaveStart);
        actionTypesStore.on('autoSaveEnd', handleAutoSaveEnd);

        return () => {
            actionTypesStore.off('autoSaveStart', handleAutoSaveStart);
            actionTypesStore.off('autoSaveEnd', handleAutoSaveEnd);
        };
    }, []);
    return (
        <Stack direction="row">
            <LoadingButton
                color="inherit"
                startIcon={<Save />}
                loadingPosition="start"
                onClick={validSession ? saveScheduleData : handleClickSignIn}
                disabled={skeletonMode || saving}
                loading={saving}
            >
                Save
            </LoadingButton>

            <SignInDialog isDark={isDark} open={openSignInDialog} onClose={handleClickSignIn} action="Save" />
        </Stack>
    );
};

export default SaveFunctionality;
