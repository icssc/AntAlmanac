import { Add } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';
import { AASection, CourseDetails } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { memo } from 'react';

import { addCourse, openSnackbar } from '$actions/AppStoreActions';
import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { DeleteAndNotifications } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/DeleteAndNotifications';
import { NotificationsMenu } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/NotificationsMenu';
import { useIsMobile } from '$hooks/useIsMobile';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { type NotifyOn } from '$stores/NotificationStore';

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

    notifyOn: NotifyOn | undefined;
    lastUpdated: string;
    lastCodes: string;
}

/**
 * Sections that have not been added to a schedule can be added to a schedule.
 */
export function ScheduleAddCell({
    section,
    courseDetails,
    term,
    scheduleNames: _scheduleNames,
    scheduleConflict,
}: ActionProps) {
    const isMobile = useIsMobile();
    const flexDirection = isMobile ? 'column' : undefined;
    const postHog = usePostHog();

    const closeAndAddCourse = (scheduleIndex: number, specificSchedule?: boolean) => {
        for (const meeting of section.meetings) {
            if (meeting.timeIsTBA) {
                openSnackbar('success', 'Online/TBA class added');
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

            <NotificationsMenu
                section={section}
                term={term}
                courseTitle={courseDetails.courseTitle}
                deptCode={courseDetails.deptCode}
                courseNumber={courseDetails.courseNumber}
            />
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
export const ActionCell = memo(({ ...props }: ActionCellProps) => {
    return (
        <TableBodyCellContainer sx={{ width: '8%' }}>
            {props.addedCourse ? (
                <DeleteAndNotifications {...props} courseTitle={props.courseDetails.courseTitle} />
            ) : (
                <ScheduleAddCell {...props} />
            )}
        </TableBodyCellContainer>
    );
});

ActionCell.displayName = 'ActionCell';
