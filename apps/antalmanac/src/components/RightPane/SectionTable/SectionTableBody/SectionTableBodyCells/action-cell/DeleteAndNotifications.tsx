import { ArrowDropDown, Delete } from '@mui/icons-material';
import { useTheme, useMediaQuery, Box, IconButton, CircularProgress, Popover } from '@mui/material';
import { AASection, Course, CourseDetails } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { memo, useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { deleteCourse } from '$actions/AppStoreActions';
import ColorPicker from '$components/ColorPicker';
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
    const postHog = usePostHog();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = useCallback(() => {
        deleteCourse(props.section.sectionCode, props.term, AppStore.getCurrentScheduleIndex());

        logAnalytics(postHog, {
            category: analyticsEnum.addedClasses,
            action: analyticsEnum.addedClasses.actions.DELETE_COURSE,
        });
    }, [postHog, props.term, props.section.sectionCode]);

    const notifications = initialized ? (
        <NotificationsMenu {...props} />
    ) : (
        <IconButton disabled>
            <CircularProgress size={15} />
        </IconButton>
    );

    const colorPicker = (
        <ColorPicker
            color={props.section.color}
            isCustomEvent={false}
            sectionCode={props.section.sectionCode}
            term={props.term}
            analyticsCategory={analyticsEnum.addedClasses}
        />
    );

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <IconButton onClick={handleClick}>
                <Delete fontSize="small" />
            </IconButton>

            {isMobile ? (
                <>
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                        <ArrowDropDown fontSize="small" />
                    </IconButton>
                    <Popover
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 0.5 }}>
                            {notifications}
                            {colorPicker}
                        </Box>
                    </Popover>
                </>
            ) : (
                <>
                    {notifications}
                    {colorPicker}
                </>
            )}
        </Box>
    );
});

DeleteAndNotifications.displayName = 'DeleteAndNotifications';
