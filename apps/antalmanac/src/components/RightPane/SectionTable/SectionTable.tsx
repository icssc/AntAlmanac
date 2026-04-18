import { CourseInfoBar } from '$components/RightPane/SectionTable/CourseInfo/CourseInfoBar';
import { CourseInfoButton } from '$components/RightPane/SectionTable/CourseInfo/CourseInfoButton';
import { CourseInfoSearchButton } from '$components/RightPane/SectionTable/CourseInfo/CourseInfoSearchButton';
import { EnrollmentColumnHeader } from '$components/RightPane/SectionTable/EnrollmentColumnHeader';
import { EnrollmentHistoryPopup } from '$components/RightPane/SectionTable/EnrollmentHistoryPopup';
import GradesPopup from '$components/RightPane/SectionTable/GradesPopup';
import { SectionTableProps } from '$components/RightPane/SectionTable/SectionTable.types';
import { SectionTableBody } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBody';
import { useIsMobile } from '$hooks/useIsMobile';
import analyticsEnum from '$lib/analytics/analytics';
import { useColumnStore, SECTION_TABLE_COLUMNS, type SectionTableColumn } from '$stores/ColumnStore';
import { useTimeFormatStore } from '$stores/SettingsStore';
import { useTabStore } from '$stores/TabStore';
import { Assessment, Route, ShowChart as ShowChartIcon } from '@mui/icons-material';
import { Alert, Box, Paper, Table, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useMemo } from 'react';

const TOTAL_NUM_COLUMNS = SECTION_TABLE_COLUMNS.length;

/**
 * Columns either claim a fixed pixel width (`width`) or a share of the remaining
 * table width proportional to their `weight` relative to other weighted columns.
 */
type TableHeaderColumnDetails = { label: string; weight: number } | { label: string; width: string };

const ACTION_COLUMN_WIDTH_DESKTOP = '100px';
const ACTION_COLUMN_WIDTH_MOBILE = '72px';

function getTableHeaderColumns(isMobile: boolean): Record<SectionTableColumn, TableHeaderColumnDetails> {
    return {
        action: { label: '', width: isMobile ? ACTION_COLUMN_WIDTH_MOBILE : ACTION_COLUMN_WIDTH_DESKTOP },
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
}

function SectionTable(props: SectionTableProps) {
    const { courseDetails, term, allowHighlight, scheduleNames, analyticsCategory, missingSections = [] } = props;
    const { isMilitaryTime } = useTimeFormatStore();

    const [activeColumns] = useColumnStore((store) => [store.activeColumns]);
    const [activeTab] = useTabStore((store) => [store.activeTab]);
    const isMobile = useIsMobile();

    const courseId = useMemo(() => {
        return courseDetails.deptCode.replaceAll(' ', '') + courseDetails.courseNumber;
    }, [courseDetails.deptCode, courseDetails.courseNumber]);

    const formattedTime = useMemo(() => {
        if (!courseDetails.updatedAt) return null;
        const date = new Date(courseDetails.updatedAt);
        if (isNaN(date.getTime())) return null;
        const timeString = date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !isMilitaryTime,
        });
        return timeString.replace(/^0(\d)/, '$1');
    }, [courseDetails.updatedAt, isMilitaryTime]);

    /**
     * Limit table width to force side scrolling.
     */
    const width = 780;
    const tableMinWidth = useMemo(() => {
        const numActiveColumns = activeColumns.length;
        return (width * numActiveColumns) / TOTAL_NUM_COLUMNS;
    }, [activeColumns]);

    /**
     * Header cells to render, with their resolved CSS `width`.
     *
     * Columns that declare an explicit pixel `width` (e.g. the action column)
     * keep that width verbatim. The remaining table width is split among the
     * weighted columns proportional to each column's `weight`.
     */
    const visibleHeaderCells = useMemo(() => {
        const tableHeaderColumns = getTableHeaderColumns(isMobile);
        const visible = (
            Object.entries(tableHeaderColumns) as Array<[SectionTableColumn, TableHeaderColumnDetails]>
        ).filter(([column]) => activeColumns.includes(column));

        const fixedWidths = visible
            .map(([, details]) => ('width' in details ? details.width : null))
            .filter((w): w is string => w !== null);
        const remainingWidthExpr = fixedWidths.length > 0 ? `calc(100% - ${fixedWidths.join(' - ')})` : '100%';
        const totalWeight = visible.reduce((sum, [, details]) => sum + ('weight' in details ? details.weight : 0), 0);

        return visible.map(([column, details]) => {
            const width =
                'width' in details ? details.width : `calc(${remainingWidthExpr} * ${details.weight / totalWeight})`;
            return { column, label: details.label, width };
        });
    }, [activeColumns, isMobile]);

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '8px',
                    marginTop: '4px',
                }}
            >
                <CourseInfoBar
                    deptCode={courseDetails.deptCode}
                    courseTitle={courseDetails.courseTitle}
                    courseNumber={courseDetails.courseNumber}
                    prerequisiteLink={courseDetails.prerequisiteLink}
                    analyticsCategory={analyticsCategory}
                />

                {activeTab !== 2 ? null : <CourseInfoSearchButton courseDetails={courseDetails} term={term} />}

                <CourseInfoButton
                    analyticsCategory={analyticsCategory}
                    analyticsAction={analyticsEnum.classSearch.actions.CLICK_REVIEWS}
                    text="Planner"
                    icon={<Route />}
                    redirectLink={`https://antalmanac.com/planner/course/${encodeURIComponent(courseId)}`}
                />

                <CourseInfoButton
                    analyticsCategory={analyticsCategory}
                    analyticsAction={analyticsEnum.classSearch.actions.CLICK_ZOTISTICS}
                    text="Zotistics"
                    icon={<Assessment />}
                    popupContent={
                        <GradesPopup
                            deptCode={courseDetails.deptCode}
                            courseNumber={courseDetails.courseNumber}
                            isMobile={isMobile}
                        />
                    }
                />

                <CourseInfoButton
                    analyticsCategory={analyticsCategory}
                    analyticsAction={analyticsEnum.classSearch.actions.CLICK_PAST_ENROLLMENT}
                    text="Past Enrollment"
                    icon={<ShowChartIcon />}
                    popupContent={
                        <EnrollmentHistoryPopup
                            department={courseDetails.deptCode}
                            courseNumber={courseDetails.courseNumber}
                        />
                    }
                />
            </Box>

            {missingSections?.length > 0 && (
                <Alert
                    severity="warning"
                    sx={{
                        mb: 1,
                        '& .MuiAlert-message': {
                            display: 'flex',
                            alignItems: 'center',
                        },
                    }}
                >
                    Missing required sections: {missingSections.join(', ')}
                </Alert>
            )}
            <TableContainer
                component={Paper}
                sx={{ margin: '8px 0px 8px 0px', width: '100%' }}
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
                            {visibleHeaderCells.map(({ column, label, width }) => (
                                <TableCell
                                    key={column}
                                    sx={{
                                        width,
                                        padding: 0,
                                    }}
                                >
                                    {label === 'Enrollment' ? <EnrollmentColumnHeader label={label} /> : label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <SectionTableBody
                        courseDetails={courseDetails}
                        term={term}
                        allowHighlight={allowHighlight}
                        scheduleNames={scheduleNames}
                        analyticsCategory={analyticsCategory}
                        formattedTime={formattedTime}
                    />
                </Table>
            </TableContainer>
        </>
    );
}

export default SectionTable;
