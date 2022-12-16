import React, { useState } from 'react';
import { Tooltip, Button, Menu } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Edit } from '@mui/icons-material';
import ScheduleNameDialog from './ScheduleNameDialog';
import DeleteScheduleDialog from './DeleteScheduleDialog';

const styles = () => ({
    editButton: {
        padding: '3px 7px',
        minWidth: 0,
        minHeight: 0,
    },
});

const EditSchedule = (props) => {
    const { classes, scheduleNames, scheduleIndex } = props;
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title="Edit schedule">
                <Button className={classes.editButton} variant="outlined" onClick={handleClick}>
                    <Edit />
                </Button>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <ScheduleNameDialog
                    rename={true}
                    scheduleNames={scheduleNames}
                    scheduleIndex={scheduleIndex}
                    onClose={handleClose}
                />
                <DeleteScheduleDialog
                    scheduleNames={scheduleNames}
                    scheduleIndex={scheduleIndex}
                    onClose={handleClose}
                />
            </Menu>
        </>
    );
};

export default withStyles(styles)(EditSchedule);
