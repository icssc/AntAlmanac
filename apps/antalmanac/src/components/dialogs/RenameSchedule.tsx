import { useCallback, useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, type DialogProps } from '@mui/material';
import { renameSchedule } from '$actions/AppStoreActions';
import { isDarkMode } from '$lib/helpers';
import AppStore from '$stores/AppStore';

interface ScheduleNameDialogProps extends DialogProps {
    /**
     * The index of the schedule to rename (i.e. in the schedules array).
     */
    index: number;
}

function RenameScheduleDialog(props: ScheduleNameDialogProps) {
    /**
     * {@link props.onClose} also needs to be forwarded to the {@link Dialog} component.
     * A custom {@link onKeyDown} handler is provided to handle the Enter and Escape keys.
     */
    const { index, onKeyDown, ...dialogProps } = props;

    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());

    const [name, setName] = useState(scheduleNames[index]);

    const handleCancel = useCallback(() => {
        props.onClose?.({}, 'escapeKeyDown');
        setName(scheduleNames[index]);
    }, [props.onClose, scheduleNames, index]);

    const handleNameChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setName(event.target.value);
    }, []);

    const submitName = useCallback(() => {
        renameSchedule(name, index as number);
        props.onClose?.({}, 'escapeKeyDown');
    }, [props.onClose, name, index]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            onKeyDown?.(event);

            if (event.key === 'Enter') {
                submitName();
            }

            if (event.key === 'Escape') {
                props.onClose?.({}, 'escapeKeyDown');
            }
        },
        [props.onClose, submitName]
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
                <TextField fullWidth label="Name" onChange={handleNameChange} value={name} />
            </DialogContent>

            <DialogActions>
                <Button onClick={handleCancel} color={isDarkMode() ? 'secondary' : 'primary'}>
                    Cancel
                </Button>
                <Button onClick={submitName} variant="contained" color="primary" disabled={name.trim() === ''}>
                    Rename Schedule
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default RenameScheduleDialog;
