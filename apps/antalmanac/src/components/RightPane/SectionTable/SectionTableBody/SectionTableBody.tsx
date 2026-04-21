import { TableBody } from '@mui/material';
import { AACourse, AASection } from '@packages/antalmanac-types';
import { useCallback, useEffect, useState, useMemo } from 'react';

import { getGpaData } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/GpaCell';
import { SectionTableBodyRow } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyRow';
import { AnalyticsCategory } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { type SortOption, useSectionFilterStore } from '$stores/SectionFilterStore';
import { normalizeTime, parseDaysString } from '$stores/calendarizeHelpers';

export type GpaEntry = { gpa: string; instructor: string };
export type GpaMap = Map<string, GpaEntry>;

function getMeetingStartMinutes(section: AASection): number {
    const meeting = section.meetings[0];
    if (!meeting || meeting.timeIsTBA) return Infinity;
    return meeting.startTime.hour * 60 + meeting.startTime.minute;
}

const STATUS_ORDER: Record<string, number> = { OPEN: 0, NewOnly: 1, Waitl: 2, FULL: 3, '': 4 };

function sortSections(sections: AASection[], sortBy: SortOption, gpaMap: GpaMap): AASection[] {
    if (sortBy === 'default') return sections;

    return [...sections].sort((a, b) => {
        switch (sortBy) {
            case 'status':
                return (STATUS_ORDER[a.status] ?? 4) - (STATUS_ORDER[b.status] ?? 4);

            case 'time_asc':
                return getMeetingStartMinutes(a) - getMeetingStartMinutes(b);

            case 'gpa_descending': {
                const aGpa = parseFloat(gpaMap.get(a.sectionCode)?.gpa ?? '');
                const bGpa = parseFloat(gpaMap.get(b.sectionCode)?.gpa ?? '');
                const aValue = Number.isNaN(aGpa) ? -Infinity : aGpa;
                const bValue = Number.isNaN(bGpa) ? -Infinity : bGpa;
                return bValue - aValue;
            }

            default:
                return 0;
        }
    });
}

interface SectionTableBodyProps {
    courseDetails: AACourse;
    term: string;
    scheduleNames: string[];
    allowHighlight: boolean;
    analyticsCategory: AnalyticsCategory;
    formattedTime: string | null;
}

export function SectionTableBody({
    courseDetails,
    term,
    scheduleNames,
    allowHighlight,
    analyticsCategory,
    formattedTime,
}: SectionTableBodyProps) {
    const [calendarEvents, setCalendarEvents] = useState(() => AppStore.getCourseEventsInCalendar());
    const [gpaMap, setGpaMap] = useState<GpaMap>(() => new Map());
    const sortBy = useSectionFilterStore((state) => state.sortBy);

    useEffect(() => {
        let cancelled = false;

        Promise.all(
            courseDetails.sections.map(async (section) => {
                const data = await getGpaData(courseDetails.deptCode, courseDetails.courseNumber, section.instructors);
                return [section.sectionCode, data] as const;
            })
        ).then((entries) => {
            if (cancelled) return;
            const next: GpaMap = new Map();
            for (const [code, data] of entries) {
                if (data) next.set(code, data);
            }
            setGpaMap(next);
        });

        return () => {
            cancelled = true;
        };
    }, [courseDetails]);

    /**
     * Additional information about the current section being rendered.
     * i.e. time information, which is compared with the calendar events to find conflicts.
     */
    const parseSectionDetails = useCallback((section: AASection) => {
        return {
            daysOccurring: parseDaysString(section.meetings[0].timeIsTBA ? null : section.meetings[0].days),
            ...normalizeTime(section.meetings[0]),
        };
    }, []);

    /**
     * Determine if the current section conflicts with any of the calendar events.
     */
    const scheduleConflict = useCallback(
        (section: AASection) => {
            const sectionDetails = parseSectionDetails(section);

            // If no calendar events exist, no conflicts can occur.
            if (calendarEvents.length === 0) return false;

            // If the section's time wasn't parseable, don't consider conflicts.
            const { startTime, endTime, daysOccurring } = sectionDetails;
            if (!startTime || !endTime) return false;

            // Check for conflicting events
            return calendarEvents.some((event) => {
                // Check if the event happens on overlapping days
                if (!daysOccurring?.includes(event.start.getDay())) return false;

                const eventStartTime = event.start.toTimeString().slice(0, 5); // HH:mm
                const eventEndTime = event.end.toTimeString().slice(0, 5); // HH:mm

                const happensBefore = endTime <= eventStartTime;
                const happensAfter = startTime >= eventEndTime;

                return !(happensBefore || happensAfter); // Overlaps if neither before nor after
            });
        },
        [calendarEvents, parseSectionDetails]
    );

    const updateCalendarEvents = useCallback(() => {
        setCalendarEvents(AppStore.getCourseEventsInCalendar());
    }, [setCalendarEvents]);

    useEffect(() => {
        AppStore.on('addedCoursesChange', updateCalendarEvents);
        AppStore.on('currentScheduleIndexChange', updateCalendarEvents);

        return () => {
            AppStore.removeListener('addedCoursesChange', updateCalendarEvents);
            AppStore.removeListener('currentScheduleIndexChange', updateCalendarEvents);
        };
    }, [updateCalendarEvents]);

    const sortedSections = useMemo(
        () => sortSections(courseDetails.sections, sortBy, gpaMap),
        [courseDetails.sections, sortBy, gpaMap]
    );

    return (
        <TableBody>
            {sortedSections.map((section) => {
                const conflict = scheduleConflict(section);
                const gpaEntry = gpaMap.get(section.sectionCode);

                return (
                    <SectionTableBodyRow
                        key={section.sectionCode}
                        section={section}
                        courseDetails={courseDetails}
                        term={term}
                        allowHighlight={allowHighlight}
                        scheduleNames={scheduleNames}
                        scheduleConflict={conflict}
                        analyticsCategory={analyticsCategory}
                        formattedTime={formattedTime}
                        gpa={gpaEntry?.gpa}
                        gpaInstructor={gpaEntry?.instructor}
                    />
                );
            })}
        </TableBody>
    );
}
