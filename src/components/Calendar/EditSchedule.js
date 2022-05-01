import React, { useState } from 'react';
import { Tooltip, Button, Menu } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Edit } from '@material-ui/icons';
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
                <Button className={props.classes.editButton} variant="outlined" onClick={handleClick}>
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
                    scheduleNames={props.scheduleNames}
                    scheduleIndex={props.scheduleIndex}
                    onClose={handleClose}
                />
                <DeleteScheduleDialog
                    scheduleNames={props.scheduleNames}
                    scheduleIndex={props.scheduleIndex}
                    onClose={handleClose}
                />
            </Menu>
        </>
    );
};

export default withStyles(styles)(EditSchedule);
