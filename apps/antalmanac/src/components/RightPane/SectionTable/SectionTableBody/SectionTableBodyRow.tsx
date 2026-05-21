import { changeCourseColor } from '$actions/AppStoreActions';
import { SectionRowColorStrip } from '$components/RightPane/SectionTable/SectionTableBody/SectionRowColorStrip';
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
import { useIsMobile } from '$hooks/useIsMobile';
import { AnalyticsCategory } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { useColumnStore, type SectionTableColumn } from '$stores/ColumnStore';
import { useHoveredStore } from '$stores/HoveredStore';
import { colorPickerPresetColors } from '$stores/scheduleHelpers';
import { usePreviewStore, useThemeStore } from '$stores/SettingsStore';
import { Popover, PopoverProps, TableRow, useTheme } from '@mui/material';
import { AASection, AATerm, CourseDetails } from '@packages/antalmanac-types';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { SketchPicker } from 'react-color';

import { ActionCell } from './SectionTableBodyCells/action-cell/ActionCell';

function getSectionScheduleColor(section: AASection, term: AATerm): string {
    return (
        AppStore.schedule.getExistingCourseInSchedule(section.sectionCode, term)?.section.color ??
        section.color ??
        '#5ec8e0'
    );
}

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
    const isMobile = useIsMobile();
    const isDark = useThemeStore((store) => store.isDark);
    const activeColumns = useColumnStore((store) => store.activeColumns);
    const previewMode = usePreviewStore((store) => store.previewMode);
    const setHoveredEvent = useHoveredStore((store) => store.setHoveredEvent);

    const [addedCourse, setAddedCourse] = useState(
        AppStore.getAddedSectionCodes().has(`${section.sectionCode} ${term.shortName}`)
    );

    const [currColor, setCurrColor] = useState(() => getSectionScheduleColor(section, term));
    const [colorPopoverAnchorEl, setColorPopoverAnchorEl] = useState<PopoverProps['anchorEl']>(null);

    const updateColorFromPicker = useCallback((newColor: string) => {
        setCurrColor(newColor);
    }, []);

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

    const handleColorStripOpenPicker = useCallback((anchorEl: HTMLElement) => {
        setColorPopoverAnchorEl((prev) => (prev === anchorEl ? null : anchorEl));
    }, []);

    const handleColorPopoverClose = useCallback(() => {
        setColorPopoverAnchorEl(null);
    }, []);

    const handleColorChange = useCallback(
        (newColor: { hex: string }) => {
            setCurrColor(newColor.hex);
            changeCourseColor(section.sectionCode, term, newColor.hex);
        },
        [section.sectionCode, term]
    );

    useEffect(() => {
        const sectionKey = `${section.sectionCode} ${term.shortName}`;

        const syncAddedCourse = () => {
            setAddedCourse(AppStore.getAddedSectionCodes().has(sectionKey));
        };
        const syncColor = () => {
            setCurrColor(getSectionScheduleColor(section, term));
        };
        const syncFromScheduleChanges = () => {
            syncAddedCourse();
            syncColor();
        };

        syncFromScheduleChanges();

        AppStore.on('addedCoursesChange', syncFromScheduleChanges);
        AppStore.on('currentScheduleIndexChange', syncFromScheduleChanges);
        AppStore.on('colorChange', syncColor);

        return () => {
            AppStore.removeListener('addedCoursesChange', syncFromScheduleChanges);
            AppStore.removeListener('currentScheduleIndexChange', syncFromScheduleChanges);
            AppStore.removeListener('colorChange', syncColor);
        };
    }, [section.sectionCode, section.color, term]);

    useEffect(() => {
        if (!addedCourse) {
            return;
        }
        AppStore.registerColorPicker(section.sectionCode, updateColorFromPicker);
        return () => {
            AppStore.unregisterColorPicker(section.sectionCode, updateColorFromPicker);
        };
    }, [addedCourse, section.sectionCode, updateColorFromPicker]);

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
            <SectionRowColorStrip
                color={currColor}
                visible={addedCourse}
                clickable={!isMobile && addedCourse}
                onOpenPicker={handleColorStripOpenPicker}
            />
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
            {!isMobile && addedCourse && (
                <Popover
                    open={Boolean(colorPopoverAnchorEl)}
                    anchorEl={colorPopoverAnchorEl}
                    onClose={handleColorPopoverClose}
                    onClick={(e) => e.stopPropagation()}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <SketchPicker
                        color={currColor}
                        onChange={handleColorChange}
                        presetColors={colorPickerPresetColors}
                    />
                </Popover>
            )}
        </TableRow>
    );
});

SectionTableBodyRow.displayName = 'SectionTableBodyRow';
