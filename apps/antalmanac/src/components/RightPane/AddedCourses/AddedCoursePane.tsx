import { AddedSectionsGrid } from '$components/RightPane/AddedCourses/AddedSectionsGrid';
import { FallbackSchedule } from '$components/RightPane/AddedCourses/FallbackSchedule';
import { useFallbackStore } from '$stores/FallbackStore';
import { Box } from '@mui/material';

export type { CourseWithTerm } from '$components/RightPane/AddedCourses/AddedSectionsGrid';

export function AddedCoursePane() {
    const fallbackMode = useFallbackStore((state) => state.fallbackMode);

    return <Box>{fallbackMode ? <FallbackSchedule /> : <AddedSectionsGrid />}</Box>;
}
