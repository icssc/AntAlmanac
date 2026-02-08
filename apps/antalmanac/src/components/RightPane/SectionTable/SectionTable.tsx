import { Assessment, Route, ShowChart as ShowChartIcon } from '@mui/icons-material';
import { Alert, Box, Paper, Table, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useMemo } from 'react';

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
import { useTabStore } from '$stores/TabStore';
import { useTimeFormatStore } from '$stores/SettingsStore';

const TOTAL_NUM_COLUMNS = SECTION_TABLE_COLUMNS.length;

interface TableHeaderColumnDetails {
    label: string;
    width?: string;
}

const tableHeaderColumns: Record<Exclude<SectionTableColumn, 'action'>, TableHeaderColumnDetails> = {
    sectionCode: {
        label: 'Code',
        width: '8%',
    },
    sectionDetails: {
        label: 'Type',
        width: '8%',
    },
    instructors: {
        label: 'Instructors',
        width: '15%',
    },
    gpa: {
        label: 'GPA',
        width: '5%',
    },
    dayAndTime: {
        label: 'Times',
        width: '15%',
    },
    location: {
        label: 'Places',
        width: '8%',
    },
    sectionEnrollment: {
        label: 'Enrollment',
        width: '9%',
    },
    restrictions: {
        label: 'Restr',
        width: '8%',
    },
    status: {
        label: 'Status',
        width: '8%',
    },
    syllabus: {
        label: 'Syllabus',
        width: '8%',
    },
};
const tableHeaderColumnEntries = Object.entries(tableHeaderColumns);

function SectionTable(props: SectionTableProps) {
    const { courseDetails, term, allowHighlight, scheduleNames, analyticsCategory, missingSections = [] } = props;
    const { isMilitaryTime } = useTimeFormatStore()

    const [activeColumns] = useColumnStore((store) => [store.activeColumns]);
    const [activeTab] = useTabStore((store) => [store.activeTab]);
    const isMobile = useIsMobile();

    const courseId = useMemo(() => {
        return courseDetails.deptCode.replaceAll(' ', '') + courseDetails.courseNumber;
    }, [courseDetails.deptCode, courseDetails.courseNumber]);

    const formattedTime = useMemo(() => {
        if (!courseDetails.updatedAt) return null;
        const date = new Date(courseDetails.updatedAt);
        return isNaN(date.getTime())
            ? null
            : date.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: !isMilitaryTime,
            });
    }, [courseDetails.updatedAt, isMilitaryTime]);

    /**
     * Limit table width to force side scrolling.
     */
    const width = 920;
    const tableMinWidth = useMemo(() => {
        const numActiveColumns = activeColumns.length;
        return (width * numActiveColumns) / TOTAL_NUM_COLUMNS;
    }, [activeColumns]);

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
                            <TableCell
                                sx={{
                                    padding: 0,
                                    width: isMobile ? '6%' : '8%',
                                }}
                            />
                            {tableHeaderColumnEntries
                                .filter(([column]) => activeColumns.includes(column as SectionTableColumn))
                                .map(([column, { label, width }]) => (
                                    <TableCell
                                        key={column}
                                        sx={{
                                            width: width,
                                            padding: 0,
                                        }}
                                    >
                                        {label === 'Enrollment' && formattedTime ? <EnrollmentColumnHeader label={label} formattedTime={formattedTime}/> : label}
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
                    />
                </Table>
            </TableContainer>
        </>
    );
}

export default SectionTable;
