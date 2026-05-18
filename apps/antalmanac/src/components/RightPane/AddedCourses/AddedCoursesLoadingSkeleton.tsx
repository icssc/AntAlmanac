import type { CourseWithTerm } from '$components/RightPane/AddedCourses/AddedSectionsGrid';
import SectionTable from '$components/RightPane/SectionTable/SectionTable';
import analyticsEnum from '$lib/analytics/analytics';
import { getLocalStorageAddedCoursesSkeletonBlueprint } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { Box, Skeleton } from '@mui/material';

function readCachedCourses(): CourseWithTerm[] | null {
    const raw = getLocalStorageAddedCoursesSkeletonBlueprint();
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed as CourseWithTerm[];
        }
    } catch {
        // ignore malformed data
    }
    return null;
}

/**
 * Renders the previous schedule's `SectionTable`s wrapped in MUI's
 * children-aware `Skeleton`. The hidden table inside contributes layout, so
 * each Skeleton block sizes exactly to the real table — no height tracking,
 * no per-button replicas, no responsive logic to keep in sync.
 */
export function AddedCoursesLoadingSkeleton() {
    const courses = readCachedCourses();

    if (!courses) return null;

    const scheduleNames = AppStore.getScheduleNames();

    return (
        <Box display="flex" flexDirection="column" gap={1}>
            {courses.map((course) => (
                <Skeleton key={course.id} variant="rounded" component="div">
                    <SectionTable
                        sortable
                        courseDetails={course}
                        term={course.term}
                        allowHighlight={false}
                        analyticsCategory={analyticsEnum.addedClasses}
                        scheduleNames={scheduleNames}
                    />
                </Skeleton>
            ))}
        </Box>
    );
}
