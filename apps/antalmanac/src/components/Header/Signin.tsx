import { AccountCircle, ExpandMore, Google } from '@mui/icons-material';
import {
    Alert,
    AlertColor,
    AlertTitle,
    Box,
    Button,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Divider,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Popover,
    Stack,
    TextField,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import {
    isEmptySchedule,
    loadSchedule,
    loadScheduleWithSessionToken,
    loginUser,
    mergeShortCourseSchedules,
} from '$actions/AppStoreActions';
import { AlertDialog } from '$components/AlertDialog';
import { ProfileMenuButtons } from '$components/Header/ProfileMenuButtons';
import { SettingsMenu } from '$components/Header/Settings/SettingsMenu';
import { getSettingsPopoverPaperSx } from '$components/Header/headerStyles';
import trpc from '$lib/api/trpc';
import { authClient, signOut } from '$lib/auth/authClient';
import {
    getLocalStorageDataCache,
    getLocalStorageFromLoading,
    getLocalStorageUserId,
    removeLocalStorageDataCache,
    removeLocalStorageFromLoading,
    removeLocalStorageImportedUser,
    removeLocalStorageUserId,
    setLocalStorageFromLoading,
    setLocalStorageImportedUser,
    setLocalStorageOnFirstSignin,
} from '$lib/localStorage';
import { setSsoCookie } from '$lib/ssoCookie';
import AppStore from '$stores/AppStore';
import { useNotificationStore } from '$stores/NotificationStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

const ALERT_MESSAGES: Record<string, { title: string; severity: AlertColor }> = {
    SESSION_EXPIRED: {
        title: 'Your session has expired. Please sign in again.',
        severity: 'info',
    },
    SCHEDULE_IMPORTED: {
        title: 'This schedule was previously imported to a Google account. Did you want to sign in with Google?',
        severity: 'info',
    },
};

export const Signin = () => {
    const isDark = useThemeStore((store) => store.isDark);
    const { updateSession } = useSessionStore();
    const { openLoadingSchedule: loadingSchedule, setOpenLoadingSchedule } = scheduleComponentsToggleStore();

    const [openAlert, setOpenalert] = useState(false);
    const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
    const [alertMessage, setAlertMessage] = useState<{ title: string; severity: AlertColor }>(
        ALERT_MESSAGES.SCHEDULE_IMPORTED
    );

    const [isOpen, setIsOpen] = useState(false);
    const [userID, setUserID] = useState('');
    const [rememberMe] = useState(true);
    const [showLegacyLogin, setShowLegacyLogin] = useState(false);

    const { data: sessionData } = authClient.useSession();

    const handleOpen = useCallback(() => {
        setIsOpen(true);
        setSettingsAnchorEl(null);
        if (typeof Storage !== 'undefined') {
            const savedUserID = getLocalStorageUserId();
            if (savedUserID !== null) {
                setUserID(savedUserID);
            }
        }
    }, []);

    const handleSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
        setSettingsAnchorEl(event.currentTarget);
    };

    const handleLogin = () => {
        loginUser();
        setLocalStorageFromLoading('true');
    };

    const handleUnsavedChanges = useCallback(async () => {
        if (!sessionData) {
            return;
        }

        const isNewUser = false;

        const fromLoading = getLocalStorageFromLoading();
        const savedUserId = getLocalStorageUserId();
        const savedData = getLocalStorageDataCache();

        if (isNewUser) {
            setLocalStorageOnFirstSignin('true');
        } else {
            removeLocalStorageUserId();
        }

        // load schedule without saving any changes
        if (fromLoading) {
            removeLocalStorageFromLoading();
            removeLocalStorageDataCache();
            removeLocalStorageImportedUser();
            return;
        }

        // no changes to save
        if (savedUserId === null && savedData === null) {
            removeLocalStorageDataCache();
            removeLocalStorageImportedUser();
            return;
        }

        if (savedData) {
            const userData = await trpc.userData.getUserData.query({ userId: sessionData.user.id });
            const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();

            if (savedUserId) {
                await trpc.userData.flagImportedSchedule.mutate({ providerId: savedUserId });
                setLocalStorageImportedUser(savedUserId);
            }

            const data = JSON.parse(savedData);

            if (userData?.userData && isEmptySchedule(userData.userData.schedules)) {
                scheduleSaveState.schedules = data;
            } else {
                const saveState = userData && 'userData' in userData ? userData.userData : userData;
                if (saveState !== null) {
                    mergeShortCourseSchedules(saveState.schedules, data, '(import)-');
                    scheduleSaveState.schedules = saveState.schedules;
                    scheduleSaveState.scheduleIndex = saveState.schedules.length - 1;
                }
            }
        }
    }, [sessionData]);

    const validateImportedUser = useCallback(async (userID: string) => {
        try {
            const res = await trpc.userData.getGuestAccountAndUserByName
                .query({ name: userID })
                .then((res) => res.users);
            if (res.imported) {
                setAlertMessage(ALERT_MESSAGES.SCHEDULE_IMPORTED);
                setOpenalert(true);
            }
            return res;
        } catch (error) {
            console.error('Error validating imported user:', error);
            return false;
        }
    }, []);

    const loadScheduleAndSetLoading = useCallback(
        async (userID: string, rememberMe: boolean) => {
            setOpenLoadingSchedule(true);
            await loadSchedule(userID, rememberMe, 'GUEST');
            await validateImportedUser(userID);
            setOpenLoadingSchedule(false);
        },
        [setOpenLoadingSchedule, validateImportedUser]
    );

    const loadScheduleAndSetLoadingAuth = useCallback(async () => {
        if (!sessionData) {
            return;
        }

        setOpenLoadingSchedule(true);

        await loadScheduleWithSessionToken();

        setOpenLoadingSchedule(false);
    }, [sessionData, setOpenLoadingSchedule]);

    const enterEvent = useCallback(
        (event: KeyboardEvent) => {
            if (!showLegacyLogin) return;

            const charCode = event.which ? event.which : event.keyCode;

            if (charCode === 13 || charCode === 10) {
                event.preventDefault();
                setIsOpen(false);
                document.removeEventListener('keydown', enterEvent, false);
                void loadScheduleAndSetLoading(userID, rememberMe);
                setUserID('');
                return false;
            }
        },
        [showLegacyLogin, loadScheduleAndSetLoading, userID, rememberMe]
    );

    const handleClose = useCallback(
        (wasCancelled: boolean) => {
            if (wasCancelled) {
                setIsOpen(false);
                document.removeEventListener('keydown', enterEvent, false);
                setUserID('');
            } else {
                setIsOpen(false);
                document.removeEventListener('keydown', enterEvent, false);
                void loadScheduleAndSetLoading(userID, rememberMe);
                setUserID('');
            }
        },
        [loadScheduleAndSetLoading, userID, rememberMe, enterEvent]
    );

    useEffect(() => {
        if (sessionData) {
            (async () => {
                if (sessionData.session.expiresAt < new Date()) {
                    console.log('Session expired, logging out');
                    signOut();
                    return;
                }
                try {
                    const isSessionValid = await updateSession(sessionData);
                    if (!isSessionValid) {
                        setOpenalert(true);
                        setAlertMessage(ALERT_MESSAGES.SESSION_EXPIRED);
                        return;
                    }
                    setSsoCookie();
                    handleUnsavedChanges();

                    loadScheduleAndSetLoadingAuth();

                    useNotificationStore.getState().loadNotifications();
                } catch (error) {
                    console.error('Error during authentication:', error);
                    signOut();
                }
            })();
        }
    }, [sessionData, updateSession, handleUnsavedChanges, loadScheduleAndSetLoadingAuth]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', enterEvent, false);
        } else {
            document.removeEventListener('keydown', enterEvent, false);
        }

        return () => {
            document.removeEventListener('keydown', enterEvent, false);
        };
    }, [isOpen, enterEvent]);

    return (
        <div id="load-save-container" style={{ display: 'flex', flexDirection: 'row' }}>
            <ProfileMenuButtons
                user={null}
                handleOpen={handleOpen}
                handleSettingsOpen={handleSettingsOpen}
                loading={loadingSchedule}
            />

            <Dialog open={isOpen} onClose={() => handleClose(true)}>
                <DialogContent>
                    <Stack spacing={1}>
                        <Button
                            onClick={handleLogin}
                            color="primary"
                            variant="contained"
                            startIcon={<Google />}
                            size="large"
                            fullWidth
                        >
                            Sign in with Google
                        </Button>

                        <Box
                            onClick={() => setShowLegacyLogin(!showLegacyLogin)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                py: 1,
                                '&:hover': {
                                    opacity: 0.7,
                                },
                            }}
                        >
                            <Divider sx={{ flexGrow: 1 }}>Have schedules saved to an old user ID?</Divider>
                            <ExpandMore
                                sx={{
                                    transform: showLegacyLogin ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s',
                                    ml: 1,
                                }}
                            />
                        </Box>

                        <Collapse in={showLegacyLogin}>
                            <Stack spacing={1}>
                                <DialogContentText>
                                    Enter your unique user ID here to sign in your schedule.
                                </DialogContentText>

                                <Alert severity="info" variant={isDark ? 'outlined' : 'standard'}>
                                    <AlertTitle>
                                        Note: Existing schedules saved to a unique user ID can no longer be updated.
                                    </AlertTitle>
                                    Please sign up with your Google account to save your schedules.
                                </Alert>

                                <TextField
                                    margin="dense"
                                    label="Unique User ID"
                                    type="text"
                                    fullWidth
                                    placeholder="Enter here"
                                    color="secondary"
                                    value={userID}
                                    onChange={(event) => setUserID(event.target.value)}
                                />
                            </Stack>
                        </Collapse>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClose(true)} color="inherit">
                        Cancel
                    </Button>
                    {showLegacyLogin && (
                        <Button onClick={() => handleClose(false)} color="inherit">
                            Sign in
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Popover
                open={Boolean(settingsAnchorEl)}
                anchorEl={settingsAnchorEl}
                onClose={() => setSettingsAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        sx: getSettingsPopoverPaperSx(isDark),
                    },
                }}
            >
                <SettingsMenu user={null} onClose={() => setSettingsAnchorEl(null)} />

                <Divider style={{ marginTop: '20px', marginBottom: '12px' }} />

                <MenuItem onClick={handleOpen} sx={{ px: 1, py: 1.25, borderRadius: 1 }}>
                    <ListItemIcon>
                        <AccountCircle />
                    </ListItemIcon>
                    <ListItemText
                        primary="Sign in"
                        primaryTypographyProps={{
                            sx: {
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                            },
                        }}
                    />
                </MenuItem>
            </Popover>

            <AlertDialog
                open={openAlert}
                onClose={() => setOpenalert(false)}
                title={alertMessage.title}
                severity={alertMessage.severity}
            >
                <DialogContentText>To load your schedule sign in with your Google account</DialogContentText>
                <Button
                    color="primary"
                    variant="contained"
                    startIcon={<Google />}
                    fullWidth
                    onClick={handleLogin}
                    size="large"
                >
                    Sign in with Google
                </Button>
            </AlertDialog>
        </div>
    );
};
