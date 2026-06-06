import type { CourseSearchParams } from '$components/RightPane/CoursePane/SearchParams/types';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { BLUE } from '$src/globals';
import { useThemeStore } from '$stores/SettingsStore';
import { Alert, Box, Link } from '@mui/material';
import Image from 'next/image';

interface NoResultsProps {
    formData: CourseSearchParams;
}

export function NoResults({ formData }: NoResultsProps) {
    const isDark = useThemeStore((store) => store.isDark);

    const multiSearchData = RightPaneStore.getMultiSearchData();
    const deptValue = formData.deptValue.replace(' ', '').toUpperCase() || null;
    const courseNumber = formData.courseNumber.replace(/\s+/g, '').toUpperCase() || null;
    const courseId = deptValue && courseNumber ? `${deptValue}${courseNumber}` : null;

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
            }}
        >
            {courseId && multiSearchData.length === 0 ? (
                <Link
                    href={`https://antalmanac.com/planner/course/${encodeURIComponent(courseId)}`}
                    target="_blank"
                    sx={{ width: '100%' }}
                >
                    <Alert
                        variant="filled"
                        severity="info"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 14,
                            backgroundColor: BLUE,
                            color: 'white',
                        }}
                    >
                        <span>
                            Search for{' '}
                            <span style={{ textDecoration: 'underline' }}>
                                {deptValue} {courseNumber}
                            </span>{' '}
                            on AntAlmanac Planner!
                        </span>
                    </Alert>
                </Link>
            ) : null}

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
