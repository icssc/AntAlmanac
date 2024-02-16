import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    MenuItem,
    IconButton,
    Box,
    Tooltip,
} from '@material-ui/core';
import { useState } from 'react';
import { Clear } from '@material-ui/icons';

import { deleteSchedule } from '$actions/AppStoreActions';
import { useThemeStore } from '$stores/SettingsStore';
import AppStore from '$stores/AppStore';

interface DeleteScheduleDialogProps {
    onClose?: () => void;
    scheduleIndex: number;
}

const DeleteScheduleDialog = (props: DeleteScheduleDialogProps) => {
    const isDark = useThemeStore((store) => store.isDark);

    const { scheduleIndex } = props;

    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleDelete = () => {
        props.onClose?.();
        deleteSchedule(scheduleIndex);
        setIsOpen(false);
    };

    return (
        <Box>
            <MenuItem onClick={handleOpen} disabled={AppStore.schedule.getNumberOfSchedules() === 1}>
                <Tooltip title="Delete Schedule">
                    <IconButton size="small">
                        <Clear />
                    </IconButton>
                </Tooltip>
            </MenuItem>
            <Dialog open={isOpen} onClose={handleClose}>
                <DialogTitle>Delete Schedule</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {`"${AppStore.schedule.getScheduleName(scheduleIndex)}"`}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color={isDark ? 'secondary' : 'primary'}>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} variant="contained" color="primary">
                        Delete Schedule
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DeleteScheduleDialog;
