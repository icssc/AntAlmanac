import { TableRow, useTheme } from '@mui/material';
import type { CourseDetails, LarcAPIResponse } from '@packages/antalmanac-types';
// import { useCallback, useEffect, useMemo, useState } from 'react';

import { SectionActionCell } from '$components/RightPane/SectionTable/cells/section-action-cell';
import { SectionDayAndTimeCell } from '$components/RightPane/SectionTable/cells/section-day-and-time-cell';
import { SectionDetailsCell /*, SectionType*/ } from '$components/RightPane/SectionTable/cells/section-details-cell';
import { SectionInstructorsCell } from '$components/RightPane/SectionTable/cells/section-instructors-cell';
import { SectionLocationCell } from '$components/RightPane/SectionTable/cells/section-location-cell';
// import AppStore from '$stores/AppStore';
import { SectionTableCell } from '$components/RightPane/SectionTable/cells/section-table-cell';
import { useColumnStore, type SectionTableColumn } from '$stores/ColumnStore';
// import { useHoveredStore } from '$stores/HoveredStore';
// import { usePreviewStore, useThemeStore } from '$stores/SettingsStore';
// import { normalizeTime, parseDaysString } from '$stores/calendarizeHelpers';

interface SectionTableBodyProps {
    section: LarcAPIResponse['courses'][number]['sections'][number];
    courseDetails: CourseDetails;
    term: string;
    allowHighlight: boolean;
    scheduleNames: string[];
}

// type LarcTableColumn = Extract<
//     SectionTableColumn,
//     'action' | 'sectionDetails' | 'instructors' | 'dayAndTime' | 'location'
// >;

// These components have too varied of types, any is fine here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableBodyCells: Record<SectionTableColumn, React.ComponentType<any>> = {
    action: SectionActionCell,
    sectionCode: SectionTableCell,
    sectionDetails: SectionDetailsCell,
    instructors: SectionInstructorsCell,
    gpa: SectionTableCell,
    dayAndTime: SectionDayAndTimeCell,
    location: SectionLocationCell,
    sectionEnrollment: SectionTableCell,
    restrictions: SectionTableCell,
    status: SectionTableCell,
};

