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
import { useCallback, useState, useEffect } from 'react';

import { renameSchedule } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';

interface ScheduleNameDialogProps extends DialogProps {
    /**
     * The index of the schedule to rename (i.e. in the schedules array).
     */
    index: number;
}

/**
 * Dialog with a form to rename a schedule.
 */
function RenameScheduleDialog(props: ScheduleNameDialogProps) {
    /**
     * {@link props.onClose} also needs to be forwarded to the {@link Dialog} component.
     * A custom {@link onKeyDown} handler is provided to handle the Enter and Escape keys.
     */
    const { index, onKeyDown, ...dialogProps } = props;

    /**
     * This is destructured separately for memoization.
     */
    const { onClose } = props;
    const [name, setName] = useState(AppStore.getScheduleNames()[index]);

    const handleCancel = useCallback(() => {
        onClose?.({}, 'escapeKeyDown');
    }, [onClose]);

    const handleNameChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setName(event.target.value);
    }, []);

    const submitName = useCallback(() => {
        renameSchedule(name, index);
        onClose?.({}, 'escapeKeyDown');
    }, [onClose, name, index]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            onKeyDown?.(event);

            if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                submitName();
            }

            if (event.key === 'Escape') {
                onClose?.({}, 'escapeKeyDown');
            }
        },
        [onClose, submitName, onKeyDown]
    );

    const handleScheduleNamesChange = useCallback(() => {
        setName(AppStore.getScheduleNames()[index]);
    }, [index]);

    useEffect(() => {
        handleScheduleNamesChange();
        AppStore.on('scheduleNamesChange', handleScheduleNamesChange);

        return () => {
            AppStore.off('scheduleNamesChange', handleScheduleNamesChange);
        };
    }, [handleScheduleNamesChange]);

    return (
        <Dialog onKeyDown={handleKeyDown} {...dialogProps}>
            <DialogTitle>Rename Schedule</DialogTitle>

            <DialogContent>
                <Box padding={1}>
                    <TextField fullWidth label="Name" onChange={handleNameChange} value={name} />
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleCancel} color={'inherit'}>
                    Cancel
                </Button>
                <Button onClick={submitName} variant="contained" color="primary" disabled={name?.trim() === ''}>
                    Rename Schedule
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default RenameScheduleDialog;
