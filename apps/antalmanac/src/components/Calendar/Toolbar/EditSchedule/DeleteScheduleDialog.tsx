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
} from '@material-ui/core';
import { useState } from 'react';
import { Delete } from '@material-ui/icons';

import { deleteSchedule } from '$actions/AppStoreActions';
import { isDarkMode } from '$lib/helpers';
import AppStore from '$stores/AppStore';

interface DeleteScheduleDialogProps {
    onClose: () => void;
    scheduleIndex: number;
}

const DeleteScheduleDialog = (props: DeleteScheduleDialogProps) => {
    const { scheduleIndex } = props;

    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleDelete = () => {
        props.onClose();
        deleteSchedule(scheduleIndex);
        setIsOpen(false);
    };

    return (
        <Box>
            <MenuItem
                onClick={handleOpen}
                disabled={AppStore.schedule.getNumberOfSchedules() === 1}
                style={{ padding: 'inherit', borderRadius: '50%' }}
            >
                <IconButton style={{ padding: '5px' }}>
                    <Delete />
                </IconButton>
            </MenuItem>
            <Dialog open={isOpen} onClose={handleClose}>
                <DialogTitle>Delete Schedule</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {`"${AppStore.schedule.getScheduleName(scheduleIndex)}"`}?
                        {/* Are you sure you want to delete {scheduleIndex}? */}
                        <br />
                        <br />
                        You cannot undo this action.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color={isDarkMode() ? 'secondary' : 'primary'}>
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
