import actionTypesStore from '$actions/ActionTypesStore';
import { isEmptySchedule } from '$actions/AppStoreActions';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { trpcReact } from '$lib/api/trpc';
import { getErrorMessage } from '$lib/utils';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';
import { deleteTempSaveData } from '$stores/localTempSaveDataHelpers';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Close, Save as SaveIcon } from '@mui/icons-material';
import { Stack, Snackbar, Alert, Link, IconButton, Button } from '@mui/material';
import { TRPCClientError } from '@trpc/client';
import { usePostHog } from 'posthog-js/react';
import { useState, useEffect } from 'react';

export const Save = () => {
    const { sessionIsValid } = useSessionStore();
    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);
    const fallbackMode = useFallbackStore((state) => state.fallbackMode);
    const { openAutoSaveWarning, setOpenAutoSaveWarning } = scheduleComponentsToggleStore();
    const postHog = usePostHog();

    const { mutate: saveSchedule, isPending: isSaving } = trpcReact.schedule.save.useMutation({
        onSuccess: ({ scheduleIdMap }) => {
            if (scheduleIdMap) {
                AppStore.schedule.updateScheduleIds(scheduleIdMap);
            }

            openSnackbar('success', `Schedule saved. Don't forget to sign up for classes on WebReg!`);
            deleteTempSaveData();
            logAnalytics(postHog, {
                category: analyticsEnum.auth,
                action: analyticsEnum.auth.actions.SAVE_SCHEDULE,
                customProps: {
                    autoSave: false,
                },
            });
            AppStore.saveSchedule();
        },
        onError: (e) => {
            if (e instanceof TRPCClientError) {
                openSnackbar('error', `Schedule could not be saved`);
            } else {
                openSnackbar('error', 'Network error or server is down.');
            }

            logAnalytics(postHog, {
                category: analyticsEnum.auth,
                action: analyticsEnum.auth.actions.SAVE_SCHEDULE_FAIL,
                error: getErrorMessage(e),
                customProps: {
                    autoSave: false,
                },
            });
        },
    });

    const handleClickSignIn = () => {
        if (!openSignInDialog) {
            logAnalytics(postHog, {
                category: analyticsEnum.nav,
                action: analyticsEnum.nav.actions.CLICK_SAVE,
            });
        }
        setOpenSignInDialog(!openSignInDialog);
    };

    const handleCloseAutoSaveWarning = () => {
        setOpenAutoSaveWarning(false);
    };

    const saveScheduleData = () => {
        const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

        if (
            isEmptySchedule(scheduleSaveState.schedules) &&
            !confirm(
                "You are attempting to save empty schedule(s). If this is unintentional, this may overwrite your existing schedules that haven't loaded yet!"
            )
        ) {
            return;
        }

        saveSchedule({
            userData: scheduleSaveState,
        });
    };

    useEffect(() => {
        const handleAutoSaveStart = () => setAutoSaving(true);
        const handleAutoSaveEnd = () => setAutoSaving(false);

        actionTypesStore.on('autoSaveStart', handleAutoSaveStart);
        actionTypesStore.on('autoSaveEnd', handleAutoSaveEnd);

        return () => {
            actionTypesStore.off('autoSaveStart', handleAutoSaveStart);
            actionTypesStore.off('autoSaveEnd', handleAutoSaveEnd);
        };
    }, []);

    const saving = isSaving || autoSaving;

    return (
        <Stack direction="row">
            <Button
                id="save-button"
                color="inherit"
                startIcon={<SaveIcon />}
                loadingPosition="start"
                onClick={sessionIsValid ? saveScheduleData : handleClickSignIn}
                sx={{ fontSize: 'inherit' }}
                disabled={fallbackMode || saving}
                loading={saving}
            >
                Save
            </Button>

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

            <SignInDialog open={openSignInDialog} onClose={handleClickSignIn} feature="Save" />
        </Stack>
    );
};
