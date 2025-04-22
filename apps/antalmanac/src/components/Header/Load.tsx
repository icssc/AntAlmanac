import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    CircularProgress,
    Checkbox,
    FormControlLabel,
} from '@material-ui/core';
import { CloudDownload, Save } from '@material-ui/icons';
import GoogleIcon from '@mui/icons-material/Google';
import { LoadingButton } from '@mui/lab';
import { Divider } from '@mui/material';
import { ChangeEvent, PureComponent, useEffect, useState, useCallback } from 'react';

import { loadSchedule, saveSchedule, isEmptySchedule } from '$actions/AppStoreActions';
import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId, getLocalStorageUserId, setLocalStorageDataCache } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

interface LoadSaveButtonBaseProps {
    action: typeof saveSchedule;
    actionName: 'Save' | 'Load';
    disabled: boolean;
    loading: boolean;
    colorType: 'primary' | 'secondary';
    id?: string;
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

interface LoadOptionDialogProps {
    open: boolean;
    onClose: () => void;
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
                    color="primary"
                    variant="contained"
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
                        <DialogContentText>
                            Enter your unique user ID here to {this.props.actionName.toLowerCase()} your schedule.
                        </DialogContentText>
                        <DialogContentText style={{ color: 'red' }}>
                            Make sure the user ID is unique and secret, or someone else can overwrite your schedule.
                        </DialogContentText>
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
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.rememberMe}
                                    onChange={this.handleToggleRememberMe}
                                    color="primary"
                                />
                            }
                            label="Remember Me (Uncheck on shared computers)"
                        />
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

const LoadFunctionality = () => {
    const isDark = useThemeStore((store) => store.isDark);
    const { updateSession, sessionIsValid } = useSessionStore();

    const [loading, setLoading] = useState(false);
    const [openOptionsDialog, setOpenOptionsDialog] = useState(false);
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const toggleLoadOptionsDialog = () => {
        setOpenOptionsDialog((prev) => !prev);
    };
    const validateImportedUser = async (userID: string) => {
        try {
            const res = await trpc.userData.getGuestAccountAndUserByName
                .query({
                    name: userID,
                })
                .then((res) => res.users.imported);
            if (res) {
                alert('imported');
            }
            return res;
        } catch (error) {
            console.error('Error validating imported user:', error);
            return false;
        }
    };
    const loadScheduleAndSetLoading = useCallback(async (userID: string, rememberMe: boolean) => {
        setLoading(true);
        toggleLoadOptionsDialog();
        if (!(await validateImportedUser(userID))) {
            await loadSchedule(userID, rememberMe, 'GUEST');
        }
        setLoading(false);
    }, []);

    const loadScheduleAndSetLoadingAuth = useCallback(
        async (userID: string, rememberMe: boolean) => {
            setLoading(true);
            const sessionToken: string = getLocalStorageSessionId() ?? '';
            updateSession(sessionToken);
            if (sessionIsValid) {
                const account = await trpc.userData.getUserAndAccountBySessionToken
                    .query({
                        token: sessionToken,
                    })
                    .then((res) => res.accounts);
                await loadSchedule(account.providerAccountId, rememberMe, 'GOOGLE');
            } else if (sessionToken === '' && userID && userID !== '') {
                if (!(await validateImportedUser(userID))) {
                    console.log(userID);
                    await loadSchedule(userID, rememberMe, 'GUEST'); // fallback to guest
                }
            }
            setLoading(false);
        },
        [sessionIsValid, updateSession]
    );

    const LoadOptionDialog = ({ open, onClose }: LoadOptionDialogProps) => {
        const cacheSchedule = () => {
            const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState().schedules;
            if (!isEmptySchedule(scheduleSaveState)) {
                setLocalStorageDataCache(JSON.stringify(scheduleSaveState));
            }
        };

        const handleLogin = async () => {
            try {
                const authUrl = await trpc.userData.getGoogleAuthUrl.query();
                if (authUrl) {
                    cacheSchedule();
                    window.location.href = authUrl;
                }
            } catch (error) {
                console.error('Error during login initiation', error);
            }
        };
        return (
            <Dialog open={open} onClose={onClose} maxWidth="lg" color="inherit">
                <DialogTitle>Load Schedule</DialogTitle>
                <DialogContent>
                    <LoadingButton
                        onClick={handleLogin}
                        startIcon={<GoogleIcon />}
                        color="primary"
                        variant="contained"
                        fullWidth
                    >
                        Sign in with Google
                    </LoadingButton>

                    <Divider sx={{ width: '30rem', my: '1rem' }}>or use your schedule user ID</Divider>

                    <LoadSaveButtonBase
                        id="load-button"
                        actionName={'Load'}
                        action={loadScheduleAndSetLoading}
                        disabled={skeletonMode}
                        loading={loading}
                        colorType={isDark ? 'secondary' : 'primary'}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
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
    }, [loadScheduleAndSetLoading, loadScheduleAndSetLoadingAuth]);

    if (sessionIsValid) {
        return;
    }
    return (
        <div id="load-save-container" style={{ display: 'flex', flexDirection: 'row' }}>
            <LoadingButton
                color="inherit"
                startIcon={<CloudDownload />}
                loading={loading}
                onClick={toggleLoadOptionsDialog}
            >
                Load
            </LoadingButton>
            <LoadOptionDialog open={openOptionsDialog} onClose={toggleLoadOptionsDialog} />
        </div>
    );
};

export default LoadFunctionality;
