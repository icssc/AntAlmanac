import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    MenuItem,
} from '@material-ui/core';
import { useState } from 'react';

import { deleteSchedule } from '$actions/AppStoreActions';
import { isDarkMode } from '$lib/helpers';
import AppStore from '$stores/AppStore';

interface DeleteScheduleDialogProps {
    onClose: () => void;
}

const DeleteScheduleDialog = (props: DeleteScheduleDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleDelete = () => {
        props.onClose();
        deleteSchedule();
        setIsOpen(false);
    };

    return (
        <>
            <MenuItem onClick={handleOpen} disabled={AppStore.schedule.getNumberOfSchedules() === 1}>
                Delete Schedule
            </MenuItem>
            <Dialog open={isOpen} onClose={handleClose}>
                <DialogTitle>Delete Schedule</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {`"${AppStore.schedule.getCurrentScheduleName()}"`}?
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
        </>
    );
};

export default DeleteScheduleDialog;
