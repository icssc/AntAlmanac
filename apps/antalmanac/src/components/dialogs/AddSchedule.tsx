import { useCallback, useState, useEffect, useMemo } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, type DialogProps } from '@mui/material';
import { addSchedule } from '$actions/AppStoreActions';
import { isDarkMode } from '$lib/helpers';
import AppStore from '$stores/AppStore';

type ScheduleNameDialogProps = DialogProps

function AddScheduleDialog(props: ScheduleNameDialogProps) {
    const { onClose, onKeyDown, ...dialogProps } = props;

    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());

    const defaultScheduleName = useMemo(() => `Schedule ${scheduleNames.length + 1}`, [scheduleNames]);

    const [name, setName] = useState(defaultScheduleName);

    const handleCancel = useCallback(() => {
        onClose?.({}, 'escapeKeyDown');
        setName(defaultScheduleName);
    }, [onClose, defaultScheduleName]);

    const handleNameChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setName(event.target.value);
    }, []);

    const submitName = useCallback(() => {
        addSchedule(name);
        onClose?.({}, 'escapeKeyDown');
    }, [onClose, name]);

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
            <DialogTitle>Add Schedule</DialogTitle>

            <DialogContent>
                <TextField fullWidth label="Name" onChange={handleNameChange} value={name} />
            </DialogContent>

            <DialogActions>
                <Button onClick={handleCancel} color={isDarkMode() ? 'secondary' : 'primary'}>
                    Cancel
                </Button>
                <Button onClick={submitName} variant="contained" color="primary" disabled={name.trim() === ''}>
                    Add Schedule
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddScheduleDialog;
