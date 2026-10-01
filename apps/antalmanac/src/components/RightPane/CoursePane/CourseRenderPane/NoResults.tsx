import { CourseRenamedBanner } from '$components/RightPane/CoursePane/CourseRenderPane/CourseRenamedBanner';
import { PlannerCourseLinkBanner } from '$components/RightPane/CoursePane/CourseRenderPane/PlannerCourseLinkBanner';
import type { CourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/types';
import { useIsDarkMode } from '$hooks/useIsDarkMode';
import { Box } from '@mui/material';
import Image from 'next/image';

interface NoResultsProps {
    formData: CourseSearchParams;
}

export function NoResults({ formData }: NoResultsProps) {
    const isDark = useIsDarkMode();

    const courseNumber = formData.courseNumber.trim();

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                gap: 1,
            }}
        >
            <PlannerCourseLinkBanner deptValue={formData.deptValue} courseNumber={courseNumber} />
            <CourseRenamedBanner deptValue={formData.deptValue} courseNumber={courseNumber} />

            <Image
                src={isDark ? '/course-search/dark-no-results.png' : '/course-search/no-results.png'}
                width={601}
                height={422}
                alt="No Results Found"
                style={{ objectFit: 'contain', width: '80%', height: '80%', pointerEvents: 'none' }}
            />
        </Box>
    );
}
