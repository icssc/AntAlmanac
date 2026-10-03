import { SectionTableBodyRowCell } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyRowCells';
import { SectionTableBodyRowColorStrip } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyRowColorStrip';
import { type AnalyticsCategory } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { useColumnStore } from '$stores/ColumnStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { scheduleSectionKey } from '$stores/scheduleHelpers';
import { usePreviewStore } from '$stores/SettingsStore';
import { TableRow } from '@mui/material';
import { type AACourseWithTerm, type AASection } from '@packages/antalmanac-types';
import { memo, useCallback, useEffect, useState } from 'react';

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

    return (
        <TableRow
            sx={(theme) => ({
                '&:nth-of-type(odd)': {
                    backgroundColor: theme.vars.palette.action.hover,
                },
                ...(addedCourse &&
                    allowHighlight && {
                        '&&': {
                            backgroundColor: '#fcfc97',
                            ...theme.applyStyles('dark', {
                                backgroundColor: '#b0b04fa0',
                            }),
                        },
                    }),
                ...(!addedCourse &&
                    scheduleConflict && {
                        '&&': {
                            backgroundColor: '#a0a0a0',
                            opacity: 1,
                            ...theme.applyStyles('dark', {
                                backgroundColor: '#121212',
                                opacity: 0.6,
                            }),
                        },
                    }),
            })}
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
