import { SectionTableBodyRowCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyRowCells';
import { SectionTableBodyRowColorStrip } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyRowColorStrip';
import { useIsDarkMode } from '$hooks/useIsDarkMode';
import { type AnalyticsCategory } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { useColumnStore } from '$stores/ColumnStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { scheduleSectionKey } from '$stores/scheduleHelpers';
import { usePreviewStore } from '$stores/SettingsStore';
import { TableRow } from '@mui/material';
import { type AASection, type AACourseWithTerm } from '@packages/antalmanac-types';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

interface SectionTableBodyRowProps {
    section: AASection;
    course: AACourseWithTerm;
    allowHighlight: boolean;
    scheduleNames: string[];
    scheduleConflict: boolean;
    analyticsCategory: AnalyticsCategory;
}

export const SectionTableBodyRow = memo((props: SectionTableBodyRowProps) => {
    const { section, course, allowHighlight, scheduleNames, scheduleConflict, analyticsCategory } = props;

    const isDark = useIsDarkMode();
    const activeColumns = useColumnStore((store) => store.activeColumns);
    const previewMode = usePreviewStore((store) => store.previewMode);
    const setHoveredEvent = useHoveredStore((store) => store.setHoveredEvent);

    const [addedCourse, setAddedCourse] = useState(() =>
        AppStore.getAddedSectionCodes().has(scheduleSectionKey(course.term, section.sectionCode))
    );

    const handleMouseEnter = useCallback(() => {
        if (!previewMode || addedCourse) {
            setHoveredEvent(undefined);
        } else {
            setHoveredEvent(section, course);
        }
    }, [previewMode, addedCourse, setHoveredEvent, section, course]);

    const handleMouseLeave = useCallback(() => {
        setHoveredEvent(undefined);
    }, [setHoveredEvent]);

    useEffect(() => {
        const sectionKey = scheduleSectionKey(course.term, section.sectionCode);

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
    }, [section.sectionCode, course.term]);

    const computedRowStyle = useMemo(() => {
        if (addedCourse) {
            /* allowHighlight is always false on CourseRenderPane and always true on AddedCoursesRoot */
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
                    backgroundColor: (theme) => theme.vars.palette.action.hover,
                },
            }}
            style={computedRowStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <SectionTableBodyRowColorStrip section={section} term={course.term} visible={addedCourse} />

            {activeColumns.map((column) => (
                <SectionTableBodyRowCell
                    key={column}
                    column={column}
                    section={section}
                    course={course}
                    addedCourse={addedCourse}
                    scheduleConflict={scheduleConflict}
                    scheduleNames={scheduleNames}
                    analyticsCategory={analyticsCategory}
                />
            ))}
        </TableRow>
    );
});

SectionTableBodyRow.displayName = 'SectionTableBodyRow';
