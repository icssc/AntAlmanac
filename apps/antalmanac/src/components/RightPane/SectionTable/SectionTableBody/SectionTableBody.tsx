import { buildSectionConflictMap } from '$components/RightPane/SectionTable/SectionTableBody/helpers';
import { SectionTableBodyRow } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyRow';
import { AnalyticsCategory } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import type { SectionTableColumn } from '$stores/ColumnStore';
import { TableBody } from '@mui/material';
import { AACourse, AATerm } from '@packages/antalmanac-types';
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

export const SectionTableBody = memo(
    ({
        courseDetails,
        term,
        scheduleNames,
        allowHighlight,
        analyticsCategory,
        formattedTime,
        activeColumns,
    }: SectionTableBodyProps) => {
        const [calendarEvents, setCalendarEvents] = useState(() => AppStore.getCourseEventsInCalendar());

        const sectionConflicts = useMemo(
            () => buildSectionConflictMap(courseDetails.sections, calendarEvents),
            [calendarEvents, courseDetails.sections]
        );

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
    }
);

SectionTableBody.displayName = 'SectionTableBody';
