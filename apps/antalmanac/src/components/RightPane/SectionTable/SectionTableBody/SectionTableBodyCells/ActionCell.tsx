import { Add, ArrowDropDown, Delete } from '@mui/icons-material';
import { Box, IconButton, Menu, MenuItem, Tooltip, useMediaQuery } from '@mui/material';
import { AASection, CourseDetails } from '@packages/antalmanac-types';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { usePostHog } from 'posthog-js/react';

import { addCourse, deleteCourse, openSnackbar } from '$actions/AppStoreActions';
import ColorPicker from '$components/ColorPicker';
import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { MOBILE_BREAKPOINT } from '$src/globals';
import AppStore from '$stores/AppStore';

/**
 * Props received by components that perform actions on a specified section.
 */
interface ActionProps {
    /**
     * The section to perform actions on.
     */
    section: AASection;

    /**
     * The term that the section occurs in.
     */
    term: string;

    /**
     * Additional details about the course that the section occurs in.
     */
    courseDetails: CourseDetails;

    /**
     * The names of the schedules that the section can be added to.
     */
    scheduleNames: string[];

    /**
     * Whether the section has a schedule conflict with another event in the calendar.
     */
    scheduleConflict: boolean;
}

/**
 * Sections added to a schedule, can be recolored or deleted.
 */
export function ColorAndDelete(props: ActionProps) {
    const { section, term } = props;

    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}`);

    const flexDirection = isMobileScreen ? 'column' : undefined;

    const postHog = usePostHog();

    const handleClick = () => {
        deleteCourse(section.sectionCode, term, AppStore.getCurrentScheduleIndex());

        logAnalytics(postHog, {
            category: analyticsEnum.addedClasses,
            action: analyticsEnum.addedClasses.actions.DELETE_COURSE,
        });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: flexDirection,
                justifyContent: 'space-evenly',
                alignItems: 'center',
            }}
        >
            <IconButton onClick={handleClick}>
                <Delete fontSize="small" />
            </IconButton>

            <ColorPicker
                key={AppStore.getCurrentScheduleIndex()}
                color={section.color}
                isCustomEvent={false}
                sectionCode={section.sectionCode}
                term={term}
                analyticsCategory={analyticsEnum.addedClasses}
            />
        </Box>
    );
}

/**
 * Copying a specific class's link will only copy its course code.
 * If there is random value let in the url, it will interfere with the generated url.
 */
const fieldsToReset = ['courseCode', 'courseNumber', 'deptValue', 'ge', 'term'];

/**
 * Sections that have not been added to a schedule can be added to a schedule.
 */
export function ScheduleAddCell(props: ActionProps) {
    const { section, courseDetails, term, scheduleNames, scheduleConflict } = props;

    const popupState = usePopupState({ popupId: 'SectionTableAddCellPopup', variant: 'popover' });
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}`);

    const flexDirection = isMobileScreen ? 'column' : undefined;

    const postHog = usePostHog();

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
            logAnalytics(postHog, {
                category: analyticsEnum.classSearch,
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
        <Box
            sx={{
                display: 'flex',
                flexDirection: flexDirection,
                justifyContent: 'space-evenly',
                alignItems: 'center',
            }}
        >
            {scheduleConflict ? (
                <Tooltip title="This course overlaps with another event in your calendar!" arrow disableInteractive>
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
        </Box>
    );
}

export interface ActionCellProps extends Omit<ActionProps, 'classes'> {
    /**
     * Whether the section has been added.
     */
    addedCourse: boolean;
}

/**
 * Given a section and schedule information, provides appropriate set of actions.
 */
export function ActionCell(props: ActionCellProps) {
    return (
        <TableBodyCellContainer>
            {props.addedCourse ? <ColorAndDelete {...props} /> : <ScheduleAddCell {...props} />}
        </TableBodyCellContainer>
    );
}
