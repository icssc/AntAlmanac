import { TableRow, useTheme } from '@mui/material';
import { AASection, CourseDetails } from '@packages/antalmanac-types';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { ActionCell } from './SectionTableBodyCells/action-cell/ActionCell';

import { DayAndTimeCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/DayAndTimeCell';
import { DetailsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/DetailsCell';
import { EnrollmentCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/EnrollmentCell';
import { GpaCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/GpaCell';
import { InstructorsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/InstructorsCell';
import { LocationsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/LocationsCell';
import { RestrictionsCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/RestrictionsCell';
import { SectionCodeCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/SectionCodeCell';
import { StatusCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/StatusCell';
import { SyllabusCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/SyllabusCell';
import { AnalyticsCategory } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { useColumnStore, type SectionTableColumn } from '$stores/ColumnStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { usePreviewStore, useThemeStore } from '$stores/SettingsStore';

interface SectionTableBodyRowProps {
    section: AASection;
    courseDetails: CourseDetails;
    term: string;
    allowHighlight: boolean;
    scheduleNames: string[];
    scheduleConflict: boolean;
    analyticsCategory: AnalyticsCategory;
    formattedTime: string | null;
}

// These components have too varied of types, any is fine here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableBodyCells: Record<SectionTableColumn, React.ComponentType<any>> = {
    action: ActionCell,
    sectionCode: SectionCodeCell,
    sectionDetails: DetailsCell,
    instructors: InstructorsCell,
    gpa: GpaCell,
    dayAndTime: DayAndTimeCell,
    location: LocationsCell,
    sectionEnrollment: EnrollmentCell,
    restrictions: RestrictionsCell,
    status: StatusCell,
    syllabus: SyllabusCell,
};

export const SectionTableBodyRow = memo((props: SectionTableBodyRowProps) => {
    const {
        section,
        courseDetails,
        term,
        allowHighlight,
        scheduleNames,
        scheduleConflict,
        analyticsCategory,
        formattedTime,
    } = props;

    const theme = useTheme();
    const isDark = useThemeStore((store) => store.isDark);
    const activeColumns = useColumnStore((store) => store.activeColumns);
    const previewMode = usePreviewStore((store) => store.previewMode);
    const setHoveredEvent = useHoveredStore((store) => store.setHoveredEvent);

    const [addedCourse, setAddedCourse] = useState(
        AppStore.getAddedSectionCodes().has(`${section.sectionCode} ${term}`)
    );

    // Stable references to event listeners will synchronize React state with the store.

    const updateHighlight = useCallback(() => {
        setAddedCourse(AppStore.getAddedSectionCodes().has(`${section.sectionCode} ${term}`));
    }, [section.sectionCode, term]);

    const handleMouseEnter = useCallback(() => {
        if (!previewMode || addedCourse) {
            setHoveredEvent(undefined);
        } else {
            setHoveredEvent(section, courseDetails, term);
        }
    }, [previewMode, addedCourse, setHoveredEvent, section, courseDetails, term]);

    const handleMouseLeave = useCallback(() => {
        setHoveredEvent(undefined);
    }, [setHoveredEvent]);

    // Attach event listeners to the store.
    useEffect(() => {
        AppStore.on('addedCoursesChange', updateHighlight);
        AppStore.on('currentScheduleIndexChange', updateHighlight);

        return () => {
            AppStore.removeListener('addedCoursesChange', updateHighlight);
            AppStore.removeListener('currentScheduleIndexChange', updateHighlight);
        };
    }, [updateHighlight]);

    const computedRowStyle = useMemo(() => {
        if (addedCourse) {
            /* allowHighlight is always false on CourseRenderPane and always true on AddedCoursePane */
            const computedAddedCourseStyle = allowHighlight
                ? isDark
                    ? { backgroundColor: '#b0b04f' }
                    : { backgroundColor: '#fcfc97' }
                : {};

            return computedAddedCourseStyle;
        }

        if (scheduleConflict) {
            const computedScheduleConflictStyle = scheduleConflict
                ? isDark
                    ? { backgroundColor: '#121212', opacity: '0.6' }
                    : { backgroundColor: '#a0a0a0', opacity: '1' }
                : {};

            return computedScheduleConflictStyle;
        }

        return {};
    }, [allowHighlight, isDark, scheduleConflict, addedCourse]);

    return (
        <TableRow
            /**
             * CSS errors occur when combining the `nth-of-type` selector with the computed styling, so it's split into two separate props
             */
            sx={{
                '&:nth-of-type(odd)': {
                    backgroundColor: theme.palette.action.hover,
                },
            }}
            style={computedRowStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {Object.entries(tableBodyCells)
                .filter(([column]) => activeColumns.includes(column as SectionTableColumn))
                .map(([column, Component]) => {
                    return (
                        <Component
                            addedCourse={addedCourse}
                            key={column}
                            section={section}
                            courseDetails={courseDetails}
                            term={term}
                            scheduleConflict={scheduleConflict}
                            scheduleNames={scheduleNames}
                            {...section}
                            sectionType={section.sectionType}
                            maxCapacity={parseInt(section.maxCapacity, 10)}
                            units={parseFloat(section.units)}
                            courseName={`${courseDetails.deptCode} ${courseDetails.courseNumber}`}
                            {...courseDetails}
                            analyticsCategory={analyticsCategory}
                            formattedTime={formattedTime}
                        />
                    );
                })}
        </TableRow>
    );
});

SectionTableBodyRow.displayName = 'SectionTableBodyRow';
