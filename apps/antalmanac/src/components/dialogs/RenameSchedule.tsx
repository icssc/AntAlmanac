import { useCallback, useState, useEffect, useMemo } from 'react';
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
import { renameSchedule } from '$actions/AppStoreActions';
import { isDarkMode } from '$lib/helpers';
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

    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());

    const [name, setName] = useState(scheduleNames[index]);

    const disabled = useMemo(() => {
        return name?.trim() === '';
    }, [name]);

    const handleCancel = useCallback(() => {
        onClose?.({}, 'escapeKeyDown');
        setName(scheduleNames[index]);
    }, [onClose, scheduleNames, index]);

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
        setScheduleNames(AppStore.getScheduleNames());
    }, []);

    useEffect(() => {
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
                <Button onClick={submitName} variant="contained" color="primary" disabled={disabled}>
                    Rename Schedule
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default RenameScheduleDialog;
