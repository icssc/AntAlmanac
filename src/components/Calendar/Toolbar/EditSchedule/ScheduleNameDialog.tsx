import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { Add } from '@material-ui/icons';
import React, { useState } from 'react';

import { addSchedule, renameSchedule } from '$actions/AppStoreActions';
import { isDarkMode } from '$lib/helpers';

const styles = () => ({
    addButton: {
        marginRight: '5px',
    },
    textField: {
        marginBottom: '25px',
    },
});

interface ScheduleNameDialogProps {
    classes: ClassNameMap;
    onOpen?: () => void;
    onClose: () => void;
    scheduleNames: string[];
    scheduleRenameIndex?: number;
    scheduleNotes: string[];
}

const ScheduleNameDialog = (props: ScheduleNameDialogProps) => {
    const { classes, onOpen, onClose, scheduleNames, scheduleRenameIndex, scheduleNotes } = props;
    const rename = scheduleRenameIndex !== undefined;

    const [isOpen, setIsOpen] = useState(false);
    const [scheduleName, setScheduleName] = useState(
        scheduleRenameIndex !== undefined ? scheduleNames[scheduleRenameIndex] : `Schedule ${scheduleNames.length + 1}`
    );
    const [clickedText, setClickedText] = useState(false);
    const [scheduleNote, setScheduleNote] = useState(
        scheduleRenameIndex !== undefined ? scheduleNotes[scheduleRenameIndex] : ''
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
        setScheduleName(rename ? scheduleNames[scheduleRenameIndex] : `Schedule ${scheduleNames.length + 1}`);
        setScheduleNote(rename ? scheduleNotes[scheduleRenameIndex] : '');
        setClickedText(false);
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setScheduleName(event.target.value);
    };

    const handleAdd = () => {
        onClose();
        addSchedule(scheduleName, scheduleNote);
        setIsOpen(false);
        setScheduleName('');
        setScheduleNote('');
    };

    const handleRename = () => {
        onClose();
        renameSchedule(scheduleName, scheduleRenameIndex as number, scheduleNote); // typecast works b/c this function only runs when `const rename = scheduleRenameIndex !== undefined` is true.
        setIsOpen(false);
        setScheduleName('');
        setScheduleNote('');
    };

    const handleTextClick = () => {
        // When the user first clicks on the text field when they are adding a
        // new schedule, erase the default schedule name and make the text field empty
        if (!rename && !clickedText) {
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
