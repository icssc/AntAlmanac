import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    CircularProgress,
} from '@material-ui/core';
import { CloudDownload, Save } from '@material-ui/icons';
import GoogleIcon from '@mui/icons-material/Google';
import { LoadingButton } from '@mui/lab';
import { Divider } from '@mui/material';
import { ChangeEvent, PureComponent, useEffect, useState, useCallback } from 'react';

import { loadSchedule, saveSchedule, loginUser, loadScheduleWithSessionToken } from '$actions/AppStoreActions';
import { AlertDialog } from '$components/AlertDialog';
import trpc from '$lib/api/trpc';
import { getLocalStorageSessionId, getLocalStorageUserId, setLocalStorageFromLoading } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';
import { useToggleStore } from '$stores/ToggleStore';

interface LoadSaveButtonBaseProps {
    action: typeof saveSchedule;
    actionSecondary?: () => void;
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
                        <LoadingButton
                            onClick={this.props.actionSecondary}
                            color="primary"
                            variant="contained"
                            startIcon={<GoogleIcon />}
                            fullWidth
                        >
                            Sign in with Google
                        </LoadingButton>
                        <Divider sx={{ my: '1rem', width: '35rem', maxWidth: '100%' }}>or</Divider>
                        <DialogContentText>
                            Enter your unique user ID here to {this.props.actionName.toLowerCase()} your schedule.
                        </DialogContentText>
                        {/* <DialogContentText style={{ color: 'red' }}>
                            Make sure the user ID is unique and secret, or someone else can overwrite your schedule.
                        </DialogContentText> */}
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
                        {/* <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.rememberMe}
                                    onChange={this.handleToggleRememberMe}
                                    color="primary"
                                />
                            }
                            label="Remember Me (Uncheck on shared computers)"
                        /> */}
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

    const { openLoadingSchedule: loadingSchedule, setOpenLoadingSchedule } = useToggleStore();

    const [openAlert, setOpenalert] = useState(false);
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const validateImportedUser = async (userID: string) => {
        try {
            const res = await trpc.userData.getGuestAccountAndUserByName
                .query({
                    name: userID,
                })
                .then((res) => res.users.imported);
            if (res) {
                setOpenalert(true);
            }
            return res;
        } catch (error) {
            console.error('Error validating imported user:', error);
            return false;
        }
    };
    const loadScheduleAndSetLoading = useCallback(async (userID: string, rememberMe: boolean) => {
        setOpenLoadingSchedule(true);
        if (!(await validateImportedUser(userID))) {
            await loadSchedule(userID, rememberMe, 'GUEST');
        }
        setOpenLoadingSchedule(false);
    }, []);

    const loadScheduleAndSetLoadingAuth = useCallback(
        async (userID: string, rememberMe: boolean) => {
            setOpenLoadingSchedule(true);
            const sessionToken: string = getLocalStorageSessionId() ?? '';
            if (await loadScheduleWithSessionToken()) {
                // const account = await trpc.userData.getUserAndAccountBySessionToken
                //     .query({ token: sessionToken })
                //     .then((res) => res.accounts);
                // pass in both userId and providerAccountId so the backend does not have to make a redundant request for the userId
                // await loadSchedule(account.providerAccountId, rememberMe, 'GOOGLE', account.userId);
                updateSession(sessionToken);
            } else if (sessionToken === '' && userID && userID !== '') {
                await loadSchedule(userID, rememberMe, 'GUEST'); // fallback to guest
            }
            setOpenLoadingSchedule(false);
        },
        [updateSession]
    );

    //     const cacheSchedule = () => {
    //         const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState().schedules;
    //         if (!isEmptySchedule(scheduleSaveState)) {
    //             setLocalStorageDataCache(JSON.stringify(scheduleSaveState));
    //         }
    //     };
    //
    //     const handleLogin = async () => {
    //         try {
    //             const authUrl = await trpc.userData.getGoogleAuthUrl.query();
    //             if (authUrl) {
    //                 cacheSchedule();
    //                 window.location.href = authUrl;
    //             }
    //         } catch (error) {
    //             console.error('Error during login initiation', error);
    //         }
    //     };

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
                actionSecondary={() => {
                    loginUser();
                    setLocalStorageFromLoading('true');
                }}
                disabled={skeletonMode}
                loading={loadingSchedule}
                colorType={isDark ? 'secondary' : 'primary'}
            />

            <AlertDialog
                open={openAlert}
                onClose={() => setOpenalert(false)}
                title="This schedule seems to have already been imported!"
                severity="warning"
                defaultAction
            >
                <DialogContentText>To access your schedule sign in with the Google account</DialogContentText>
                <LoadingButton
                    color="primary"
                    variant="contained"
                    startIcon={<GoogleIcon />}
                    fullWidth
                    onClick={loginUser}
                >
                    Sign in with Google
                </LoadingButton>
            </AlertDialog>
        </div>
    );
};

export default LoadFunctionality;
