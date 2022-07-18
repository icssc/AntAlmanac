import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogActions, DialogContent, TextField, MenuItem } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { addSchedule, renameSchedule } from '../../actions/AppStoreActions';
import { isDarkMode } from '../../helpers';
import { Add } from '@material-ui/icons';

const styles = () => ({
    addButton: {
        marginRight: '5px',
    },
    textField: {
        marginBottom: '25px',
    },
});

const ScheduleNameDialog = (props) => {
    const { classes, onOpen, onClose, scheduleNames, scheduleIndex, rename } = props;

    const [isOpen, setIsOpen] = useState(false);
    const [scheduleName, setScheduleName] = useState(
        rename ? scheduleNames[scheduleIndex] : `Schedule ${scheduleNames.length + 1}`
    );
    const [clickedText, setClickedText] = useState(false);

    const handleOpen = (event) => {
        // We need to stop propagation so that the select menu won't close
        event.stopPropagation();
        setIsOpen(true);
        if (onOpen) {
            onOpen();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        // If the user cancelled renaming the schedule, the schedule name is changed to its original value;
        // if the user cancelled adding a new schedule, the schedule name is changed to the default schedule name
        setScheduleName(rename ? scheduleNames[scheduleIndex] : `Schedule ${scheduleNames.length + 1}`);
        setClickedText(false);
    };

    const handleNameChange = (event) => {
        setScheduleName(event.target.value);
    };

    const handleAdd = () => {
        onClose();
        addSchedule(scheduleName);
        setIsOpen(false);
        setScheduleName('');
    };

    const handleRename = () => {
        onClose();
        renameSchedule(scheduleName, scheduleIndex);
        setIsOpen(false);
        setScheduleName('');
    };

    const handleTextClick = () => {
        // When the user first clicks on the text field when they are adding a
        // new schedule, erase the default schedule name and make the text field empty
        if (!rename && !clickedText) {
            setScheduleName('');
            setClickedText(true);
        }
    };

    // For the dialog, we need to stop the propagation when a key is pressed because
    // MUI Select components support "select by typing", which can remove focus from the dialog.
    // We also need to stop the propagation when the dialog is clicked because if we don't,
    // both the select menu and dialog will close.
    return (
        <>
            {rename ? (
                <MenuItem onClick={handleOpen}>Rename Schedule</MenuItem>
            ) : (
                <MenuItem onClick={handleOpen}>
                    <Add className={classes.addButton} />
                    Add Schedule
                </MenuItem>
            )}
            <Dialog
                open={isOpen}
                onKeyDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                fullWidth
            >
                <DialogTitle>{rename ? 'Rename Schedule' : 'Add a New Schedule'}</DialogTitle>
                <DialogContent>
                    <TextField
                        className={classes.textField}
                        label="Name"
                        placeholder={`Schedule ${scheduleNames.length + 1}`}
                        onChange={handleNameChange}
                        value={scheduleName}
                        onClick={handleTextClick}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color={isDarkMode() ? 'white' : 'primary'}>
                        Cancel
                    </Button>
                    <Button
                        onClick={rename ? handleRename : handleAdd}
                        variant="contained"
                        color="primary"
                        disabled={scheduleName.trim() === ''}
                    >
                        {rename ? 'Rename Schedule' : 'Add Schedule'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default withStyles(styles)(ScheduleNameDialog);
