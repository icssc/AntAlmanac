import { Close, Save as SaveIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Stack, Snackbar, Alert, Link, IconButton } from '@mui/material';
import { useState, useEffect } from 'react';

import actionTypesStore from '$actions/ActionTypesStore';
import { saveSchedule } from '$actions/AppStoreActions';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import { useIsReadonlyView } from '$hooks/useIsReadonlyView';
import trpc from '$lib/api/trpc';
import AppStore from '$stores/AppStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

export const Save = () => {
    const isDark = useThemeStore((store) => store.isDark);
    const { session, sessionIsValid: validSession } = useSessionStore();
    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());
    const { openAutoSaveWarning, setOpenAutoSaveWarning } = scheduleComponentsToggleStore();

    const isReadonlyView = useIsReadonlyView();

    const handleClickSignIn = () => {
        setOpenSignInDialog(!openSignInDialog);
    };

    const handleCloseAutoSaveWarning = () => {
        setOpenAutoSaveWarning(false);
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
            const { users, accounts } = await trpc.userData.getUserAndAccountBySessionToken.query({
                token: session,
            });
            setSaving(true);
            await saveSchedule(accounts.providerAccountId, true, users);
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

    const disabled = skeletonMode || saving || isReadonlyView;

    return (
        <Stack direction="row">
            <LoadingButton
                id="save-button"
                color="inherit"
                startIcon={<SaveIcon />}
                loadingPosition="start"
                onClick={validSession ? saveScheduleData : handleClickSignIn}
                sx={{ fontSize: 'inherit' }}
                disabled={disabled}
                loading={saving}
            >
                Save
            </LoadingButton>

            <Snackbar open={openAutoSaveWarning} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert
                    severity="warning"
                    variant="filled"
                    sx={{ display: 'flex', alignItems: 'center', fontSize: 'xs', color: 'inherit' }}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="medium"
                            onClick={handleCloseAutoSaveWarning}
                            sx={{
                                alignSelf: 'center',
                                marginBottom: 'auto',
                                marginTop: 'auto',
                                padding: '0',
                            }}
                        >
                            <Close fontSize="inherit" />
                        </IconButton>
                    }
                >
                    DISCLAIMER: Legacy (username-based) schedules can no longer be saved. Please log in with{' '}
                    <Link
                        component="button"
                        onClick={handleClickSignIn}
                        sx={{
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            color: 'inherit',
                            fontWeight: 'inherit',
                            fontSize: 'inherit',
                            padding: 0,
                            border: 'none',
                            background: 'none',
                        }}
                    >
                        Google
                    </Link>{' '}
                    to <strong>save</strong> your schedule(s) and changes.
                </Alert>
            </Snackbar>

            <SignInDialog isDark={isDark} open={openSignInDialog} onClose={handleClickSignIn} feature="Save" />
        </Stack>
    );
};
