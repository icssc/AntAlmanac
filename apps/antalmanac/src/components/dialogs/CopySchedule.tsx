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
import { useScheduleStore } from '$stores/ScheduleStore';

interface CopyScheduleDialogProps extends DialogProps {
    index: number;
}

function CopyScheduleDialog(props: CopyScheduleDialogProps) {
    const { index } = props;
    const { onClose } = props; // destructured separately for memoization.
    const scheduleNames = useScheduleStore((state) => state.getScheduleNames());

    const [name, setName] = useState(() => `Copy of ${scheduleNames[index] ?? 'Untitled Schedule'}`);

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
