import { IconButton, Menu, MenuItem, TableCell, Tooltip, useMediaQuery } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { Add, ArrowDropDown, Delete } from '@material-ui/icons';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';

import { AASection } from '@packages/antalmanac-types';
import { MOBILE_BREAKPOINT } from '../../../globals';
import { addCourse, deleteCourse, openSnackbar } from '$actions/AppStoreActions';
import ColorPicker from '$components/ColorPicker';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { CourseDetails } from '$lib/helpers';
import AppStore from '$stores/AppStore';

// Reset these params in url becasue when copy a specific class's link, it only copy its course code
// if there is random value let in the url, it will mess up the url copied.
const fieldsToReset = ['courseCode', 'courseNumber', 'deptLabel', 'deptValue', 'GE', 'term'];

const styles = {
    optionsCell: {
        width: '8%',
    },
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
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}`);

    return (
        <TableCell padding="none" className={classes.optionsCell}>
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
                    key={AppStore.getCurrentScheduleIndex()}
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
    scheduleConflict: boolean;
}

export const ScheduleAddCell = withStyles(styles)((props: ScheduleAddCellProps) => {
    const { classes, section, courseDetails, term, scheduleNames, scheduleConflict } = props;
    const popupState = usePopupState({ popupId: 'SectionTableAddCellPopup', variant: 'popover' });
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}`);

    const closeAndAddCourse = (scheduleIndex: number, specificSchedule?: boolean) => {
        popupState.close();
        for (const meeting of section.meetings) {
            if (meeting.timeIsTBA) {
                openSnackbar('success', 'Online/TBA class added');
                // See Added Classes."
                break;
            }
        }

        if (specificSchedule) {
            logAnalytics({
                category: analyticsEnum.classSearch.title,
                action: analyticsEnum.classSearch.actions.ADD_SPECIFIC,
            });
        }
        const newCourse = addCourse(section, courseDetails, term, scheduleIndex);
        section.color = newCourse.section.color;
    };

    const addCourseHandler = () => {
        closeAndAddCourse(scheduleNames.length, true);
    };

    const closeCopyAndAlert = () => {
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);
        fieldsToReset.forEach((field) => urlParam.delete(field));
        urlParam.append('courseCode', String(section.sectionCode));
        const new_url = `${url.origin.toString()}/?${urlParam.toString()}`;
        navigator.clipboard.writeText(new_url.toString()).then(
            () => {
                openSnackbar('success', 'Course Link Copied!');
            },
            () => {
                openSnackbar('error', 'Fail to copy the link!');
            }
        );
        popupState.close();
    };

    return (
        <TableCell padding="none" className={classes.optionsCell}>
            <div className={classes.container} style={isMobileScreen ? { flexDirection: 'column' } : {}}>
                {scheduleConflict ? (
                    <Tooltip title="This course overlaps with another event in your calendar!" arrow>
                        <IconButton onClick={() => closeAndAddCourse(AppStore.getCurrentScheduleIndex())}>
                            <Add fontSize="small" />
                        </IconButton>
                    </Tooltip>
                ) : (
                    <IconButton onClick={() => closeAndAddCourse(AppStore.getCurrentScheduleIndex())}>
                        <Add fontSize="small" />
                    </IconButton>
                )}
                <IconButton {...bindTrigger(popupState)}>
                    <ArrowDropDown fontSize="small" />
                </IconButton>
                <Menu {...bindMenu(popupState)}>
                    {scheduleNames.map((name, index) => (
                        <MenuItem key={index} onClick={() => closeAndAddCourse(index, true)}>
                            Add to {name}
                        </MenuItem>
                    ))}
                    <MenuItem onClick={addCourseHandler}>Add to All Schedules</MenuItem>
                    <MenuItem onClick={closeCopyAndAlert}>Copy Link</MenuItem>
                </Menu>
            </div>
        </TableCell>
    );
});
