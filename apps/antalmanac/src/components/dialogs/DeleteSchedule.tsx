import { useCallback, useMemo } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    type DialogProps,
} from '@mui/material';
import { deleteSchedule } from '$actions/AppStoreActions';
import { useThemeStore } from '$stores/SettingsStore';
import AppStore from '$stores/AppStore';

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

    const scheduleName = useMemo(() => {
        return AppStore.schedule.getScheduleName(index);
    }, [index]);

    const handleCancel = useCallback(() => {
        onClose?.({}, 'escapeKeyDown');
    }, [onClose, index]);

    const handleDelete = useCallback(() => {
        deleteSchedule(index);
        onClose?.({}, 'escapeKeyDown');
    }, [index]);

    return (
        <Dialog {...dialogProps}>
            <DialogTitle>Delete Schedule</DialogTitle>

            <DialogContent>
                <DialogContentText>Are you sure you want to delete &#34;{scheduleName}&#34;?</DialogContentText>
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
