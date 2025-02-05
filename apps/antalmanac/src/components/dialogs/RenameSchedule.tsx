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
import { useScheduleStore } from '$stores/ScheduleStore';

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
    const renameSchedule = useScheduleStore((state) => state.renameSchedule);
    const getScheduleNames = useScheduleStore((state) => state.getScheduleNames);

    const [name, setName] = useState(getScheduleNames()[index]);

    const handleCancel = useCallback(() => {
        onClose?.({}, 'escapeKeyDown');
    }, [onClose]);

    const handleNameChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setName(event.target.value);
    }, []);

    const submitName = useCallback(() => {
        renameSchedule(index, name);
        onClose?.({}, 'escapeKeyDown');
    }, [onClose, name, index, renameSchedule]);

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

    useEffect(() => {
        setName(useScheduleStore.getState().getScheduleNames()[index]);
    }, [index]);

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
