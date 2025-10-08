import { AccountCircle, Google } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
    Divider,
    Stack,
    Alert,
    AlertTitle,
    CircularProgress,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    AlertColor,
} from '@mui/material';
import { useEffect, useState, useCallback } from 'react';

import { loadSchedule, saveSchedule, loginUser, loadScheduleWithSessionToken } from '$actions/AppStoreActions';
import { AlertDialog } from '$components/AlertDialog';
import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId, getLocalStorageUserId, setLocalStorageFromLoading } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

interface SignInButtonProps {
    action: typeof saveSchedule;
    actionSecondary?: () => void;
    disabled: boolean;
    loading: boolean;
    colorType: 'primary' | 'secondary';
    id?: string;
    isDark: boolean;
}

interface SignInIconProps {
    loading: boolean;
}
function SignInIcon(props: SignInIconProps) {
    return props.loading ? <CircularProgress size={20} color="inherit" /> : <AccountCircle />;
}

const SignInButton: React.FC<SignInButtonProps> = ({
    action,
    actionSecondary,
    disabled,
    loading,
    colorType,
    id,
    isDark,
}: SignInButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [userID, setUserID] = useState('');
    const [rememberMe] = useState(true);

    const handleOpen = useCallback(() => {
        setIsOpen(true);
        if (typeof Storage !== 'undefined') {
            const savedUserID = getLocalStorageUserId();
            if (savedUserID !== null) {
                setUserID(savedUserID);
            }
        }
    }, []);

    const enterEvent = useCallback(
        (event: KeyboardEvent) => {
            const charCode = event.which ? event.which : event.keyCode;

            if (charCode === 13 || charCode === 10) {
                event.preventDefault();
                // Handle enter key press directly
                setIsOpen(false);
                document.removeEventListener('keydown', enterEvent, false);
                // this `void` is for eslint "no floating promises"
                void action(userID, rememberMe);
                setUserID('');
                return false;
            }
        },
        [action, userID, rememberMe]
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
                // this `void` is for eslint "no floating promises"
                void action(userID, rememberMe);
                setUserID('');
            }
        },
        [action, userID, rememberMe, enterEvent]
    );

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
        <>
            <LoadingButton
                id={id}
                onClick={handleOpen}
                color="inherit"
                startIcon={<SignInIcon loading={loading} />}
                disabled={disabled}
                loading={false}
                fullWidth
            >
                Sign in
            </LoadingButton>
            <Dialog open={isOpen} onClose={() => handleClose(true)}>
                <DialogTitle>Sign in</DialogTitle>
                <DialogContent>
                    <Stack spacing={1}>
                        <LoadingButton
                            onClick={actionSecondary}
                            color="primary"
                            variant="contained"
                            startIcon={<Google />}
                            size="large"
                            fullWidth
                        >
                            Sign in with Google
                        </LoadingButton>
                        <Divider>or</Divider>
                        <DialogContentText>Enter your unique user ID here to sign in your schedule.</DialogContentText>

                        <Alert severity="info" variant={isDark ? 'outlined' : 'standard'}>
                            <AlertTitle>
                                Note: Existing schedules saved to a unique user ID can no longer be updated.
                            </AlertTitle>
                            Please sign up with your Google account to save your schedules.
                        </Alert>

                        <TextField
                            // eslint-disable-next-line jsx-a11y/no-autofocus
                            autoFocus
                            margin="dense"
                            label="Unique User ID"
                            type="text"
                            fullWidth
                            placeholder="Enter here"
                            value={userID}
                            onChange={(event) => setUserID(event.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClose(true)} color={colorType}>
                        Cancel
                    </Button>
                    <Button onClick={() => handleClose(false)} color={colorType}>
                        Sign in
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

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

export const Load = () => {
    const isDark = useThemeStore((store) => store.isDark);

    const { updateSession, sessionIsValid } = useSessionStore();

    const { openLoadingSchedule: loadingSchedule, setOpenLoadingSchedule } = scheduleComponentsToggleStore();

    const [openAlert, setOpenalert] = useState(false);
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const [alertMessage, setAlertMessage] = useState<{ title: string; severity: AlertColor }>(
        ALERT_MESSAGES.SCHEDULE_IMPORTED
    );

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

    const loadScheduleAndSetLoadingAuth = useCallback(
        async (userID: string, rememberMe: boolean) => {
            setOpenLoadingSchedule(true);

            const sessionToken = getLocalStorageSessionId() ?? '';

            const validSession = await trpc.auth.validateSession.query({
                token: sessionToken,
            });

            if (!validSession) {
                setOpenalert(true);
                setAlertMessage(ALERT_MESSAGES.SESSION_EXPIRED);
            } else if (sessionToken && (await loadScheduleWithSessionToken())) {
                updateSession(sessionToken);
            } else if (sessionToken === '' && userID && userID !== '') {
                await validateImportedUser(userID);
                await loadSchedule(userID, rememberMe, 'GUEST'); // fallback to guest
            }

            setOpenLoadingSchedule(false);
        },
        [setOpenLoadingSchedule, updateSession, validateImportedUser]
    );

    const handleLogin = () => {
        loginUser();
        setLocalStorageFromLoading('true');
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

    useEffect(() => {
        if (typeof Storage !== 'undefined') {
            const savedUserID = getLocalStorageUserId();
            const sessionID = getLocalStorageSessionId();

            if (savedUserID != null || sessionID !== null) {
                void loadScheduleAndSetLoadingAuth(savedUserID ?? '', true);
            }
        }
    }, [loadScheduleAndSetLoadingAuth]);

    if (sessionIsValid) {
        return;
    }
    return (
        <div id="load-save-container" style={{ display: 'flex', flexDirection: 'row' }}>
            <SignInButton
                id="load-button"
                action={loadScheduleAndSetLoading}
                actionSecondary={handleLogin}
                disabled={skeletonMode}
                loading={loadingSchedule}
                colorType={isDark ? 'secondary' : 'primary'}
                isDark={isDark}
            />

            <AlertDialog
                open={openAlert}
                onClose={() => setOpenalert(false)}
                title={alertMessage.title}
                severity={alertMessage.severity}
            >
                <DialogContentText>To load your schedule sign in with your Google account</DialogContentText>
                <LoadingButton
                    color="primary"
                    variant="contained"
                    startIcon={<Google />}
                    fullWidth
                    onClick={handleLogin}
                    size="large"
                >
                    Sign in with Google
                </LoadingButton>
            </AlertDialog>
        </div>
    );
};
