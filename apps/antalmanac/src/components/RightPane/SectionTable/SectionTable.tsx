import { SortableList } from '$components/drag-and-drop/SortableList';
import { CourseInfoBar } from '$components/RightPane/SectionTable/CourseInfo/CourseInfoBar';
import { CourseInfoButton } from '$components/RightPane/SectionTable/CourseInfo/CourseInfoButton';
import { CourseInfoSearchButton } from '$components/RightPane/SectionTable/CourseInfo/CourseInfoSearchButton';
import { EnrollmentColumnHeader } from '$components/RightPane/SectionTable/EnrollmentColumnHeader';
import { SectionTableBody } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBody';
import { PastSyllabiPopover } from '$components/RightPane/SectionTable/SectionTablePopover/PastSyllabiPopover';
import { WarningAlert } from '$components/WarningAlert';
import { useDraggingItemState } from '$hooks/useDraggingItemState';
import { useIsMobile } from '$hooks/useIsMobile';
import analyticsEnum, { AnalyticsCategory } from '$lib/analytics/analytics';
import { getCourseCancellationWarning } from '$lib/courseAvailability';
import { SECTION_TABLE_COLUMNS, type SectionTableColumn, useColumnStore } from '$stores/ColumnStore';
import { useTimeFormatStore } from '$stores/SettingsStore';
import { TAB_INDEX, useTabStore } from '$stores/TabStore';
import { ExpandLess, ExpandMore, HistoryEdu, Route } from '@mui/icons-material';
import {
    Box,
    Button,
    Collapse,
    IconButton,
    Paper,
    Skeleton,
    Table,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { AACourseWithTerm } from '@packages/antalmanac-types';
import { useMemo, useState } from 'react';
import { forceCheck } from 'react-lazyload';

const TOTAL_NUM_COLUMNS = SECTION_TABLE_COLUMNS.length;

interface TableHeaderColumnDetails {
    label: string;
    weight: number;
}

const tableHeaderColumns: Record<Exclude<SectionTableColumn, 'action'>, TableHeaderColumnDetails> = {
    sectionCode: { label: 'Code', weight: 5 },
    sectionDetails: { label: 'Type', weight: 5 },
    instructors: { label: 'Instructors', weight: 7 },
    gpa: { label: 'GPA', weight: 5 },
    dayAndTime: { label: 'Times', weight: 12 },
    location: { label: 'Places', weight: 7 },
    sectionEnrollment: { label: 'Enrollment', weight: 7 },
    status: { label: 'Status', weight: 5 },
    restrictions: { label: 'Restr', weight: 5 },
    syllabus: { label: 'Syllabus', weight: 5 },
};
const tableHeaderColumnEntries = Object.entries(tableHeaderColumns);

const wrapSkeleton = (children: React.ReactNode, skeleton: boolean) =>
    skeleton ? (
        <Skeleton variant="rounded" component="div" sx={{ pointerEvents: 'none' }}>
            {children}
        </Skeleton>
    ) : (
        children
    );

export interface SectionTableProps {
    course: AACourseWithTerm;
    allowHighlight: boolean;
    scheduleNames: string[];
    analyticsCategory: AnalyticsCategory;
    updatedAt?: string;
    sortable?: boolean;
    /**
     * Wraps each interactive element (each button, the table) in MUI's
     * children-aware Skeleton, so the component still renders at the
     * correct dimensions while displaying as a set of loading placeholders.
     */
    skeleton?: boolean;
    missingSections?: string[];
}

function SectionTable({
    course,
    allowHighlight,
    scheduleNames,
    analyticsCategory,
    sortable = false,
    skeleton = false,
    missingSections = [],
}: SectionTableProps) {
    const isMobile = useIsMobile();
    const draggingState = useDraggingItemState(() => ({ isCollapsed: !openContent }));

    const [openContent, setOpenContent] = useState(!draggingState?.isCollapsed);

    const isMilitaryTime = useTimeFormatStore((store) => store.isMilitaryTime);

    const activeColumns = useColumnStore((store) => store.activeColumns);
    const activeTab = useTabStore((store) => store.activeTab);

    const handleToggleExpand = () => {
        setOpenContent(!openContent);
    };

    const handleCollapseExit = () => {
        forceCheck();
    };

    const colorStripWidth = isMobile ? 5 : 8;
    const actionColumnWidth = 77;

    const formattedTime = useMemo(() => {
        if (!course.updatedAt) {
            return null;
        }

        const date = new Date(course.updatedAt);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        const timeString = date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !isMilitaryTime,
        });

        return timeString.replace(/^0(\d)/, '$1');
    }, [course.updatedAt, isMilitaryTime]);

    /**
     * Limit table width to force side scrolling.
     */
    const width = 780;
    const tableMinWidth = useMemo(() => {
        const numActiveColumns = activeColumns.length;
        return (width * numActiveColumns) / TOTAL_NUM_COLUMNS;
    }, [activeColumns]);

    const cancellationWarning = useMemo(() => getCourseCancellationWarning(course.sections), [course.sections]);

    return (
        <Box sx={{ overflow: 'hidden' }}>
            <Box
                sx={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '8px',
                    marginTop: '4px',
                }}
            >
                {sortable
                    ? wrapSkeleton(
                          <Button
                              variant="contained"
                              color="secondary"
                              sx={{
                                  padding: 0,
                                  minWidth: 0,
                                  minHeight: 0,
                                  cursor: 'inherit',
                                  flexShrink: 0,
                              }}
                          >
                              <SortableList.DragHandle sx={{ height: '100%' }} iconSx={{ color: 'inherit' }} />
                          </Button>,
                          skeleton
                      )
                    : null}

                {wrapSkeleton(
                    <CourseInfoBar
                        deptCode={course.deptCode}
                        courseTitle={course.courseTitle}
                        courseNumber={course.courseNumber}
                        prerequisiteLink={course.prerequisiteLink}
                        analyticsCategory={analyticsCategory}
                    />,
                    skeleton
                )}

                {activeTab !== TAB_INDEX.added
                    ? null
                    : wrapSkeleton(<CourseInfoSearchButton course={course} />, skeleton)}

                {wrapSkeleton(
                    <CourseInfoButton
                        analyticsCategory={analyticsCategory}
                        analyticsAction={analyticsEnum.classSearch.actions.CLICK_REVIEWS}
                        text="Planner"
                        icon={<Route />}
                        redirectLink={`https://antalmanac.com/planner/course/${encodeURIComponent(course.courseId)}`}
                    />,
                    skeleton
                )}

                {wrapSkeleton(
                    <CourseInfoButton
                        analyticsCategory={analyticsCategory}
                        analyticsAction={analyticsEnum.classSearch.actions.CLICK_PAST_SYLLABI}
                        text="Past Syllabi"
                        icon={<HistoryEdu />}
                        popupContent={
                            <PastSyllabiPopover deptCode={course.deptCode} courseNumber={course.courseNumber} />
                        }
                    />,
                    skeleton
                )}

                {skeleton ? (
                    <Skeleton variant="circular" component="div" sx={{ ml: 'auto', mr: 0.5, pointerEvents: 'none' }}>
                        <IconButton size="small" sx={{ padding: '4px' }}>
                            <ExpandLess />
                        </IconButton>
                    </Skeleton>
                ) : (
                    <IconButton
                        title={`${openContent ? 'Collapse' : 'Expand'} courses`}
                        onClick={handleToggleExpand}
                        size="small"
                        sx={{ padding: '4px', marginLeft: 'auto', marginRight: 0.5 }}
                    >
                        {openContent ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                )}
            </Box>

            {cancellationWarning && <WarningAlert>{cancellationWarning}</WarningAlert>}

            {missingSections.length && (
                <WarningAlert>Missing required sections: {missingSections.join(', ')}</WarningAlert>
            )}

            <Collapse in={openContent} onExited={handleCollapseExit}>
                {wrapSkeleton(
                    <TableContainer
                        component={Paper}
                        sx={{ margin: '0px 0px 8px 0px', width: '100%' }}
                        elevation={0}
                        variant="outlined"
                    >
                        <Table
                            size="small"
                            sx={{
                                minWidth: `${tableMinWidth}px`,
                                width: '100%',
                                tableLayout: 'fixed',
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ padding: 0, width: `${colorStripWidth}px` }} />
                                    <TableCell sx={{ padding: 0, width: `${actionColumnWidth}px` }} />
                                    {(() => {
                                        const visible = tableHeaderColumnEntries.filter(([column]) =>
                                            activeColumns.includes(column as SectionTableColumn)
                                        );
                                        const totalWeight = visible.reduce((sum, [, { weight }]) => sum + weight, 0);
                                        return visible.map(([column, { label, weight }]) => (
                                            <TableCell
                                                key={column}
                                                sx={{
                                                    width: `${(weight / totalWeight) * 100}%`,
                                                    padding: 0,
                                                }}
                                            >
                                                {label === 'Enrollment' ? (
                                                    <EnrollmentColumnHeader label={label} />
                                                ) : (
                                                    label
                                                )}
                                            </TableCell>
                                        ));
                                    })()}
                                </TableRow>
                            </TableHead>

                            <SectionTableBody
                                course={course}
                                allowHighlight={allowHighlight}
                                scheduleNames={scheduleNames}
                                analyticsCategory={analyticsCategory}
                                formattedTime={formattedTime}
                            />
                        </Table>
                    </TableContainer>,
                    skeleton
                )}
            </Collapse>
        </Box>
    );
}

export default SectionTable;
