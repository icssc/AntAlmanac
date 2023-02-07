import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    MenuItem,
} from '@mui/material';
import React, { useState } from 'react';

import { deleteSchedule } from '../../../../actions/AppStoreActions';
import { isDarkMode } from '../../../../helpers';

interface DeleteScheduleDialogProps {
    onClose: () => void;
    scheduleIndex: number;
    scheduleNames: string[];
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
                    <Button onClick={handleClose} color={isDarkMode() ? 'inherit' : 'primary'}>
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
