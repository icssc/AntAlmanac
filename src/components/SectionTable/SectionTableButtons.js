import React from 'react';
import ColorPicker from '../App/ColorPicker';
import { IconButton, Menu, MenuItem, TableCell, useMediaQuery } from '@material-ui/core';
import { deleteCourse } from '../../actions/AppStoreActions';
import AppStore from '../../stores/AppStore';
import { Delete, Add, ArrowDropDown } from '@material-ui/icons';
import { addCourse, openSnackbar } from '../../actions/AppStoreActions';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';

import { withStyles } from '@material-ui/core/styles';
import ReactGA from 'react-ga';

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'space-evenly',
    },
};

export const ColorAndDelete = withStyles(styles)((props) => {
    const { sectionCode, color, classes, term } = props;
    const isMobileScreen = useMediaQuery('(max-width: 750px)');

    return (
        <TableCell padding="none">
            <div className={classes.container} style={isMobileScreen ? { flexDirection: 'column' } : {}}>
                <IconButton
                    onClick={() => {
                        deleteCourse(sectionCode, AppStore.getCurrentScheduleIndex(), term);
                        ReactGA.event({
                            category: 'antalmanac-rewrite',
                            action: 'Click Delete Course',
                            label: 'Added Course pane',
                        });
                    }}
                >
                    <Delete fontSize="small" />
                </IconButton>
                <ColorPicker color={color} isCustomEvent={false} sectionCode={sectionCode} term={term} />
            </div>
        </TableCell>
    );
});

export const ScheduleAddCell = withStyles(styles)((props) => {
    const { classes, section, courseDetails, term } = props;
    const popupState = usePopupState({ variant: 'popover' });
    const isMobileScreen = useMediaQuery('(max-width: 750px)');

    const closeAndAddCourse = (scheduleIndex) => {
        popupState.close();
        for (const meeting of section.meetings) {
            if (meeting.time === 'TBA') {
                openSnackbar('success', 'Online/TBA class added');
                // See Added Classes."
                break;
            }
        }

        if (scheduleIndex !== -1) {
            section.color = addCourse(section, courseDetails, term, scheduleIndex);
        }
    };

    return (
        <TableCell padding="none">
            <div className={classes.container} style={isMobileScreen ? { flexDirection: 'column' } : {}}>
                <IconButton onClick={() => closeAndAddCourse(AppStore.getCurrentScheduleIndex())}>
                    <Add fontSize="small" />
                </IconButton>
                <IconButton {...bindTrigger(popupState)}>
                    <ArrowDropDown fontSize="small" />
                </IconButton>
                <Menu {...bindMenu(popupState)} onClose={() => closeAndAddCourse(-1)}>
                    <MenuItem onClick={() => closeAndAddCourse(0)}>Add to schedule 1</MenuItem>
                    <MenuItem onClick={() => closeAndAddCourse(1)}>Add to schedule 2</MenuItem>
                    <MenuItem onClick={() => closeAndAddCourse(2)}>Add to schedule 3</MenuItem>
                    <MenuItem onClick={() => closeAndAddCourse(3)}>Add to schedule 4</MenuItem>
                    <MenuItem onClick={() => closeAndAddCourse(4)}>Add to all</MenuItem>
                </Menu>
            </div>
        </TableCell>
    );
});
