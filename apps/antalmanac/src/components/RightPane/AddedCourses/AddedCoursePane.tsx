import { updateScheduleNote } from '$actions/AppStoreActions';
import { ClearScheduleButton } from '$components/buttons/Clear';
import { CopyScheduleButton } from '$components/buttons/Copy';
import { SelectSchedulePopover } from '$components/Calendar/Toolbar/ScheduleSelect/ScheduleSelect';
import { EmptyState } from '$components/EmptyState';
import { CustomEventDetailView } from '$components/RightPane/AddedCourses/CustomEventDetailView';
import { getMissingSections } from '$components/RightPane/AddedCourses/getMissingSections';
import { NotificationsDialog } from '$components/RightPane/AddedCourses/Notifications/NotificationsDialog';
import { ColumnToggleDropdown } from '$components/RightPane/CoursePane/CoursePaneButtonRow';
import SectionTable from '$components/RightPane/SectionTable/SectionTable';
import { useIsMobile } from '$hooks/useIsMobile';
import { AddedSectionsGrid } from '$components/RightPane/AddedCourses/AddedSectionsGrid';
import { FallbackSchedule } from '$components/RightPane/AddedCourses/FallbackSchedule';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useFallbackStore } from '$stores/FallbackStore';
import { Box } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

export type { CourseWithTerm } from '$components/RightPane/AddedCourses/AddedSectionsGrid';

export function AddedCoursePane() {
    const fallbackMode = useFallbackStore((state) => state.fallbackMode);
    const postHog = usePostHog();

    useEffect(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.addedClasses,
            action: analyticsEnum.addedClasses.actions.OPEN,
        });
    }, [postHog]);

    return <Box>{fallbackMode ? <FallbackSchedule /> : <AddedSectionsGrid />}</Box>;
}
