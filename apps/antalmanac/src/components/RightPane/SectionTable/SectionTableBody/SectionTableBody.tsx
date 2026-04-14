import { TableBody } from '@mui/material';
import { AACourse, AASection } from '@packages/antalmanac-types';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { SectionTableBodyRow } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyRow';
import { AnalyticsCategory } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { useSectionFilterStore, type SortOption } from '$stores/SectionFilterStore';
import { normalizeTime, parseDaysString } from '$stores/calendarizeHelpers';

function getMeetingStartMinutes(section: AASection): number {
    const meeting = section.meetings[0];
    if (!meeting || meeting.timeIsTBA) return Infinity;
    return meeting.startTime.hour * 60 + meeting.startTime.minute;
}

function getMeetingDays(section: AASection): string {
    const meeting = section.meetings[0];
    if (!meeting || meeting.timeIsTBA) return '';
    return meeting.days;
}

const STATUS_ORDER: Record<string, number> = { OPEN: 0, NewOnly: 1, Waitl: 2, FULL: 3, '': 4 };

function sortSections(sections: AASection[], sortBy: SortOption): AASection[] {
    if (sortBy === 'default') return sections;

    return [...sections].sort((a, b) => {
        switch (sortBy) {
            case 'status':
                return (STATUS_ORDER[a.status] ?? 4) - (STATUS_ORDER[b.status] ?? 4);

            case 'time_asc':
                return getMeetingStartMinutes(a) - getMeetingStartMinutes(b);

            case 'days_mwf': {
                const aMatch = /[MWF]/.test(getMeetingDays(a)) ? 0 : 1;
                const bMatch = /[MWF]/.test(getMeetingDays(b)) ? 0 : 1;
                return aMatch - bMatch;
            }

            case 'days_tuth': {
                const aMatch = /Tu|Th/.test(getMeetingDays(a)) ? 0 : 1;
                const bMatch = /Tu|Th/.test(getMeetingDays(b)) ? 0 : 1;
                return aMatch - bMatch;
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
    const { sortBy } = useSectionFilterStore();
    const [calendarEvents, setCalendarEvents] = useState(() => AppStore.getCourseEventsInCalendar());

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
        () => sortSections(courseDetails.sections, sortBy),
        [courseDetails.sections, sortBy]
    );

    return (
        <TableBody>
            {sortedSections.map((section) => {
                const conflict = scheduleConflict(section);

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
                    />
                );
            })}
        </TableBody>
    );
}
