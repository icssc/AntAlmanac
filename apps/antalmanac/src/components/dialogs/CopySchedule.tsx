import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    type DialogProps,
} from '@mui/material';
import { useState, useEffect, useCallback } from 'react';

import { copySchedule } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';

interface CopyScheduleDialogProps extends DialogProps {
    index: number;
}

function CopyScheduleDialog(props: CopyScheduleDialogProps) {
    const { index } = props;
    const { onClose } = props; // destructured separately for memoization.
    const [name, setName] = useState<string>(`Copy of ${AppStore.getScheduleNames()[index]}`);

    const handleNameChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setName(event.target.value);
    }, []);

    const handleCancel = useCallback(() => {
        onClose?.({}, 'escapeKeyDown');
    }, [onClose]);

    const handleCopy = useCallback(() => {
        copySchedule(index, name);
        onClose?.({}, 'escapeKeyDown');
    }, [onClose, name]);

    const handleScheduleNamesChange = useCallback(() => {
        setName(`Copy of ${AppStore.getScheduleNames()[index]}`);
    }, [index]);

    useEffect(() => {
        AppStore.on('scheduleNamesChange', handleScheduleNamesChange);
        return () => {
            AppStore.off('scheduleNamesChange', handleScheduleNamesChange);
        };
    }, [handleScheduleNamesChange]);

    return (
        <Dialog onClose={onClose} {...props}>
            <DialogTitle>Copy Schedule</DialogTitle>
            <DialogContent>
                <Box padding={1}>
                    <TextField fullWidth label="Name" onChange={handleNameChange} value={name} />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCancel} color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleCopy} variant="contained" color="primary" disabled={name?.trim() === ''}>
                    Make a Copy
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CopyScheduleDialog;
