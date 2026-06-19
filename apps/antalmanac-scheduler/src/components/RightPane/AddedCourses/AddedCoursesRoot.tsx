import { AddedCourses } from '$components/RightPane/AddedCourses/AddedCourses';
import { FallbackSchedule } from '$components/RightPane/AddedCourses/FallbackSchedule';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useFallbackStore } from '$stores/FallbackStore';
import { Box } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

export function AddedCoursesRoot() {
    const fallbackMode = useFallbackStore((state) => state.fallbackMode);
    const postHog = usePostHog();

    useEffect(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.addedClasses,
            action: analyticsEnum.addedClasses.actions.OPEN,
        });
    }, [postHog]);

    return <Box>{fallbackMode ? <FallbackSchedule /> : <AddedCourses />}</Box>;
}
