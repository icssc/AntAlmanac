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
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { CloudDownload, Save } from '@material-ui/icons';
import { ChangeEvent, PureComponent, useEffect, useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { loadSchedule, saveSchedule } from '$actions/AppStoreActions';
import { useThemeStore } from '$stores/SettingsStore';
import AppStore from '$stores/AppStore';

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
}

class SaveLoadIcon extends PureComponent<{ loading: boolean; actionName: 'Save' | 'Load' }> {
    render() {
        const { loading, actionName } = this.props;
        if (loading) {
            return <CircularProgress size={20} color={'inherit'} />;
        } else {
            return actionName === 'Save' ? <Save /> : <CloudDownload />;
        }
    }
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
            const userID = window.localStorage.getItem('userID');
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

const LoadSaveScheduleFunctionality = () => {
    const isDark = useThemeStore((store) => store.isDark);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    const loadScheduleAndSetLoading = async (userID: string, rememberMe: boolean) => {
        setLoading(true);
        await loadSchedule(userID, rememberMe);
        setLoading(false);
    };

    const saveScheduleAndSetLoading = async (userID: string, rememberMe: boolean) => {
        setSaving(true);
        await saveSchedule(userID, rememberMe);
        setSaving(false);
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
            const savedUserID = window.localStorage.getItem('userID');

            if (savedUserID != null) {
                // this `void` is for eslint "no floating promises"
                void loadScheduleAndSetLoading(savedUserID, true);
            }
        }
    }, []);

    useEffect(() => {
        const handleAutoSaveStart = () => setSaving(true);
        const handleAutoSaveEnd = () => setSaving(false);

        AppStore.on('autoSaveStart', handleAutoSaveStart);
        AppStore.on('autoSaveEnd', handleAutoSaveEnd);

        return () => {
            AppStore.off('autoSaveStart', handleAutoSaveStart);
            AppStore.off('autoSaveEnd', handleAutoSaveEnd);
        };
    }, []);

    return (
        <div id="load-save-container">
            <LoadSaveButtonBase
                id="save-button"
                actionName={'Save'}
                action={saveScheduleAndSetLoading}
                disabled={loading}
                loading={saving}
                colorType={isDark ? 'secondary' : 'primary'}
            />
            <LoadSaveButtonBase
                id="load-button"
                actionName={'Load'}
                action={loadScheduleAndSetLoading}
                disabled={skeletonMode}
                loading={loading}
                colorType={isDark ? 'secondary' : 'primary'}
            />
        </div>
    );
};

export default LoadSaveScheduleFunctionality;
