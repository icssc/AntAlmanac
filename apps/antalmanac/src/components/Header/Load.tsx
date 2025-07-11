import { CloudDownload, Google, Save } from '@mui/icons-material';
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
import { ChangeEvent, PureComponent, useEffect, useState, useCallback } from 'react';

import { loadSchedule, saveSchedule, loginUser, loadScheduleWithSessionToken } from '$actions/AppStoreActions';
import { AlertDialog } from '$components/AlertDialog';
import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId, getLocalStorageUserId, setLocalStorageFromLoading } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

interface LoadSaveButtonBaseProps {
    action: typeof saveSchedule;
    actionSecondary?: () => void;
    actionName: 'Save' | 'Load';
    disabled: boolean;
    loading: boolean;
    colorType: 'primary' | 'secondary';
    id?: string;
    isDark: boolean;
}

interface LoadSaveButtonBaseState {
    isOpen: boolean;
    userID: string;
    rememberMe: boolean;
    onClose?: () => void;
}

interface SaveLoadIconProps {
    loading: boolean;
    actionName: 'Save' | 'Load';
}
function SaveLoadIcon(props: SaveLoadIconProps) {
    return props.loading ? (
        <CircularProgress size={20} color="inherit" />
    ) : props.actionName === 'Save' ? (
        <Save />
    ) : (
        <CloudDownload />
    );
}

class LoadSaveButtonBase extends PureComponent<LoadSaveButtonBaseProps, LoadSaveButtonBaseState> {
    state: LoadSaveButtonBaseState = {
        isOpen: false,
        userID: '',
        rememberMe: true,
    };

    handleOpen = () => {
        this.setState({ isOpen: true });
        if (typeof Storage !== 'undefined') {
            const userID = getLocalStorageUserId();
            if (userID !== null) {
                this.setState({ userID: userID });
            }
        }
    };

    handleClose = (wasCancelled: boolean) => {
        if (wasCancelled)
            this.setState({ isOpen: false }, () => {
                document.removeEventListener('keydown', this.enterEvent, false);
                this.setState({ userID: '' });
            });
        else
            this.setState({ isOpen: false }, () => {
                document.removeEventListener('keydown', this.enterEvent, false);
                // this `void` is for eslint "no floating promises"
                void this.props.action(this.state.userID, this.state.rememberMe);
                this.setState({ userID: '' });
            });
    };

    handleToggleRememberMe = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({ rememberMe: event.target.checked });
    };

    componentDidUpdate(_prevProps: unknown, prevState: LoadSaveButtonBaseState) {
        if (!prevState.isOpen && this.state.isOpen) document.addEventListener('keydown', this.enterEvent, false);
        else if (prevState.isOpen && !this.state.isOpen)
            document.removeEventListener('keydown', this.enterEvent, false);
    }

    enterEvent = (event: KeyboardEvent) => {
        const charCode = event.which ? event.which : event.keyCode;

        if (charCode === 13 || charCode === 10) {
            event.preventDefault();
            this.handleClose(false);

            return false;
        }
    };

    render() {
        return (
            <>
                <LoadingButton
                    id={this.props.id}
                    onClick={this.handleOpen}
                    color="inherit"
                    startIcon={<SaveLoadIcon loading={this.props.loading} actionName={this.props.actionName} />}
                    disabled={this.props.disabled}
                    loading={false}
                    fullWidth
                >
                    {this.props.actionName}
                </LoadingButton>
                <Dialog open={this.state.isOpen} onClose={this.handleClose}>
                    <DialogTitle>{this.props.actionName}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={1}>
                            <LoadingButton
                                onClick={this.props.actionSecondary}
                                color="primary"
                                variant="contained"
                                startIcon={<Google />}
                                size="large"
                                fullWidth
                            >
                                Sign in with Google
                            </LoadingButton>
                            <Divider>or</Divider>
                            <DialogContentText>
                                Enter your unique user ID here to {this.props.actionName.toLowerCase()} your schedule.
                            </DialogContentText>

                            <Alert severity="info" variant={this.props.isDark ? 'outlined' : 'standard'}>
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
                                value={this.state.userID}
                                onChange={(event) => this.setState({ userID: event.target.value })}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.handleClose(true)} color={this.props.colorType}>
                            {'Cancel'}
                        </Button>
                        <Button onClick={() => this.handleClose(false)} color={this.props.colorType}>
                            {this.props.actionName}
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

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
            <LoadSaveButtonBase
                id="load-button"
                actionName={'Load'}
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
