import { PlannerCourseLinkBanner } from '$components/RightPane/CoursePane/CourseRenderPane/PlannerCourseLinkBanner';
import type { CourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/types';
import { useThemeStore } from '$stores/SettingsStore';
import { Box } from '@mui/material';
import Image from 'next/image';

interface NoResultsProps {
    formData: CourseSearchParams;
}

export function NoResults({ formData }: NoResultsProps) {
    const isDark = useThemeStore((store) => store.isDark);

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
            }}
        >
            <PlannerCourseLinkBanner deptValue={formData.deptValue} courseNumber={formData.courseNumber} />

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
