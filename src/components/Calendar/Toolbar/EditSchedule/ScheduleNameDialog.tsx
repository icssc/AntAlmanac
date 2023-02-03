import { Add } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem,TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import { ClassNameMap } from '@mui/styles/withStyles';
import React, { useState } from 'react';

import { addSchedule, renameSchedule } from '../../../../actions/AppStoreActions';
import { isDarkMode } from '../../../../helpers';

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
}

const ScheduleNameDialog = (props: ScheduleNameDialogProps) => {
    const { classes, onOpen, onClose, scheduleNames, scheduleRenameIndex } = props;
    const rename = scheduleRenameIndex !== undefined;

    const [isOpen, setIsOpen] = useState(false);
    const [scheduleName, setScheduleName] = useState(
        scheduleRenameIndex !== undefined ? scheduleNames[scheduleRenameIndex] : `Schedule ${scheduleNames.length + 1}`
    );
    const [clickedText, setClickedText] = useState(false);

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
        // If the user cancelled renaming the schedule, the schedule name is changed to its original value;
        // if the user cancelled adding a new schedule, the schedule name is changed to the default schedule name
        setScheduleName(rename ? scheduleNames[scheduleRenameIndex] : `Schedule ${scheduleNames.length + 1}`);
        setClickedText(false);
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
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
        renameSchedule(scheduleName, scheduleRenameIndex as number); // typecast works b/c this function only runs when `const rename = scheduleRenameIndex !== undefined` is true.
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
