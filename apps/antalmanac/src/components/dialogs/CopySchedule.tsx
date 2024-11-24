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
import { useState, useCallback } from 'react';

import { copySchedule, addSchedule } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';

interface CopyScheduleDialogProps extends DialogProps {
    index: number;
}

function CopyScheduleDialog(props: CopyScheduleDialogProps) {
    const { index } = props;
    const { onClose } = props; // destructured separately for memoization.
    const scheduleNames = AppStore.getScheduleNames();
    const [name, setName] = useState<string>(`Copy of ${scheduleNames[index]}`);

    const handleNameChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setName(event.target.value);
    }, []);

    const handleCancel = useCallback(() => {
        onClose?.({}, 'escapeKeyDown');
    }, [onClose]);

    const handleCopy = useCallback(() => {
        addSchedule(AppStore.getNextScheduleName(name));
        AppStore.changeCurrentSchedule(index);
        copySchedule(AppStore.getScheduleNames().length - 1);
        onClose?.({}, 'escapeKeyDown');
    }, [index, onClose]);

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
                <Button onClick={handleCopy} variant="contained" color="primary">
                    Make a Copy
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CopyScheduleDialog;
