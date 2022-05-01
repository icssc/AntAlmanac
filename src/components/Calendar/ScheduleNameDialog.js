import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogActions, DialogContent, TextField, MenuItem } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { addSchedule, renameSchedule } from '../../actions/AppStoreActions';
import { isDarkMode } from '../../helpers';

const styles = () => ({
    textField: {
        marginBottom: '25px',
    },
});

const ScheduleNameDialog = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scheduleName, setScheduleName] = useState(
        props.scheduleIndex !== undefined ? props.scheduleNames[props.scheduleIndex] : ''
    );

    const handleOpen = (event) => {
        // We need to stop propagation so that the select menu won't close
        event.stopPropagation();
        setIsOpen(true);
        if (props.onOpen) {
            props.onOpen();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        // If the user cancelled renaming the schedule, the schedule name is changed to its original value;
        // if the user cancelled adding a new schedule, the schedule name is changed to an empty string
        setScheduleName(props.scheduleIndex !== undefined ? props.scheduleNames[props.scheduleIndex] : '');
    };

    const handleNameChange = (event) => {
        setScheduleName(event.target.value);
    };

    const handleAdd = () => {
        props.onClose();
        addSchedule(scheduleName);
        setIsOpen(false);
        setScheduleName('');
    };

    const handleRename = () => {
        props.onClose();
        renameSchedule(scheduleName, props.scheduleIndex);
        setIsOpen(false);
        setScheduleName('');
    };

    // For the dialog, we need to stop the propagation when a key is pressed because
    // MUI Select components support "select by typing", which can remove focus from the dialog.
    // We also need to stop the propagation when the dialog is clicked because if we don't,
    // both the select menu and dialog will close.
    return (
        <>
            <MenuItem onClick={handleOpen}>{props.rename ? 'Rename Schedule' : 'Add Schedule'}</MenuItem>
            <Dialog
                open={isOpen}
                onKeyDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                fullWidth
            >
                <DialogTitle>{props.rename ? 'Rename Schedule' : 'Add a New Schedule'}</DialogTitle>
                <DialogContent>
                    <TextField
                        className={props.classes.textField}
                        label="Name"
                        placeholder="Schedule 2"
                        onChange={handleNameChange}
                        value={scheduleName}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color={isDarkMode() ? 'white' : 'primary'}>
                        Cancel
                    </Button>
                    <Button
                        onClick={props.rename ? handleRename : handleAdd}
                        variant="contained"
                        color="primary"
                        disabled={scheduleName.trim() === ''}
                    >
                        {props.rename ? 'Rename Schedule' : 'Add Schedule'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default withStyles(styles)(ScheduleNameDialog);
