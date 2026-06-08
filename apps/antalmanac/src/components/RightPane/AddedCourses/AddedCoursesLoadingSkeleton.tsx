import { CustomEventDetailView } from '$components/RightPane/AddedCourses/CustomEventDetailView';
import SectionTable from '$components/RightPane/SectionTable/SectionTable';
import analyticsEnum from '$lib/analytics/analytics';
import { getLocalStorageAddedCoursesSkeletonBlueprint } from '$lib/localStorage';
import AppStore from '$stores/AppStore';
import { scheduleOfferingKey } from '$stores/scheduleHelpers';
import { Box, Typography } from '@mui/material';
import type { AACourseWithTerm, RepeatingCustomEvent } from '@packages/antalmanac-types';
import { Component, type ReactNode, useEffect, useState } from 'react';

/**
 * Renders nothing if the wrapped tree throws. The skeleton renders real
 * SectionTables / CustomEventDetailViews using cached schedule data, and any
 * shape drift in that cache (e.g. fields added or removed in future updates)
 * shouldn't break the page.
 */
class SkeletonErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    override state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    override render() {
        return this.state.hasError ? null : this.props.children;
    }
}

interface CachedBlueprint {
    courses: AACourseWithTerm[];
    customEvents: RepeatingCustomEvent[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isValidCachedCourse(value: unknown): value is AACourseWithTerm {
    if (!isRecord(value)) return false;

    return (
        typeof value.courseId === 'string' &&
        typeof value.deptCode === 'string' &&
        typeof value.courseNumber === 'string' &&
        typeof value.courseTitle === 'string' &&
        Array.isArray(value.sections) &&
        isRecord(value.term)
    );
}

function isValidCachedCustomEvent(value: unknown): value is RepeatingCustomEvent {
    if (!isRecord(value)) return false;

    return (
        typeof value.title === 'string' &&
        typeof value.start === 'string' &&
        typeof value.end === 'string' &&
        Array.isArray(value.days) &&
        (typeof value.customEventID === 'string' || typeof value.customEventID === 'number')
    );
}

function readCachedBlueprint(): CachedBlueprint | null {
    const raw = getLocalStorageAddedCoursesSkeletonBlueprint();
    if (!raw) return null;

    try {
        const parsed: unknown = JSON.parse(raw);
        if (!isRecord(parsed) || !Array.isArray(parsed.courses) || !Array.isArray(parsed.customEvents)) {
            return null;
        }

        const courses = parsed.courses.filter(isValidCachedCourse);
        const customEvents = parsed.customEvents.filter(isValidCachedCustomEvent);
        if (courses.length === 0 && customEvents.length === 0) return null;

        return { courses, customEvents };
    } catch {
        return null;
    }
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
                        key={scheduleOfferingKey(course)}
                        skeleton
                        sortable
                        course={course}
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
