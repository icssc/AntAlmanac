import { importValidatedSchedule } from '$actions/AppStoreActions';
import { AlertDialog } from '$components/AlertDialog';
import { ImportDialog } from '$components/Header/Import/ImportDialog';
import { getLocalStorageDataCache, getLocalStorageUserId, removeLocalStorageUserId } from '$lib/localStorage';
import { BLUE } from '$src/globals';
import { useFallbackStore } from '$stores/FallbackStore';
import { useScheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { useDevModeStore } from '$stores/SettingsStore';
import { ContentPasteGo } from '@mui/icons-material';
import { type AlertColor, Box, Button, Link as MuiLink, Stack, Tooltip } from '@mui/material';
import NextLink from 'next/link';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function Import() {
    const [alertDialogTitle, setAlertDialogTitle] = useState('');
    const [alertDialogSeverity, setAlertDialogSeverity] = useState<AlertColor>('error');
    const [alertDialog, setAlertDialog] = useState(false);
    const [savedAAUsername, setSavedAAUsername] = useState('');
    const [autoImportUsername, setAutoImportUsername] = useState<string | undefined>();

    const fallbackMode = useFallbackStore((state) => state.fallbackMode);
    const { openImportDialog, setOpenImportDialog } = useScheduleComponentsToggleStore(
        useShallow((state) => ({
            openImportDialog: state.openImportDialog,
            setOpenImportDialog: state.setOpenImportDialog,
        }))
    );
    const { sessionIsValid, isNewUser, setIsNewUser, areSchedulesLoaded } = useSessionStore(
        useShallow((state) => ({
            sessionIsValid: state.sessionIsValid,
            isNewUser: state.isNewUser,
            setIsNewUser: state.setIsNewUser,
            areSchedulesLoaded: state.areSchedulesLoaded,
        }))
    );
    const devMode = useDevModeStore((store) => store.devMode);
    const postHog = usePostHog();

    const handleOpen = useCallback(() => setOpenImportDialog(true), [setOpenImportDialog]);

    const handleClose = useCallback(() => {
        setOpenImportDialog(false);
        setAutoImportUsername(undefined);
    }, [setOpenImportDialog]);

    const handleCloseAlertDialog = () => {
        setAlertDialog(false);
        setOpenImportDialog(true);
    };

    const handleImportAnyways = () => {
        importValidatedSchedule(savedAAUsername, postHog);
        setOpenImportDialog(false);
        setAlertDialog(false);
    };

    const handleAlertDialog = useCallback((title: string, severity: AlertColor, username: string) => {
        setAlertDialogTitle(title);
        setAlertDialogSeverity(severity);
        setAlertDialog(true);
        setSavedAAUsername(username);
    }, []);

    const handleFirstTimeSignin = useCallback(() => {
        if (areSchedulesLoaded && isNewUser) {
            const savedUserId = getLocalStorageUserId();
            if (savedUserId) {
                setAutoImportUsername(savedUserId);
            }
            setOpenImportDialog(true);
            setIsNewUser(false);
            removeLocalStorageUserId();
        }
    }, [isNewUser, setIsNewUser, areSchedulesLoaded, setOpenImportDialog]);

    useEffect(() => {
        if (sessionIsValid && getLocalStorageDataCache() === null) {
            handleFirstTimeSignin();
        }
    }, [handleFirstTimeSignin, sessionIsValid]);

    return (
        <>
            <Tooltip title={devMode ? 'Import or export schedule data' : 'Import a schedule from your Study List'}>
                <Button
                    onClick={handleOpen}
                    color="inherit"
                    sx={{ fontSize: 'inherit' }}
                    startIcon={<ContentPasteGo />}
                    disabled={fallbackMode}
                    id="import-button"
                >
                    {devMode ? 'Import/Export' : 'Import'}
                </Button>
            </Tooltip>

            {openImportDialog && (
                <ImportDialog
                    open={openImportDialog}
                    onClose={handleClose}
                    onAlertDialog={handleAlertDialog}
                    autoImportUsername={autoImportUsername}
                />
            )}

            <AlertDialog
                title={alertDialogTitle}
                open={alertDialog}
                onClose={handleCloseAlertDialog}
                severity={alertDialogSeverity}
            >
                {alertDialogSeverity === 'error' ? (
                    <Box>
                        If you think this is a mistake please submit a{' '}
                        <MuiLink component={NextLink} href="/feedback" underline="hover">
                            bug report
                        </MuiLink>
                    </Box>
                ) : (
                    <Stack direction="row" justifyContent="center">
                        <Button
                            onClick={handleImportAnyways}
                            color="primary"
                            variant="contained"
                            size="large"
                            sx={{ backgroundColor: BLUE }}
                        >
                            Import Anyways
                        </Button>
                    </Stack>
                )}
            </AlertDialog>
        </>
    );
}
