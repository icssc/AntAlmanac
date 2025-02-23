import { Add, ArrowDropDown, Delete } from '@mui/icons-material';
import { Box, CircularProgress, IconButton, Menu, MenuItem, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { AASection, CourseDetails } from '@packages/antalmanac-types';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useCallback } from 'react';

import { addCourse, deleteCourse, openSnackbar } from '$actions/AppStoreActions';
import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { NotificationsMenu } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/NotificationsMenu';
import analyticsEnum, { logAnalytics } from '$lib/analytics';
import { MOBILE_BREAKPOINT } from '$src/globals';
import AppStore from '$stores/AppStore';
import { useNotificationStore, type NotificationStatus } from '$stores/NotificationStore';

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

    notificationStatus: NotificationStatus | undefined;
}

/**
 * Sections added to a schedule, can be recolored or deleted.
 */
function DeleteAndNotifications({ section, term, notificationStatus }: ActionProps) {
    const { initialized } = useNotificationStore();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const flexDirection = isMobile ? 'column' : undefined;

    const handleClick = useCallback(() => {
        deleteCourse(section.sectionCode, term, AppStore.getCurrentScheduleIndex());

        logAnalytics({
            category: analyticsEnum.addedClasses.title,
            action: analyticsEnum.addedClasses.actions.DELETE_COURSE,
        });
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: flexDirection,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <IconButton onClick={handleClick}>
                <Delete fontSize="small" />
            </IconButton>

            {initialized ? (
                <NotificationsMenu
                    sectionCode={section.sectionCode}
                    term={term}
                    notificationStatus={notificationStatus}
                />
            ) : (
                <IconButton disabled>
                    <CircularProgress size={15} />
                </IconButton>
            )}
        </Box>
    );
}

/**
 * Copying a specific class's link will only copy its course code.
 * If there is random value let in the url, it will interfere with the generated url.
 */
const fieldsToReset = ['courseCode', 'courseNumber', 'deptLabel', 'deptValue', 'ge', 'term'];

/**
 * Sections that have not been added to a schedule can be added to a schedule.
 */
export function ScheduleAddCell(props: ActionProps) {
    const { section, courseDetails, term, scheduleNames, scheduleConflict } = props;

    const popupState = usePopupState({ popupId: 'SectionTableAddCellPopup', variant: 'popover' });
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}`);

    const flexDirection = isMobileScreen ? 'column' : undefined;

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
        <Box
            sx={{
                display: 'flex',
                flexDirection: flexDirection,
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
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
export function ActionCell({ addedCourse, ...props }: ActionCellProps) {
    return (
        <TableBodyCellContainer sx={{ width: '8%' }}>
            {addedCourse ? <DeleteAndNotifications {...props} /> : <ScheduleAddCell {...props} />}
        </TableBodyCellContainer>
    );
}
