import { Box } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

import { AddedSectionTable } from '$components/RightPane/AddedCoursePane/AddedSectionTable';
import { FallbackSchedule } from '$components/RightPane/AddedCoursePane/FallbackSchedule';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useFallbackStore } from '$stores/FallbackStore';

export function AddedCoursePane() {
    const { fallback } = useFallbackStore();
    const postHog = usePostHog();

    useEffect(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.addedClasses,
            action: analyticsEnum.addedClasses.actions.OPEN,
        });
    }, [postHog]);

    return <Box>{fallback ? <FallbackSchedule /> : <AddedSectionTable />}</Box>;
}
