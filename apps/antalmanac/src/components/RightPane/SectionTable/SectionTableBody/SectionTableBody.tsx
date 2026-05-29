import { SectionTableBodyRow } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyRow';
import { AnalyticsCategory } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { normalizeTime, parseDaysString } from '$stores/calendarizeHelpers';
import type { SectionTableColumn } from '$stores/ColumnStore';
import { TableBody } from '@mui/material';
import { AACourse, AASection, AATerm } from '@packages/antalmanac-types';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

interface SectionTableBodyProps {
    courseDetails: AACourse;
    term: AATerm;
    scheduleNames: string[];
    allowHighlight: boolean;
    analyticsCategory: AnalyticsCategory;
    formattedTime: string | null;
    activeColumns: SectionTableColumn[];
}

function hasScheduleConflict(
    section: AASection,
    calendarEvents: ReturnType<typeof AppStore.getCourseEventsInCalendar>
) {
    const daysOccurring = parseDaysString(section.meetings[0].timeIsTBA ? null : section.meetings[0].days);
    const normalizedTime = normalizeTime(section.meetings[0]);

    if (calendarEvents.length === 0 || !normalizedTime) {
        return false;
    }

    const { startTime, endTime } = normalizedTime;

    return calendarEvents.some((event) => {
        if (!daysOccurring?.includes(event.start.getDay())) {
            return false;
        }

        const eventStartTime = event.start.toTimeString().slice(0, 5);
        const eventEndTime = event.end.toTimeString().slice(0, 5);
        const happensBefore = endTime <= eventStartTime;
        const happensAfter = startTime >= eventEndTime;

        return !(happensBefore || happensAfter);
    });
}

export const SectionTableBody = memo(function SectionTableBody({
    courseDetails,
    term,
    scheduleNames,
    allowHighlight,
    analyticsCategory,
    formattedTime,
    activeColumns,
}: SectionTableBodyProps) {
    const [calendarEvents, setCalendarEvents] = useState(() => AppStore.getCourseEventsInCalendar());

    const sectionConflicts = useMemo(() => {
        const conflicts = new Map<string, boolean>();

        for (const section of courseDetails.sections) {
            conflicts.set(section.sectionCode, hasScheduleConflict(section, calendarEvents));
        }

        return conflicts;
    }, [calendarEvents, courseDetails.sections]);

    const updateCalendarEvents = useCallback(() => {
        setCalendarEvents(AppStore.getCourseEventsInCalendar());
    }, []);

    useEffect(() => {
        AppStore.on('addedCoursesChange', updateCalendarEvents);
        AppStore.on('currentScheduleIndexChange', updateCalendarEvents);

        return () => {
            AppStore.removeListener('addedCoursesChange', updateCalendarEvents);
            AppStore.removeListener('currentScheduleIndexChange', updateCalendarEvents);
        };
    }, [updateCalendarEvents]);

    return (
        <TableBody>
            {courseDetails.sections.map((section) => (
                <SectionTableBodyRow
                    key={section.sectionCode}
                    section={section}
                    courseDetails={courseDetails}
                    term={term}
                    allowHighlight={allowHighlight}
                    scheduleNames={scheduleNames}
                    scheduleConflict={sectionConflicts.get(section.sectionCode) ?? false}
                    analyticsCategory={analyticsCategory}
                    formattedTime={formattedTime}
                    activeColumns={activeColumns}
                />
            ))}
        </TableBody>
    );
});

SectionTableBody.displayName = 'SectionTableBody';
