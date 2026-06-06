import type { CourseWithTerm } from '$components/RightPane/AddedCourses/AddedCourses';
import { CustomEventDetailView } from '$components/RightPane/AddedCourses/CustomEventDetailView';
import SectionTable from '$components/RightPane/SectionTable/SectionTable';
import analyticsEnum from '$lib/analytics/analytics';
import { getLocalStorageAddedCoursesSkeletonBlueprint } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { Box, Typography } from '@mui/material';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';
import { Component, type ReactNode, useEffect, useState } from 'react';

/**
 * Renders nothing if the wrapped tree throws. The skeleton renders real
 * SectionTables / CustomEventDetailViews using cached schedule data, and any
 * shape drift in that cache (e.g. fields added or removed in future updates)
 * shouldn't break the page.
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

interface CachedBlueprint {
    courses: CourseWithTerm[];
    customEvents: RepeatingCustomEvent[];
}

/** Legacy skeleton caches used `id` before `courseId` was required on CourseWithTerm. */
type CachedCourseShape = Partial<CourseWithTerm> & { id?: string };

function normalizeCachedCourse(value: unknown): CourseWithTerm | null {
    if (typeof value !== 'object' || value === null) return null;
    const course = value as CachedCourseShape;
    const courseId = course.courseId ?? course.id;
    if (
        typeof courseId !== 'string' ||
        typeof course.deptCode !== 'string' ||
        typeof course.courseNumber !== 'string' ||
        typeof course.courseTitle !== 'string' ||
        !Array.isArray(course.sections) ||
        typeof course.term !== 'object' ||
        course.term === null
    ) {
        return null;
    }

    return { ...course, courseId, id: courseId } as CourseWithTerm;
}

function isValidCachedCustomEvent(value: unknown): value is RepeatingCustomEvent {
    if (typeof value !== 'object' || value === null) return false;
    const ev = value as Partial<RepeatingCustomEvent>;
    return (
        typeof ev.title === 'string' &&
        typeof ev.start === 'string' &&
        typeof ev.end === 'string' &&
        Array.isArray(ev.days) &&
        (typeof ev.customEventID === 'string' || typeof ev.customEventID === 'number')
    );
}

function readCachedBlueprint(): CachedBlueprint | null {
    const raw = getLocalStorageAddedCoursesSkeletonBlueprint();
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);

        // Legacy format: just an array of courses.
        if (Array.isArray(parsed)) {
            const courses = (parsed as unknown[])
                .map(normalizeCachedCourse)
                .filter((c): c is CourseWithTerm => c !== null);
            return courses.length > 0 ? { courses, customEvents: [] } : null;
        }

        // Current format: { courses, customEvents }.
        if (parsed && typeof parsed === 'object') {
            const courses = Array.isArray(parsed.courses)
                ? (parsed.courses as unknown[])
                      .map(normalizeCachedCourse)
                      .filter((c): c is CourseWithTerm => c !== null)
                : [];
            const customEvents = Array.isArray(parsed.customEvents)
                ? parsed.customEvents.filter(isValidCachedCustomEvent)
                : [];
            if (courses.length === 0 && customEvents.length === 0) return null;
            return { courses, customEvents };
        }
    } catch {
        // ignore malformed data
    }
    return null;
}

/**
 * Renders the previous schedule's `SectionTable`s and `CustomEventDetailView`s
 * with `skeleton={true}`, which wraps each interactive element in its own MUI
 * children-aware `Skeleton`. The hidden real children inside each Skeleton
 * contribute layout, so every placeholder sizes exactly to the real element
 * it will be replaced by.
 */
export function AddedCoursesLoadingSkeleton() {
    // Read once on mount — the cache doesn't change while the skeleton is
    // visible (the real schedule reload is what eventually unmounts us).
    const [blueprint] = useState(readCachedBlueprint);
    const [scheduleNames, setScheduleNames] = useState(() => AppStore.getScheduleNames());

    useEffect(() => {
        const handler = () => setScheduleNames([...AppStore.getScheduleNames()]);
        AppStore.on('scheduleNamesChange', handler);
        return () => {
            AppStore.off('scheduleNamesChange', handler);
        };
    }, []);

    if (!blueprint) return null;

    return (
        <SkeletonErrorBoundary>
            <Box display="flex" flexDirection="column" gap={1}>
                {blueprint.courses.map((course) => (
                    <SectionTable
                        key={course.id}
                        skeleton
                        sortable
                        courseDetails={course}
                        term={course.term}
                        allowHighlight={false}
                        analyticsCategory={analyticsEnum.addedClasses}
                        scheduleNames={scheduleNames}
                    />
                ))}

                {blueprint.customEvents.length > 0 && (
                    <>
                        <Typography variant="h6">Custom Events</Typography>
                        <Box display="flex" flexDirection="column" gap={1}>
                            {blueprint.customEvents.map((customEvent) => (
                                <CustomEventDetailView
                                    key={customEvent.customEventID}
                                    skeleton
                                    customEvent={customEvent}
                                    scheduleNames={scheduleNames}
                                />
                            ))}
                        </Box>
                    </>
                )}
            </Box>
        </SkeletonErrorBoundary>
    );
}
