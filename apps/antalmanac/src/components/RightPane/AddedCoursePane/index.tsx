import { Box } from '@mui/material';

import { AddedSectionTable } from '$components/RightPane/AddedCoursePane/AddedSectionTable';
import { FallbackSchedule } from '$components/RightPane/AddedCoursePane/FallbackSchedule';
import { useFallbackStore } from '$stores/FallbackStore';

export function AddedCoursePane() {
    const { fallback } = useFallbackStore();

    return <Box>{fallback ? <FallbackSchedule /> : <AddedSectionTable />}</Box>;
}
