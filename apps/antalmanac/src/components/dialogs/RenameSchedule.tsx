import { useCallback, useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, type DialogProps } from '@mui/material';
import { renameSchedule } from '$actions/AppStoreActions';
import { isDarkMode } from '$lib/helpers';
import AppStore from '$stores/AppStore';

interface ScheduleNameDialogProps extends DialogProps {
    scheduleNames: string[];
    scheduleRenameIndex: number;
}

function RenameScheduleDialog(props: ScheduleNameDialogProps) {
    const { onClose, scheduleRenameIndex, onKeyDown, ...dialogProps } = props;

    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());

    const [name, setName] = useState(scheduleNames[scheduleRenameIndex]);

    const handleCancel = useCallback(() => {
        onClose?.({}, 'escapeKeyDown');
        setName(scheduleNames[scheduleRenameIndex]);
    }, [onClose, scheduleNames, scheduleRenameIndex]);

    const handleNameChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setName(event.target.value);
    }, []);

    const submitName = useCallback(() => {
        renameSchedule(name, scheduleRenameIndex as number);
        onClose?.({}, 'escapeKeyDown');
    }, [onClose, name, scheduleRenameIndex]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            onKeyDown?.(event);

            if (event.key === 'Enter') {
                submitName();
            }

            if (event.key === 'Escape') {
                onClose?.({}, 'escapeKeyDown');
            }
        },
        [onClose, submitName]
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
