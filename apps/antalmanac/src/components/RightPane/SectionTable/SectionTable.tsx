import {
    Box,
    Paper,
    Table,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@material-ui/core';
import { Assessment, Help, RateReview, ShowChart as ShowChartIcon } from '@material-ui/icons';
import { useMemo } from 'react';

import { MOBILE_BREAKPOINT } from '../../../globals';

import { EnrollmentHistoryPopup } from './EnrollmentHistoryPopup';
import GradesPopup from './GradesPopup';
import { SectionTableProps } from './SectionTable.types';

import { CourseInfoBar } from '$components/RightPane/SectionTable/CourseInfo/CourseInfoBar';
import { CourseInfoButton } from '$components/RightPane/SectionTable/CourseInfo/CourseInfoButton';
import { CourseInfoSearchButton } from '$components/RightPane/SectionTable/CourseInfo/CourseInfoSearchButton';
import { SectionTableBody } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBody';
import analyticsEnum from '$lib/analytics';
import { useColumnStore, SECTION_TABLE_COLUMNS, type SectionTableColumn } from '$stores/ColumnStore';
import { useTabStore } from '$stores/TabStore';

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
        width: '13%',
    },
    gpa: {
        label: 'GPA',
        width: '6%',
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
};
const tableHeaderColumnEntries = Object.entries(tableHeaderColumns);

interface EnrollmentColumnHeaderProps {
    label: string;
}

function EnrollmentColumnHeader(props: EnrollmentColumnHeaderProps) {
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT})`);

    return (
        <Box display="flex">
            {props.label}
            {!isMobileScreen && (
                <Tooltip
                    title={
                        <Typography>
                            Enrolled/Capacity
                            <br />
                            Waitlist
                            <br />
                            New-Only Reserved
                        </Typography>
                    }
                >
                    <Help fontSize="small" />
                </Tooltip>
            )}
        </Box>
    );
}

function SectionTable(props: SectionTableProps) {
    const { courseDetails, term, allowHighlight, scheduleNames, analyticsCategory } = props;

    const [activeColumns] = useColumnStore((store) => [store.activeColumns]);
    const [activeTab] = useTabStore((store) => [store.activeTab]);
    const isMobileScreen = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT})`);

    const courseId = useMemo(() => {
        return courseDetails.deptCode.replaceAll(' ', '') + courseDetails.courseNumber;
    }, [courseDetails.deptCode, courseDetails.courseNumber]);

    /**
     * Limit table width to force side scrolling.
     */
    const tableMinWidth = useMemo(() => {
        const width = isMobileScreen ? 600 : 780;
        const numActiveColumns = activeColumns.length;
        return (width * numActiveColumns) / TOTAL_NUM_COLUMNS;
    }, [isMobileScreen, activeColumns]);

    return (
        <>
            <Box style={{ display: 'flex', gap: 4, marginTop: 4, marginBottom: 8 }}>
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
                    text="Reviews"
                    icon={<RateReview />}
                    redirectLink={`https://peterportal.org/course/${courseId}`}
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
                            isMobileScreen={isMobileScreen}
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

            <TableContainer component={Paper} style={{ margin: '8px 0px 8px 0px' }} elevation={0} variant="outlined">
                <Table size="small" style={{ minWidth: `${tableMinWidth}px` }}>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="none" />

                            {tableHeaderColumnEntries
                                .filter(([column]) => activeColumns.includes(column as SectionTableColumn))
                                .map(([column, { label, width }]) => (
                                    <TableCell
                                        key={column}
                                        padding="none"
                                        width={width}
                                        style={{ paddingRight: 0.5, paddingLeft: 0.5 }}
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
                    />
                </Table>
            </TableContainer>
        </>
    );
}

export default SectionTable;
