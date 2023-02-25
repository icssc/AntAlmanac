import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { Add } from '@material-ui/icons';
import React, { useState } from 'react';

import { addSchedule, editSchedule } from '$actions/AppStoreActions';
import { isDarkMode } from '$lib/helpers';

const styles = () => ({
    addButton: {
        marginRight: '5px',
    },
    textField: {
        marginBottom: '25px',
    },
});

interface ScheduleDialogProps {
    classes: ClassNameMap;
    onOpen?: () => void;
    onClose: () => void;
    scheduleNames: string[];
    scheduleEditIndex?: number;
    scheduleNotes: string[];
}

const ScheduleDialog = (props: ScheduleDialogProps) => {
    const { classes, onOpen, onClose, scheduleNames, scheduleEditIndex, scheduleNotes } = props;
    const edit = scheduleEditIndex !== undefined;

    const [isOpen, setIsOpen] = useState(false);
    const [scheduleName, setScheduleName] = useState(
        scheduleEditIndex !== undefined ? scheduleNames[scheduleEditIndex] : `Schedule ${scheduleNames.length + 1}`
    );
    const [clickedText, setClickedText] = useState(false);
    const [scheduleNote, setScheduleNote] = useState(
        scheduleEditIndex !== undefined ? scheduleNotes[scheduleEditIndex] : ''
    );

    const handleOpen: React.MouseEventHandler<HTMLLIElement> = (event) => {
        // We need to stop propagation so that the select menu won't close
        event.stopPropagation();
        setIsOpen(true);
        if (onOpen) {
            onOpen();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        // If the user cancelled renaming the schedule, the schedule name and note are changed to their original value;
        // if the user cancelled adding a new schedule, the schedule name and note are changed to their default value
        setScheduleName(edit ? scheduleNames[scheduleEditIndex] : `Schedule ${scheduleNames.length + 1}`);
        setScheduleNote(edit ? scheduleNotes[scheduleEditIndex] : '');
        setClickedText(false);
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setScheduleName(event.target.value);
    };

    const handleAdd = () => {
        clearDialog();
        addSchedule(scheduleName, scheduleNote);
    };

    const handleEdit = () => {
        clearDialog();
        editSchedule(scheduleName, scheduleEditIndex as number, scheduleNote); // typecast works b/c this function only runs when `const edit = scheduleEditIndex !== undefined` is true.
    };

    // Closes the dialog and resets the fields within it
    const clearDialog = () => {
        onClose();
        setIsOpen(false);
        setScheduleName('');
        setScheduleNote('');
    };

    const handleTextClick = () => {
        // When the user first clicks on the text field when they are adding a
        // new schedule, erase the default schedule name and make the text field empty
        if (!edit && !clickedText) {
            setScheduleName('');
            setClickedText(true);
        }
    };

    const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setScheduleNote(event.target.value);
    };

    // For the dialog, we need to stop the propagation when a key is pressed because
    // MUI Select components support "select by typing", which can remove focus from the dialog.
    // We also need to stop the propagation when the dialog is clicked because if we don't,
    // both the select menu and dialog will close.
    return (
        <>
            {edit ? (
                <MenuItem onClick={handleOpen}>Edit Schedule</MenuItem>
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
                <DialogTitle>{edit ? 'Edit Schedule' : 'Add a New Schedule'}</DialogTitle>
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
                <DialogContent>
                    <TextField
                        label="Notes"
                        margin="dense"
                        type="text"
                        placeholder="This schedule is for..."
                        onChange={handleNoteChange}
                        value={scheduleNote}
                        fullWidth
                        multiline
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color={isDarkMode() ? 'secondary' : 'primary'}>
                        Cancel
                    </Button>
                    <Button
                        onClick={edit ? handleEdit : handleAdd}
                        variant="contained"
                        color="primary"
                        disabled={scheduleName.trim() === ''}
                    >
                        {edit ? 'Edit Schedule' : 'Add Schedule'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default withStyles(styles)(ScheduleDialog);
