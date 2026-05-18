import { AddedSectionsGrid } from '$components/RightPane/AddedCourses/AddedSectionsGrid';
import { FallbackSchedule } from '$components/RightPane/AddedCourses/FallbackSchedule';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useFallbackStore } from '$stores/FallbackStore';
import { Box } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

export type { CourseWithTerm } from '$components/RightPane/AddedCourses/AddedSectionsGrid';

export function AddedCoursePane() {
    const fallbackMode = useFallbackStore(useShallow((state) => state.fallbackMode));
    const postHog = usePostHog();

    useEffect(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.addedClasses,
            action: analyticsEnum.addedClasses.actions.OPEN,
        });
    }, [postHog]);

    return <Box>{fallbackMode ? <FallbackSchedule /> : <AddedSectionsGrid />}</Box>;
}
