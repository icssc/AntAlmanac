import React from 'react';
import ColorPicker from '../../ColorPicker';
import { IconButton, Menu, MenuItem, TableCell, useMediaQuery } from '@material-ui/core';
import { deleteCourse, addCourse, openSnackbar } from '../../../actions/AppStoreActions';
import AppStore from '../../../stores/AppStore';
import { Delete, Add, ArrowDropDown } from '@material-ui/icons';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';

import { withStyles } from '@material-ui/core/styles';
import ReactGA from 'react-ga';
import analyticsEnum, { logAnalytics } from '../../../analytics';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { AASection, AACourse } from '../../../peterportal.types';
import { CourseDetails } from '../../../helpers';

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'space-evenly',
    },
};

interface ColorAndDeleteProps {
    sectionCode: string;
    color: string;
    classes: ClassNameMap;
    term: string;
}

export const ColorAndDelete = withStyles(styles)((props: ColorAndDeleteProps) => {
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
                        logAnalytics({
                            category: analyticsEnum.addedClasses.title,
                            action: analyticsEnum.addedClasses.actions.DELETE_COURSE,
                        });
                    }}
                >
                    <Delete fontSize="small" />
                </IconButton>
                <ColorPicker
                    color={color}
                    isCustomEvent={false}
                    sectionCode={sectionCode}
                    term={term}
                    analyticsCategory={analyticsEnum.addedClasses.title}
                />
            </div>
        </TableCell>
    );
});

interface ScheduleAddCellProps {
    classes: ClassNameMap;
    section: AASection;
    courseDetails: CourseDetails;
    term: string;
    scheduleNames: string[];
}

export const ScheduleAddCell = withStyles(styles)((props: ScheduleAddCellProps) => {
    const { classes, section, courseDetails, term, scheduleNames } = props;
    const popupState = usePopupState({ popupId: 'SectionTableAddCellPopup', variant: 'popover' });
    const isMobileScreen = useMediaQuery('(max-width: 750px)');

    const closeAndAddCourse = (scheduleIndex: number, specificSchedule?: boolean) => {
        popupState.close();
        for (const meeting of section.meetings) {
            if (meeting.time === 'TBA') {
                // @ts-ignore
                openSnackbar('success', 'Online/TBA class added');
                // See Added Classes."
                break;
            }
        }

        if (scheduleIndex !== -1) {
            if (specificSchedule) {
                logAnalytics({
                    category: analyticsEnum.classSearch.title,
                    action: analyticsEnum.classSearch.actions.ADD_SPECIFIC,
                });
            }
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
                    {scheduleNames.map((name, index) => (
                        <MenuItem key={index} onClick={() => closeAndAddCourse(index, true)}>
                            Add to {name}
                        </MenuItem>
                    ))}
                    <MenuItem onClick={() => closeAndAddCourse(scheduleNames.length, true)}>
                        Add to All Schedules
                    </MenuItem>
                </Menu>
            </div>
        </TableCell>
    );
});
