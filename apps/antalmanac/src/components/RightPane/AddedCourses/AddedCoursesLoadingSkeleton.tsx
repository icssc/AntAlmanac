import type { CourseWithTerm } from '$components/RightPane/AddedCourses/AddedSectionsGrid';
import SectionTable from '$components/RightPane/SectionTable/SectionTable';
import analyticsEnum from '$lib/analytics/analytics';
import { getLocalStorageAddedCoursesSkeletonBlueprint } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { Box, Skeleton } from '@mui/material';
import { Component, type ReactNode } from 'react';

/**
 * Renders nothing if the wrapped tree throws. The skeleton renders the real
 * SectionTable using cached schedule data, and any shape drift in that cache
 * (e.g. fields added or removed in future updates) shouldn't break the page.
 */
class SkeletonErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        return this.state.hasError ? null : this.props.children;
    }
}

function isValidCachedCourse(value: unknown): value is CourseWithTerm {
    if (typeof value !== 'object' || value === null) return false;
    const course = value as Partial<CourseWithTerm>;
    return (
        typeof course.id === 'string' &&
        typeof course.deptCode === 'string' &&
        typeof course.courseNumber === 'string' &&
        typeof course.courseTitle === 'string' &&
        Array.isArray(course.sections) &&
        typeof course.term === 'object' &&
        course.term !== null
    );
}

function readCachedCourses(): CourseWithTerm[] | null {
    const raw = getLocalStorageAddedCoursesSkeletonBlueprint();
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isValidCachedCourse)) {
            return parsed;
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
        <SkeletonErrorBoundary>
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
        </SkeletonErrorBoundary>
    );
}
