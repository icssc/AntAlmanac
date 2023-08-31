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
    onClose?: () => void;
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

    // We need to stop propagation so that the select menu won't close
    const handleOpen: React.MouseEventHandler<HTMLLIElement> = (event) => {
        event.stopPropagation();
        setIsOpen(true);
        onOpen?.();
    };

    /**
     * If the user cancelled renaming the schedule, the schedule name is changed to its original value.
     * If the user cancelled adding a new schedule, the schedule name is changed to the default schedule name.
     */
    const handleCancel = () => {
        setIsOpen(false);
        setScheduleName(rename ? scheduleNames[scheduleRenameIndex] : `Schedule ${scheduleNames.length + 1}`);
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setScheduleName(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        event.stopPropagation();

        if (event.key === 'Enter') {
            submitName();
        }

        if (event.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const submitName = () => {
        onClose?.();

        if (rename) {
            renameSchedule(scheduleName, scheduleRenameIndex as number); // typecast works b/c this function only runs when `const rename = scheduleRenameIndex !== undefined` is true.
        } else {
            addSchedule(scheduleName);
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
                fullWidth
                open={isOpen}
                onKeyDown={handleKeyDown}
                onClick={(event: React.MouseEvent<Element, MouseEvent>) => event.stopPropagation()}
                onClose={() => setIsOpen(false)}
            >
                <DialogTitle>{rename ? 'Rename Schedule' : 'Add a New Schedule'}</DialogTitle>

                <DialogContent>
                    <TextField
                        // We enable autofocus in order to be consistent with the Save, Load, and Import dialogs
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                        fullWidth
                        className={classes.textField}
                        label="Name"
                        placeholder={`Schedule ${scheduleNames.length + 1}`}
                        onChange={handleNameChange}
                        value={scheduleName}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCancel} color={isDarkMode() ? 'secondary' : 'primary'}>
                        Cancel
                    </Button>
                    <Button
                        onClick={submitName}
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