export default function LarcSectionTableBody(props: SectionTableBodyProps) {
    const { section, courseDetails, term, /*allowHighlight,*/ scheduleNames } = props;

    const theme = useTheme();
    // const isDark = useThemeStore((store) => store.isDark);
    const activeColumns = useColumnStore((store) => store.activeColumns);
    // const previewMode = usePreviewStore((store) => store.previewMode);

    // const [addedCourse, setAddedCourse] = useState(AppStore.getAddedLarcCourses().has(sectionId));

    // const [calendarEvents, setCalendarEvents] = useState(AppStore.getCourseEventsInCalendar());

    // /**
    //  * Additional information about the current section being rendered.
    //  * i.e. time information, which is compared with the calendar events to find conflicts.
    //  */
    // const sectionDetails = useMemo(() => {
    //     return {
    //         daysOccurring: parseDaysString(section.meetings[0].timeIsTBA ? null : section.meetings[0].days),
    //         ...normalizeTime(section.meetings[0]),
    //     };
    // }, [section.meetings]);

    // Stable references to event listeners will synchronize React state with the store.

    // const updateHighlight = useCallback(() => {
    //     setAddedCourse(AppStore.getAddedLarcCourses().has(sectionId));
    // }, [sectionId]);

    // const updateCalendarEvents = useCallback(() => {
    //     setCalendarEvents(AppStore.getCourseEventsInCalendar());
    // }, [setCalendarEvents]);

    // const [hoveredEvents, setHoveredEvents] = useHoveredStore((store) => [store.hoveredEvents, store.setHoveredEvents]);

    // const alreadyHovered = useMemo(() => {
    //     return hoveredEvents?.some((scheduleCourse) => scheduleCourse.section.sectionCode == section.sectionCode);
    // }, [hoveredEvents, section.sectionCode]);

    // const handleHover = useCallback(() => {
    //     if (!previewMode || alreadyHovered || addedCourse) {
    //         setHoveredEvents(undefined);
    //     } else {
    //         setHoveredEvents(section, courseDetails, term);
    //     }
    // }, [previewMode, alreadyHovered, addedCourse, setHoveredEvents, section, courseDetails, term]);

    // Attach event listeners to the store.
    // useEffect(() => {
    //     AppStore.on('addedCoursesChange', updateHighlight);
    //     AppStore.on('currentScheduleIndexChange', updateHighlight);

    //     return () => {
    //         AppStore.removeListener('addedCoursesChange', updateHighlight);
    //         AppStore.removeListener('currentScheduleIndexChange', updateHighlight);
    //     };
    // }, [updateHighlight]);

    // useEffect(() => {
    //     AppStore.on('addedCoursesChange', updateCalendarEvents);
    //     AppStore.on('currentScheduleIndexChange', updateCalendarEvents);

    //     return () => {
    //         AppStore.removeListener('addedCoursesChange', updateCalendarEvents);
    //         AppStore.removeListener('currentScheduleIndexChange', updateCalendarEvents);
    //     };
    // }, [updateCalendarEvents]);

    // /**
    //  * Whether the current section conflicts with any of the calendar events.
    //  */
    // const scheduleConflict = useMemo(() => {
    //     // If there are currently no calendar events, there can't be any conflicts.
    //     if (calendarEvents.length === 0) {
    //         return false;
    //     }

    //     // If the section's time wasn't parseable, then don't consider conflicts.
    //     if (sectionDetails.startTime == null || sectionDetails.endTime == null) {
    //         return false;
    //     }

    //     const { startTime, endTime } = sectionDetails;

    //     const conflictingEvent = calendarEvents.find((event) => {
    //         // If it occurs on a different day, no conflict.
    //         if (!sectionDetails?.daysOccurring?.includes(event.start.getDay())) {
    //             return false;
    //         }

    //         /**
    //          * A time normalized to ##:##
    //          * @example '10:00'
    //          */
    //         const eventStartTime = event.start.toString().split(' ')[4].slice(0, -3);

    //         /**
    //          * Normalized to ##:##
    //          * @example '10:00'
    //          */
    //         const eventEndTime = event.end.toString().split(' ')[4].slice(0, -3);

    //         const happensBefore = startTime <= eventStartTime && endTime <= eventStartTime;

    //         const happensAfter = startTime >= eventEndTime && endTime >= eventEndTime;

    //         return !(happensBefore || happensAfter);
    //     });

    //     return Boolean(conflictingEvent);
    // }, [calendarEvents, sectionDetails]);

    // /* allowHighlight is always false on CourseRenderPane and always true on AddedCoursePane */
    // const computedAddedCourseStyle = allowHighlight
    //     ? isDark
    //         ? { background: '#b0b04f' }
    //         : { background: '#fcfc97' }
    //     : {};
    // const computedScheduleConflictStyle = scheduleConflict
    //     ? isDark
    //         ? { background: '#121212', opacity: '0.6' }
    //         : { background: '#a0a0a0', opacity: '1' }
    //     : {};

    // const computedRowStyle = addedCourse ? computedAddedCourseStyle : computedScheduleConflictStyle;

    return (
        <TableRow
            sx={{
                // ...computedRowStyle,
                '&:nth-of-type(odd)': {
                    backgroundColor: theme.palette.action.hover,
                },
            }}
            // onMouseEnter={handleHover}
            // onMouseLeave={handleHover}
        >
            {Object.entries(tableBodyCells)
                .filter(([column]) => activeColumns.includes(column as SectionTableColumn))
                .map(([column, Component]) => {
                    return (
                        <Component
                            // addedCourse={addeCourse}
                            key={column}
                            section={section}
                            courseDetails={courseDetails}
                            term={term}
                            // scheduleConflict={scheduleConflict}
                            scheduleNames={scheduleNames}
                            {...section}
                            sectionType={'Larc'}
                            // maxCapacity={parseInt(section.maxCapacity, 10)}
                            // units={parseFloat(section.units)}
                            courseName={`${courseDetails.deptCode} ${courseDetails.courseNumber}`}
                            {...courseDetails}
                        />
                    );
                })}
        </TableRow>
    );
}
