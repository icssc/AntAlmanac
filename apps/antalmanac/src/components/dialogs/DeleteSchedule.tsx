import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    type DialogProps,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { deleteSchedule } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/SettingsStore';

interface ScheduleNameDialogProps extends DialogProps {
    /**
     * The index of the schedule to rename (i.e. in the schedules array).
     */
    index: number;
}

/**
 * Dialog with a prompt to delete the specified schedule.
 */
function DeleteScheduleDialog(props: ScheduleNameDialogProps) {
    const isDark = useThemeStore((store) => store.isDark);

    /**
     * {@link props.onClose} also needs to be forwarded to the {@link Dialog} component.
     */
    const { index, ...dialogProps } = props;

    /**
     * This is destructured separately for memoization.
     */
    const { onClose } = props;
    const [name, setName] = useState<string>(AppStore.getScheduleNames()[index]);

    const handleCancel = useCallback(() => {
        onClose?.({}, 'escapeKeyDown');
    }, [onClose]);

    const handleDelete = useCallback(() => {
        deleteSchedule(index);
        onClose?.({}, 'escapeKeyDown');
    }, [index, onClose]);

    const handleScheduleNamesChange = useCallback(() => {
        setName(AppStore.getScheduleNames()[index]);
    }, [index]);

    useEffect(() => {
        AppStore.on('scheduleNamesChange', handleScheduleNamesChange);

        return () => {
            AppStore.off('scheduleNamesChange', handleScheduleNamesChange);
        };
    }, [handleScheduleNamesChange]);

    return (
        <Dialog {...dialogProps}>
            <DialogTitle>Delete Schedule</DialogTitle>

            <DialogContent>
                <DialogContentText>Are you sure you want to delete &#34;{name}&#34;?</DialogContentText>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleCancel} color={isDark ? 'secondary' : 'primary'}>
                    Cancel
                </Button>
                <Button onClick={handleDelete} variant="contained" color="primary">
                    Delete Schedule
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DeleteScheduleDialog;
