import { Delete } from '@mui/icons-material';
import { useTheme, useMediaQuery, Box, IconButton, CircularProgress } from '@mui/material';
import { AASection, Course, CourseDetails } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { deleteCourse } from '$actions/AppStoreActions';
import { NotificationsMenu } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/action-cell/NotificationsMenu';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { Term } from '$lib/termData';
import AppStore from '$stores/AppStore';
import { useNotificationStore } from '$stores/NotificationStore';

interface DeleteAndNotificationsProps {
    courseTitle: Course['title'];
    section: AASection;
    term: Term['shortName'];
    lastUpdated: string;
    lastCodes: string;
    courseDetails: CourseDetails;
}

/**
 * Sections added to a schedule, can be recolored or deleted.
 */
export const DeleteAndNotifications = memo(({ ...props }: DeleteAndNotificationsProps) => {
    const initialized = useNotificationStore(useShallow((state) => state.initialized));
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const flexDirection = isMobile ? 'column' : undefined;
    const postHog = usePostHog();

    const handleClick = useCallback(() => {
        deleteCourse(props.section.sectionCode, props.term, AppStore.getCurrentScheduleIndex());

        logAnalytics(postHog, {
            category: analyticsEnum.addedClasses,
            action: analyticsEnum.addedClasses.actions.DELETE_COURSE,
        });
    }, [postHog, props.term, props.section.sectionCode]);

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
                <NotificationsMenu {...props} />
            ) : (
                <IconButton disabled>
                    <CircularProgress size={15} />
                </IconButton>
            )}
        </Box>
    );
});

DeleteAndNotifications.displayName = 'DeleteAndNotifications';
