import React, { useState } from 'react';
import { Tooltip, Button, Dialog, DialogTitle, DialogActions, DialogContent, TextField } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import { addSchedule } from '../../actions/AppStoreActions';
import { isDarkMode } from '../../helpers';

const styles = () => ({
    addButton: {
        padding: '3px 7px',
        minWidth: 0,
        minHeight: 0,
    },
    textField: {
        marginBottom: '25px',
    },
});

const AddScheduleDialog = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scheduleName, setScheduleName] = useState('');

    const handleOpen = () => {
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        setScheduleName('');
    };

    const handleNameChange = (event) => {
        setScheduleName(event.target.value);
    };

    const handleAdd = () => {
        addSchedule(scheduleName);
        setIsOpen(false);
        setScheduleName('');
    };

    return (
        <>
            <Tooltip title="Add a Schedule">
                <Button className={props.classes.addButton} variant="outlined" onClick={handleOpen}>
                    <Add />
                </Button>
            </Tooltip>
            <Dialog open={isOpen} fullWidth>
                <DialogTitle>Add a New Schedule</DialogTitle>
                <DialogContent>
                    <TextField
                        className={props.classes.textField}
                        label="Name"
                        placeholder="Schedule 2"
                        onChange={handleNameChange}
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color={isDarkMode() ? 'white' : 'primary'}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAdd}
                        variant="contained"
                        color="primary"
                        disabled={scheduleName.trim() === ''}
                    >
                        Add Schedule
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default withStyles(styles)(AddScheduleDialog);
