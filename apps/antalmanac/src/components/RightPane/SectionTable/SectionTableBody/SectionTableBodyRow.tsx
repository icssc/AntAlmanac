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
import { SectionTableBodyRowColorStrip } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyRowColorStrip';
import { AnalyticsCategory } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { useColumnStore, type SectionTableColumn } from '$stores/ColumnStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { usePreviewStore, useThemeStore } from '$stores/SettingsStore';
import { TableRow, useTheme } from '@mui/material';
import { AASection, AATerm, CourseDetails } from '@packages/antalmanac-types';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { ActionCell } from './SectionTableBodyCells/action-cell/ActionCell';

interface SectionTableBodyRowProps {
    section: AASection;
    courseDetails: CourseDetails;
    term: AATerm;
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
    status: StatusCell,
    restrictions: RestrictionsCell,
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

    const [addedCourse, setAddedCourse] = useState(() =>
        AppStore.getAddedSectionCodes().has(`${section.sectionCode} ${term.shortName}`)
    );

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

    useEffect(() => {
        const sectionKey = `${section.sectionCode} ${term.shortName}`;

        const syncAddedCourse = () => {
            setAddedCourse(AppStore.getAddedSectionCodes().has(sectionKey));
        };

        syncAddedCourse();

        AppStore.on('addedCoursesChange', syncAddedCourse);
        AppStore.on('currentScheduleIndexChange', syncAddedCourse);

        return () => {
            AppStore.removeListener('addedCoursesChange', syncAddedCourse);
            AppStore.removeListener('currentScheduleIndexChange', syncAddedCourse);
        };
    }, [section.sectionCode, term]);

    const computedRowStyle = useMemo(() => {
        if (addedCourse) {
            /* allowHighlight is always false on CourseRenderPane and always true on AddedCoursePane */
            const computedAddedCourseStyle = allowHighlight
                ? isDark
                    ? { backgroundColor: '#b0b04fa0' }
                    : { backgroundColor: '#fcfc97' }
                : {};

            return computedAddedCourseStyle;
        }

        if (scheduleConflict) {
            const computedScheduleConflictStyle = isDark
                ? { backgroundColor: '#121212', opacity: '0.6' }
                : { backgroundColor: '#a0a0a0', opacity: '1' };

            return computedScheduleConflictStyle;
        }

        return {};
    }, [addedCourse, allowHighlight, isDark, scheduleConflict]);

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
            <SectionTableBodyRowColorStrip section={section} term={term} visible={addedCourse} />

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
