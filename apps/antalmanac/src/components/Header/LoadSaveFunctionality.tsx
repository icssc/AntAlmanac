import { Save, SaveAlt } from '@material-ui/icons';
import { LoadingButton } from '@mui/lab';
import { Button, Stack } from '@mui/material';
import { useEffect, useState, useCallback } from 'react';

import { loadSchedule, saveSchedule } from '$actions/AppStoreActions';
import { InputDialog } from '$components/dialogs/InputDialog';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import trpc from '$lib/api/trpc';
import { getLocalStorageDataCache } from '$lib/localStorage';
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
        <InputDialog title="Would you like to save your most recent change(s)" open={open}>
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
    const { session, sessionIsValid: validSession } = useSessionStore();
    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const [openLoadCacheDialog, setOpenLoadCacheDialog] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleClickSignIn = () => {
        setOpenSignInDialog(!openSignInDialog);
    };

    const closeLoadCacheDialog = async (loadCache: boolean) => {
        setOpenLoadCacheDialog(false);
        await loadSchedule(loadCache);
    };

    const saveScheduleData = async () => {
        if (validSession && session) {
            const { users, accounts } = await trpc.userData.getUserAndAccountBySessionToken.query({ token: session });
            setSaving(true);
            await saveSchedule(users.id, accounts.AccountType, true);
            setSaving(false);
        }
    };

    const loadScheduleData = useCallback(async () => {
        if (validSession) {
            await loadSchedule();
        }
    }, [validSession]);

    useEffect(() => {
        if (typeof Storage !== 'undefined') {
            if (getLocalStorageDataCache()) {
                setOpenLoadCacheDialog(validSession);
            } else {
                loadScheduleData();
            }
        }
    }, [session, validSession, loadScheduleData]);

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
