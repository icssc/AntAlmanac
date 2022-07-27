import React, { useState } from 'react';
import { Tooltip, Button, Menu } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Edit } from '@material-ui/icons';
import ScheduleNameDialog from './ScheduleNameDialog';
import DeleteScheduleDialog from './DeleteScheduleDialog';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';

const styles = () => ({
    editButton: {
        padding: '3px 7px',
        minWidth: 0,
        minHeight: 0,
    },
});

interface EditScheduleProps {
    classes: ClassNameMap
    scheduleNames: string[]
    scheduleIndex: number
}

const EditSchedule = (props: EditScheduleProps) => {
    const { classes, scheduleNames, scheduleIndex } = props;
    const [anchorEl, setAnchorEl] = useState<HTMLElement|null>(null);

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
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
                    scheduleNames={scheduleNames}
                    scheduleRenameIndex={scheduleIndex}
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
