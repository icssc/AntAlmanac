import { Add } from '@mui/icons-material';
import { Box, IconButton, Tooltip } from '@mui/material';
import { usePostHog } from 'posthog-js/react';

import { addCourse, openSnackbar } from '$actions/AppStoreActions';
import { ActionCellProps } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/ActionCell';
import { NotificationsMenu } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/NotificationsMenu';
import { useIsMobile } from '$hooks/useIsMobile';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';

/**
 * Sections that have not been added to a schedule can be added to a schedule.
 */
export function ScheduleAddCell({
    section,
    courseDetails,
    term,
    scheduleNames: _scheduleNames,
    scheduleConflict,
}: ActionCellProps) {
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
