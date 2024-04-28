import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    type DialogProps,
    Box,
} from '@mui/material';
import { useCallback, useState, useEffect } from 'react';

import { addSchedule } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/SettingsStore';

type ScheduleNameDialogProps = DialogProps;

/**
 * Dialog with a text field to add a schedule.
 */
function AddScheduleDialog(props: ScheduleNameDialogProps) {
    const isDark = useThemeStore((store) => store.isDark);

    /**
     * {@link props.onClose} also needs to be forwarded to the {@link Dialog} component.
     * A custom {@link onKeyDown} handler is provided to handle the Enter and Escape keys.
     */
    const { onKeyDown, ...dialogProps } = props;

    /**
     * This is destructured separately for memoization.
     */
    const { onClose } = props;

    const [, setScheduleNames] = useState(AppStore.getScheduleNames());

    const [name, setName] = useState(AppStore.getDefaultScheduleName());

    const handleCancel = useCallback(() => {
        onClose?.({}, 'escapeKeyDown');
    }, [onClose]);

    const handleNameChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setName(event.target.value);
    }, []);

    const submitName = useCallback(() => {
        addSchedule(name);
        setName(AppStore.schedule.getDefaultScheduleName());
        onClose?.({}, 'escapeKeyDown');
    }, [onClose, name]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            onKeyDown?.(event);

            if (event.key === 'Enter') {
                event.stopPropagation();
                event.preventDefault();
                submitName();
            }

            if (event.key === 'Escape') {
                props.onClose?.({}, 'escapeKeyDown');
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
            <DialogTitle>Add Schedule</DialogTitle>

            <DialogContent>
                <Box padding={1}>
                    <TextField fullWidth label="Name" onChange={handleNameChange} value={name} />
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleCancel} color={isDark ? 'secondary' : 'primary'}>
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
