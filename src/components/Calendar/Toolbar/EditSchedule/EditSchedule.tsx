import { Edit } from '@mui/icons-material';
import { Button, Menu,Tooltip } from '@mui/material';
import { withStyles } from '@mui/styles';
import { ClassNameMap } from '@mui/styles/withStyles';
import React, { useState } from 'react';

import DeleteScheduleDialog from './DeleteScheduleDialog';
import ScheduleNameDialog from './ScheduleNameDialog';

const styles = () => ({
    editButton: {
        padding: '3px 7px',
        minWidth: 0,
        minHeight: 0,
    },
});

interface EditScheduleProps {
    classes: ClassNameMap;
    scheduleNames: string[];
    scheduleIndex: number;
}

const EditSchedule = (props: EditScheduleProps) => {
    const { classes, scheduleNames, scheduleIndex } = props;
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Tooltip title="Edit schedule">
                <Button className={classes.editButton} variant="outlined" onClick={handleClick} color="inherit">
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
