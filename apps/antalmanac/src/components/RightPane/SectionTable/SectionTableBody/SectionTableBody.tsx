import { TableBody } from '@mui/material';
import { AACourse, AASection } from '@packages/antalmanac-types';
import { useCallback, useEffect, useState } from 'react';

import { SectionTableBodyRow } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyRow';
import AppStore from '$stores/AppStore';
import { normalizeTime, parseDaysString } from '$stores/calendarizeHelpers';

interface SectionTableBodyProps {
    courseDetails: AACourse;
    term: string;
    scheduleNames: string[];
    allowHighlight: boolean;
}

export function SectionTableBody({ courseDetails, term, scheduleNames, allowHighlight }: SectionTableBodyProps) {
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

    return (
        <TableBody>
            {courseDetails.sections.map((section) => {
                const conflict = scheduleConflict(section);

                return (
                    <SectionTableBodyRow
                        key={section.sectionCode}
                        section={section}
                        currentStatus={section.status}
                        currentRestrictions={section.restrictions}
                        courseDetails={courseDetails}
                        term={term}
                        allowHighlight={allowHighlight}
                        scheduleNames={scheduleNames}
                        scheduleConflict={conflict}
                    />
                );
            })}
        </TableBody>
    );
}
