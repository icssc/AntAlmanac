import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    DialogContentText,
    MenuItem,
} from '@material-ui/core';
import { isDarkMode } from '../../helpers';
import { deleteSchedule } from '../../actions/AppStoreActions';

const DeleteScheduleDialog = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleDelete = () => {
        props.onClose();
        deleteSchedule(props.scheduleIndex);
        setIsOpen(false);
    };

    return (
        <>
            <MenuItem onClick={handleOpen} disabled={props.scheduleNames.length === 1}>
                Delete Schedule
            </MenuItem>
            <Dialog open={isOpen}>
                <DialogTitle>Delete Schedule</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete {`"${props.scheduleNames[props.scheduleIndex]}"`}?
                        <br />
                        <br />
                        You cannot undo this action.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color={isDarkMode() ? 'white' : 'primary'}>
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
