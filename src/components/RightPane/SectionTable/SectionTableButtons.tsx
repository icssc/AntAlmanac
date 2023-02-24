import { IconButton, Menu, MenuItem, TableCell, useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { Add, ArrowDropDown, Delete } from '@material-ui/icons';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';

import { addCourse, deleteCourse, openSnackbar } from '$actions/AppStoreActions';
import ColorPicker from '$components/ColorPicker';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { CourseDetails } from '$lib/helpers';
import { AASection } from '$lib/peterportal.types';
import AppStore from '$stores/AppStore';

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
                        deleteCourse(sectionCode, term);
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
            const newCourse = addCourse(section, courseDetails, term, scheduleIndex);
            section.color = newCourse.section.color;
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
