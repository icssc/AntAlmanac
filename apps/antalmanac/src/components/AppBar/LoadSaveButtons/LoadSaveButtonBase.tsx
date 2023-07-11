import { ChangeEvent, useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, FormControlLabel, Checkbox } from '@material-ui/core';
import { CloudDownload, Save } from '@material-ui/icons';
import { LoadingButton } from '@mui/lab';
import { isDarkMode } from '$lib/helpers';

interface LoadSaveButtonBaseProps {
    actionName: 'Save' | 'Load' | 'Load Legacy';
    dialogText?: string;
    action: (userID: string, rememberMe: boolean) => void;
    loading: boolean;
    disabled: boolean;
}

const LoadSaveButtonBase = ({ actionName, dialogText, action, loading, disabled }: LoadSaveButtonBaseProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [userID, setUserID] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    const handleOpen = () => {
        if (dialogText === undefined) {
            action(userID, rememberMe);
        } else {
            setIsOpen(true);
            if (typeof Storage !== 'undefined') {
                const userID = window.localStorage.getItem('userID');
                if (userID !== null) {
                    setUserID(userID);
                }
            }
        }
    };

    const handleClose = (wasCancelled: boolean) => {
        setIsOpen(false);
        setUserID('');
        if (!wasCancelled) {
            action(userID, rememberMe);
        }
    };

    const handleToggleRememberMe = (event: ChangeEvent<HTMLInputElement>) => {
        setRememberMe(event.target.checked);
    };

    useEffect(() => {
        const handleEnterKey = (event: KeyboardEvent) => {
            if (isOpen && (event.key === 'Enter' || event.keyCode === 13)) {
                event.preventDefault();
                handleClose(false);
            }
        };

        document.addEventListener('keydown', handleEnterKey);
        return () => {
            document.removeEventListener('keydown', handleEnterKey);
        };
    }, [isOpen]);

    return (
        <>
            <LoadingButton
                onClick={handleOpen}
                color='inherit'
                startIcon={actionName === 'Save' ? <Save /> : <CloudDownload />}
                loading={loading}
                disabled={disabled}
            >
                {actionName}
            </LoadingButton>
            <Dialog open={isOpen} onClose={() => handleClose(true)}>
                <DialogTitle>{actionName}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialogText}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="User ID"
                        type="text"
                        fullWidth
                        placeholder="Enter here"
                        value={userID}
                        onChange={(event) => setUserID(event.target.value)}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={rememberMe}
                                onChange={handleToggleRememberMe}
                                color="primary"
                            />
                        }
                        label="Remember Me (Uncheck on shared computers)"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClose(true)} color={isDarkMode() ? 'secondary' : 'primary'}>
                        {'Cancel'}
                    </Button>
                    <Button onClick={() => handleClose(false)} color={isDarkMode() ? 'secondary' : 'primary'}>
                        {actionName}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default LoadSaveButtonBase;
