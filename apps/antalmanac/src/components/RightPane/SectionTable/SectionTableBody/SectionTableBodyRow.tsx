import { TableRow, useTheme } from '@mui/material';
import { AASection, CourseDetails } from '@packages/antalmanac-types';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { SectionActionCell } from '$components/RightPane/SectionTable/cells/section-action-cell';
import { SectionCourseCodeCell } from '$components/RightPane/SectionTable/cells/section-course-code-cell';
import { SectionDayAndTimeCell } from '$components/RightPane/SectionTable/cells/section-day-and-time-cell';
import { SectionDetailsCell, SectionType } from '$components/RightPane/SectionTable/cells/section-details-cell';
import { SectionEnrollmentCell } from '$components/RightPane/SectionTable/cells/section-enrollment-cell';
import { SectionGPACell } from '$components/RightPane/SectionTable/cells/section-gpa-cell';
import { SectionInstructorsCell } from '$components/RightPane/SectionTable/cells/section-instructors-cell';
import { SectionLocationCell } from '$components/RightPane/SectionTable/cells/section-location-cell';
import { SectionRestrictionsCell } from '$components/RightPane/SectionTable/cells/section-restrictions-cell';
import { SectionStatusCell } from '$components/RightPane/SectionTable/cells/section-status-cell';
import AppStore from '$stores/AppStore';
import { useColumnStore, type SectionTableColumn } from '$stores/ColumnStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { usePreviewStore, useThemeStore } from '$stores/SettingsStore';

interface SectionTableBodyProps {
    section: AASection;
    courseDetails: CourseDetails;
    term: string;
    allowHighlight: boolean;
    scheduleNames: string[];
    scheduleConflict: boolean;
}

// These components have too varied of types, any is fine here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableBodyCells: Record<SectionTableColumn, React.ComponentType<any>> = {
    action: SectionActionCell,
    sectionCode: SectionCourseCodeCell,
    sectionDetails: SectionDetailsCell,
    instructors: SectionInstructorsCell,
    gpa: SectionGPACell,
    dayAndTime: SectionDayAndTimeCell,
    location: SectionLocationCell,
    sectionEnrollment: SectionEnrollmentCell,
    restrictions: SectionRestrictionsCell,
    status: SectionStatusCell,
};

export const SectionTableBodyRow = memo((props: SectionTableBodyProps) => {
    const { section, courseDetails, term, allowHighlight, scheduleNames, scheduleConflict } = props;

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
        /* allowHighlight is always false on CourseRenderPane and always true on AddedCoursePane */
        const computedAddedCourseStyle = allowHighlight
            ? isDark
                ? { background: '#b0b04f' }
                : { background: '#fcfc97' }
            : {};
        const computedScheduleConflictStyle = scheduleConflict
            ? isDark
                ? { background: '#121212', opacity: '0.6' }
                : { background: '#a0a0a0', opacity: '1' }
            : {};

        if (addedCourse) {
            return computedAddedCourseStyle;
        }

        if (scheduleConflict) {
            return computedScheduleConflictStyle;
        }

        return {};
    }, [allowHighlight, isDark, scheduleConflict, addedCourse]);

    return (
        <TableRow
            sx={{
                ...computedRowStyle,
                '&:nth-of-type(odd)': {
                    backgroundColor: theme.palette.action.hover,
                },
            }}
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
                            sectionType={section.sectionType as SectionType}
                            maxCapacity={parseInt(section.maxCapacity, 10)}
                            units={parseFloat(section.units)}
                            courseName={`${courseDetails.deptCode} ${courseDetails.courseNumber}`}
                            {...courseDetails}
                        />
                    );
                })}
        </TableRow>
    );
});

SectionTableBodyRow.displayName = 'SectionTableBodyRow';
